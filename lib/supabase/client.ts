import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Required for the password-recovery flow: the reset link lands on
      // /reset-password with either #access_token=... (implicit) or
      // ?code=... (PKCE) — the client must pick these up automatically so a
      // session exists before updateUser({ password }) is called.
      detectSessionInUrl: true,
    },
  });
}
