import Stripe from "stripe";

let cachedStripe: Stripe | null = null;

// Lazily creates the Stripe client on first use, inside a request handler —
// never at module load time. Instantiating `new Stripe(...)` at import time
// throws ("Neither apiKey nor config.authenticator provided") whenever
// STRIPE_SECRET_KEY isn't set, which crashes the Next.js build itself during
// its page-data-collection step (it imports every route module). Returning
// null here instead lets callers respond with a 503 "payments disabled"
// instead of taking down the whole build/deploy.
export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!cachedStripe) {
    cachedStripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return cachedStripe;
}
