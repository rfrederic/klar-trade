import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Map Stripe price IDs → internal plan names
function planFromPriceId(priceId: string): string | null {
  const map: Record<string, string> = {
    [process.env.STRIPE_TRIAL_PRICE_ID   ?? ""]: "trial",
    [process.env.STRIPE_STARTER_PRICE_ID ?? ""]: "starter",
    [process.env.STRIPE_PRO_PRICE_ID     ?? ""]: "pro",
    [process.env.STRIPE_ELITE_PRICE_ID   ?? ""]: "elite",
  };
  return map[priceId] ?? null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signature verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createServiceClient();

  // ── checkout.session.completed ──────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = await stripe.checkout.sessions.retrieve(
      (event.data.object as Stripe.Checkout.Session).id,
      { expand: ["line_items"] }
    );

    const userId  = session.metadata?.userId;
    const priceId = session.line_items?.data[0]?.price?.id;
    const plan    = priceId ? planFromPriceId(priceId) : null;

    if (!userId || !plan) {
      console.error("webhook: missing userId or unrecognised priceId", { userId, priceId });
      return NextResponse.json({ error: "Unprocessable" }, { status: 422 });
    }

    await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          plan,
          trial_end: null,
          stripe_customer_id: session.customer as string ?? null,
          stripe_subscription_id: session.subscription as string ?? null,
        },
        { onConflict: "id" }
      );
  }

  // ── customer.subscription.deleted ──────────────────────────
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId   = subscription.customer as string;

    // Look up user by the customer ID we stored at checkout
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    if (profile?.id) {
      await supabase
        .from("profiles")
        .update({
          plan:      "trial",
          trial_end: new Date().toISOString(), // already expired → middleware redirects
        })
        .eq("id", profile.id);
    }
  }

  return NextResponse.json({ received: true });
}
