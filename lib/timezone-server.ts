import type { SupabaseClient } from "@supabase/supabase-js";
import { isValidTimeZone, resolveTimezone } from "./timezone";

// Resolves the timezone to use for a request: an explicit override (e.g. the
// browser's live-detected zone, passed as a `tz` query param) wins if valid;
// otherwise falls back to the user's saved `profiles.timezone`, then UTC.
// Only hits the database when no valid explicit value was provided.
export async function resolveUserTimezone(
  supabase: SupabaseClient,
  userId: string,
  explicit?: string | null
): Promise<string> {
  if (isValidTimeZone(explicit)) return explicit;
  const { data } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", userId)
    .maybeSingle();
  return resolveTimezone(explicit, data?.timezone as string | null | undefined);
}
