import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function planFromPriceId(priceId: string): string | null {
  const map: Record<string, string> = {
    [process.env.STRIPE_TRIAL_PRICE_ID   ?? ""]: "trial",
    [process.env.STRIPE_STARTER_PRICE_ID ?? ""]: "starter",
    [process.env.STRIPE_PRO_PRICE_ID     ?? ""]: "pro",
    [process.env.STRIPE_ELITE_PRICE_ID   ?? ""]: "elite",
  };
  return map[priceId] ?? null;
}

// Called by Stripe success_url redirect — verifies payment and updates
// the user's profile synchronously before redirecting to /dashboard.
// This prevents the webhook race condition where the plan hasn't been
// set yet when the user first hits the dashboard.

export async function GET(req: NextRequest) {
  const origin    = req.nextUrl.origin;
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    console.error("[stripe/success] missing session_id");
    return NextResponse.redirect(new URL("/checkout", origin));
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    // Can't verify, but Stripe redirected here so payment likely succeeded.
    // Webhook will update the profile eventually.
    console.warn("[stripe/success] STRIPE_SECRET_KEY not set — skipping sync update");
    return NextResponse.redirect(new URL("/dashboard?welcome=1", origin));
  }

  try {
    const stripe  = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    console.log("[stripe/success] session status:", session.status, "payment_status:", session.payment_status);

    // Reject unpaid sessions
    if (session.payment_status !== "paid" && session.status !== "complete") {
      console.warn("[stripe/success] session not paid:", session.payment_status);
      return NextResponse.redirect(new URL("/checkout?payment_failed=1", origin));
    }

    const userId = session.metadata?.userId ?? session.client_reference_id ?? null;
    const priceId = session.line_items?.data[0]?.price?.id ?? null;
    const plan    = priceId ? planFromPriceId(priceId) : (session.metadata?.plan ?? null);

    console.log("[stripe/success] userId:", userId, "plan:", plan);

    if (userId && plan) {
      const supabase = createServiceClient();
      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            id:                       userId,
            plan,
            trial_end:                null,
            stripe_customer_id:       (session.customer as string) ?? null,
            stripe_subscription_id:   (session.subscription as string) ?? null,
          },
          { onConflict: "id" }
        );

      if (error) {
        console.error("[stripe/success] profile upsert error:", error.message);
      } else {
        console.log("[stripe/success] profile updated — plan:", plan, "userId:", userId);
      }
    } else {
      console.warn("[stripe/success] could not update profile — userId:", userId, "plan:", plan);
    }
  } catch (err) {
    // Don't block the user — webhook will handle it as fallback
    console.error("[stripe/success] error verifying session:", err);
  }

  return NextResponse.redirect(new URL("/dashboard?welcome=1", origin));
}
