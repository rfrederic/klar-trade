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

  // Plan gate — only allow dashboard access for paying users and admins
  if (isDashboard && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, is_admin, stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    const plan = profile?.plan ?? null;
    const hasPaidAccess =
      profile?.is_admin ||
      plan === "starter" ||
      plan === "pro" ||
      plan === "elite" ||
      (plan === "trial" && !!profile?.stripe_customer_id);

    if (!hasPaidAccess) {
      const url = request.nextUrl.clone();
      url.pathname = "/checkout";
      return NextResponse.redirect(url);
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
