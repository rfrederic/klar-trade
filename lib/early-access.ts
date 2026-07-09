// Single source of truth for early-access / "coming soon" mode.
// Set COMING_SOON=true to lock the app down to just the landing page until
// launch; flip to false (or unset) to open everything back up. No other
// code should read process.env.COMING_SOON directly.
export const COMING_SOON = process.env.COMING_SOON === "true";

export const EARLY_ACCESS_COOKIE = "klar_early_access";
export const EARLY_ACCESS_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function isValidAccessCode(value: string | null | undefined): boolean {
  const expected = process.env.EARLY_ACCESS_CODE;
  return !!expected && !!value && value === expected;
}
