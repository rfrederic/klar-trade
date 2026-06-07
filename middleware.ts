import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — must not run logic between createServerClient and getUser
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users away from dashboard
  const isDashboard = pathname.startsWith("/dashboard") ||
    pathname.startsWith("/trading") ||
    pathname.startsWith("/journal") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/brokers") ||
    pathname.startsWith("/edge") ||
    pathname.startsWith("/klar-ai") ||
    pathname.startsWith("/community") ||
    pathname.startsWith("/notebook") ||
    pathname.startsWith("/refuge") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/risk") ||
    pathname.startsWith("/strategies") ||
    pathname.startsWith("/replay") ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/trading-plans") ||
    pathname.startsWith("/ai-coach") ||
    pathname.startsWith("/notes");

  if (isDashboard && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Trial expiry check — runs on dashboard routes, skips /choose-plan itself
  if (isDashboard && user && !pathname.startsWith("/choose-plan")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, trial_end, is_admin")
      .eq("id", user.id)
      .maybeSingle();

    // Admins bypass all payment and trial checks
    if (!profile?.is_admin) {
      if (
        profile?.plan === "trial" &&
        profile.trial_end &&
        new Date(profile.trial_end) < new Date()
      ) {
        const url = request.nextUrl.clone();
        url.pathname = "/choose-plan";
        return NextResponse.redirect(url);
      }
    }
  }

  // Redirect logged-in users away from auth pages
  const isAuth = pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password");

  if (isAuth && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
