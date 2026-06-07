import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PLAN_PRICE_MAP: Record<string, { priceId: string; mode: Stripe.Checkout.SessionCreateParams.Mode }> = {
  trial:   { priceId: process.env.STRIPE_TRIAL_PRICE_ID   ?? "", mode: "payment"      },
  starter: { priceId: process.env.STRIPE_STARTER_PRICE_ID ?? "", mode: "subscription" },
  pro:     { priceId: process.env.STRIPE_PRO_PRICE_ID     ?? "", mode: "subscription" },
  elite:   { priceId: process.env.STRIPE_ELITE_PRICE_ID   ?? "", mode: "subscription" },
};

export async function POST(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await req.json();
  const entry = PLAN_PRICE_MAP[plan as string];
  if (!entry?.priceId) {
    return NextResponse.json({ error: "Invalid or unconfigured plan" }, { status: 400 });
  }

  const origin = req.nextUrl.origin;

  const session = await stripe.checkout.sessions.create({
    mode: entry.mode,
    line_items: [{ price: entry.priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?success=true`,
    cancel_url:  `${origin}/checkout`,
    metadata: { userId: user.id },
    client_reference_id: user.id,
  });

  return NextResponse.json({ url: session.url });
}
