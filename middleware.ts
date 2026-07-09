import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { PAYMENTS_ENABLED } from "@/lib/payments";
import { COMING_SOON, EARLY_ACCESS_COOKIE, EARLY_ACCESS_MAX_AGE, isValidAccessCode } from "@/lib/early-access";

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

  // ── Early access / "coming soon" gate ───────────────────────────────────────
  if (COMING_SOON) {
    const carryOverCookies = (res: NextResponse) => {
      supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c));
      return res;
    };

    const accessParam = request.nextUrl.searchParams.get("access");
    const hasAccessCookie = isValidAccessCode(request.cookies.get(EARLY_ACCESS_COOKIE)?.value);

    // A valid ?access=CODE link grants access and persists it via cookie,
    // then redirects to the same URL with the code stripped out.
    if (!hasAccessCookie && isValidAccessCode(accessParam)) {
      const cleanUrl = request.nextUrl.clone();
      cleanUrl.searchParams.delete("access");
      const res = carryOverCookies(NextResponse.redirect(cleanUrl));
      res.cookies.set(EARLY_ACCESS_COOKIE, accessParam!, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: EARLY_ACCESS_MAX_AGE,
        path: "/",
      });
      return res;
    }

    const granted = hasAccessCookie || isValidAccessCode(accessParam);

    // Public signup stays disabled while in early access, regardless of
    // whether the visitor has a valid access code.
    const isRegisterRoute =
      pathname.startsWith("/register") || pathname.startsWith("/api/auth/register");

    // Everything that isn't the landing page ("/") or an API/static route is
    // considered an "app page" and is locked behind the access code. API
    // routes are left reachable — they're either needed for infrastructure
    // (cron, webhooks) or already independently auth-checked.
    const isAppPage =
      pathname === "/login" || pathname.startsWith("/login/") ||
      pathname === "/forgot-password" || pathname.startsWith("/forgot-password/") ||
      pathname === "/reset-password" || pathname.startsWith("/reset-password/") ||
      pathname.startsWith("/dashboard")     ||
      pathname.startsWith("/trading")       ||
      pathname.startsWith("/journal")       ||
      pathname.startsWith("/analytics")     ||
      pathname.startsWith("/brokers")       ||
      pathname.startsWith("/edge")          ||
      pathname.startsWith("/klar-ai")       ||
      pathname.startsWith("/notebook")      ||
      pathname.startsWith("/refuge")        ||
      pathname.startsWith("/settings")      ||
      pathname.startsWith("/risk")          ||
      pathname.startsWith("/strategies")    ||
      pathname.startsWith("/replay")        ||
      pathname.startsWith("/calendar")      ||
      pathname.startsWith("/trading-plans") ||
      pathname.startsWith("/ai-coach")      ||
      pathname.startsWith("/achievements")  ||
      pathname.startsWith("/notes")         ||
      pathname.startsWith("/plans")         ||
      pathname.startsWith("/checkout")      ||
      pathname.startsWith("/choose-plan");

    if (isRegisterRoute || (isAppPage && !granted)) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.search = "";
      return carryOverCookies(NextResponse.redirect(homeUrl));
    }
  }

  // ── Protected dashboard routes ──────────────────────────────────────────────
  const isDashboard =
    pathname.startsWith("/dashboard")     ||
    pathname.startsWith("/trading")       ||
    pathname.startsWith("/journal")       ||
    pathname.startsWith("/analytics")     ||
    pathname.startsWith("/brokers")       ||
    pathname.startsWith("/edge")          ||
    pathname.startsWith("/klar-ai")       ||
    pathname.startsWith("/notebook")      ||
    pathname.startsWith("/refuge")        ||
    pathname.startsWith("/settings")      ||
    pathname.startsWith("/risk")          ||
    pathname.startsWith("/strategies")    ||
    pathname.startsWith("/replay")        ||
    pathname.startsWith("/calendar")      ||
    pathname.startsWith("/trading-plans") ||
    pathname.startsWith("/ai-coach")      ||
    pathname.startsWith("/achievements")  ||
    pathname.startsWith("/notes");

  // 1. Unauthenticated on a dashboard route → /login
  if (isDashboard && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated on a dashboard route → check paid plan
  if (isDashboard && user && PAYMENTS_ENABLED) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, is_admin, stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    const plan = profile?.plan ?? null;
    const hasPaidAccess =
      profile?.is_admin ||
      plan === "starter"  ||
      plan === "pro"      ||
      plan === "elite"    ||
      (plan === "trial" && !!profile?.stripe_customer_id);

    if (!hasPaidAccess) {
      const plansUrl = request.nextUrl.clone();
      plansUrl.pathname = "/plans";
      return NextResponse.redirect(plansUrl);
    }
  }

  // 3. Authenticated users on login/forgot-password → redirect away
  //    (NOT /register — new users land there after landing-page CTA and
  //     must be able to see it even while their session is being created)
  const isLoginPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/forgot-password");

  if (isLoginPage && user) {
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
