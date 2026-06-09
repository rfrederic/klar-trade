import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PLAN_PRICE_MAP: Record<string, { priceId: string; mode: Stripe.Checkout.SessionCreateParams.Mode }> = {
  trial:   { priceId: process.env.STRIPE_TRIAL_PRICE_ID   ?? "", mode: "payment"      },
  starter: { priceId: process.env.STRIPE_STARTER_PRICE_ID ?? "", mode: "subscription" },
  pro:     { priceId: process.env.STRIPE_PRO_PRICE_ID     ?? "", mode: "subscription" },
  elite:   { priceId: process.env.STRIPE_ELITE_PRICE_ID   ?? "", mode: "subscription" },
};

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
    }

    const { plan, email } = await req.json();

    const entry = PLAN_PRICE_MAP[plan as string];
    if (!entry?.priceId) {
      return NextResponse.json({ error: "Invalid or unconfigured plan" }, { status: 400 });
    }

    // Try to get the logged-in user — not required
    let user = null;
    try {
      const authClient = await createServerClient();
      const { data } = await authClient.auth.getUser();
      user = data.user;
    } catch {
      // Not logged in — continue as guest
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = req.nextUrl.origin;
    const customerEmail = user?.email ?? (email as string | undefined) ?? undefined;

    // Logged-in users go to dashboard; guests go to register to create their account
    const successUrl = user
      ? `${origin}/dashboard?success=true`
      : `${origin}/register?session_id={CHECKOUT_SESSION_ID}`;

    const session = await stripe.checkout.sessions.create({
      mode: entry.mode,
      line_items: [{ price: entry.priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: `${origin}/checkout`,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      metadata: {
        plan,
        ...(user?.id ? { userId: user.id } : {}),
        ...(customerEmail ? { email: customerEmail } : {}),
      },
      ...(user?.id ? { client_reference_id: user.id } : {}),
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
