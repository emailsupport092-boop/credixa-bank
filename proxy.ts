import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
  "/email-verified",
  "/link-expired",
  "/auth/callback",
];

// Redirect logged-in users away from these pages
const authRoutes = ["/login", "/register"];

// Routes accessible while pending 2FA
const twoFAAllowedApi = [
  "/api/auth/otp/verify",
  "/api/auth/otp/send",
  "/api/auth/logout",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({ request });

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
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = publicRoutes.some((r) => pathname.startsWith(r));
  const isAuth = authRoutes.some((r) => pathname.startsWith(r));
  const isApi = pathname.startsWith("/api");

  // 1. Not logged in → redirect to login
  if (!user && !isPublic && !isApi) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Already logged in + on an auth page → redirect to dashboard
  if (user && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. Pending 2FA — only allow OTP page and its APIs
  if (user) {
    const pending2FA = request.cookies.get("pending_2fa")?.value === "true";
    if (pending2FA) {
      const isVerifyOtp = pathname.startsWith("/verify-otp");
      const is2FAApi = twoFAAllowedApi.some((r) => pathname.startsWith(r));
      if (!isVerifyOtp && !is2FAApi) {
        return NextResponse.redirect(new URL("/verify-otp", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
