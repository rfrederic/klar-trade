import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

let stripe: Stripe | null = null;
function getStripe() {
  if (!stripe) stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return stripe;
}

const PLAN_PRICE_MAP: Record<string, { priceId: string; mode: Stripe.Checkout.SessionCreateParams.Mode }> = {
  trial:   { priceId: process.env.STRIPE_TRIAL_PRICE_ID   ?? "", mode: "payment"      },
  starter: { priceId: process.env.STRIPE_STARTER_PRICE_ID ?? "", mode: "subscription" },
  pro:     { priceId: process.env.STRIPE_PRO_PRICE_ID     ?? "", mode: "subscription" },
  elite:   { priceId: process.env.STRIPE_ELITE_PRICE_ID   ?? "", mode: "subscription" },
};

export async function POST(req: NextRequest) {
  const { plan, email } = await req.json();

  const entry = PLAN_PRICE_MAP[plan as string];
  if (!entry?.priceId) {
    return NextResponse.json({ error: "Invalid or unconfigured plan" }, { status: 400 });
  }

  // Try to get the logged-in user — not required
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();

  const origin = req.nextUrl.origin;
  const customerEmail = user?.email ?? email ?? undefined;

  // Authenticated users go straight to dashboard after payment.
  // Unauthenticated users go to register so they can create their account
  // and link it to the Stripe session.
  const successUrl = user
    ? `${origin}/dashboard?success=true`
    : `${origin}/register?session_id={CHECKOUT_SESSION_ID}`;

  const session = await getStripe().checkout.sessions.create({
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
}
