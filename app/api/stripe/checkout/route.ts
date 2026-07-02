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

    // Require authentication — guests must register first
    const authClient = await createServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please create an account before checking out." }, { status: 401 });
    }

    const { plan } = await req.json();
    const entry = PLAN_PRICE_MAP[plan as string];
    console.log("[stripe/checkout] userId:", user.id, "plan:", plan, "priceId:", entry?.priceId ?? "(missing)");

    if (!entry?.priceId) {
      return NextResponse.json({ error: "Invalid or unconfigured plan" }, { status: 400 });
    }

    const stripe  = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin  = req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode:       entry.mode,
      line_items: [{ price: entry.priceId, quantity: 1 }],
      // success_url hits our verify route which updates the profile synchronously
      // before redirecting to /dashboard — avoids webhook race condition
      success_url: `${origin}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/checkout`,
      customer_email:       user.email ?? undefined,
      client_reference_id:  user.id,
      metadata: {
        plan,
        userId: user.id,
        email:  user.email ?? "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
