// Single source of truth for whether the paywall / billing UI is active.
// Off by default (pre-launch, solo testing) — set NEXT_PUBLIC_PAYMENTS_ENABLED=true
// in the environment when ready to require a paid plan and show billing UI again.
export const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";
