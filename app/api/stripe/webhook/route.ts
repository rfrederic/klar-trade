import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Payments disabled" }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
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
    const email   = session.metadata?.email ?? session.customer_details?.email ?? null;
    const priceId = session.line_items?.data[0]?.price?.id;
    const plan    = priceId ? planFromPriceId(priceId) : (session.metadata?.plan ?? null);

    if (!plan) {
      console.error("webhook: unrecognised priceId", { priceId });
      return NextResponse.json({ error: "Unprocessable" }, { status: 422 });
    }

    const profileData = {
      plan,
      trial_end: null,
      stripe_customer_id: (session.customer as string) ?? null,
      stripe_subscription_id: (session.subscription as string) ?? null,
    };

    if (userId) {
      // Authenticated checkout — update existing profile directly
      await supabase
        .from("profiles")
        .upsert({ id: userId, ...profileData }, { onConflict: "id" });
    } else if (email) {
      // Unauthenticated checkout — find user by email and update profile,
      // or create the Supabase user so they can log in after paying
      const { data: authData } = await supabase.auth.admin.listUsers();
      const existingUser = authData?.users?.find((u) => u.email === email);

      if (existingUser) {
        await supabase
          .from("profiles")
          .upsert({ id: existingUser.id, ...profileData }, { onConflict: "id" });
      } else {
        // Create Supabase account — user will receive a "set your password" link
        const { data: created } = await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { plan },
        });
        if (created?.user) {
          await supabase
            .from("profiles")
            .upsert({ id: created.user.id, ...profileData }, { onConflict: "id" });
          await supabase.auth.admin.generateLink({
            type: "magiclink",
            email,
            options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://klartrade.com"}/dashboard` },
          });
        }
      }
    } else {
      console.error("webhook: no userId or email to associate payment");
    }
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
