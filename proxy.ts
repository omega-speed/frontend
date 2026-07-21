import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

// Define auth routes (authenticated users should be redirected away from these)
const authRoutes = [
  "/sign-in",
  "/sign-up",
  "/email-verification",
  "/forgot-password",
  "/reset-password",
];
// Define public routes (always accessible, no authentication required)
const publicRoutes = [
  "/",
  "/terms-of-service",
  "/privacy-policy",
  "/cookie-policy",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  let isAuthenticated = !!accessToken && !isTokenExpired(accessToken);

  // If access token is expired but we have a refresh token, try refreshing
  if (!isAuthenticated && refreshToken) {
    const refreshed = await tryRefreshToken(refreshToken);
    if (refreshed) {
      isAuthenticated = true;
      const response = NextResponse.redirect(request.url);
      response.cookies.set(ACCESS_TOKEN_COOKIE, refreshed.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 9,
        path: "/",
      });
      if (refreshed.refresh_token) {
        response.cookies.set(REFRESH_TOKEN_COOKIE, refreshed.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });
      }

      // If on an auth route, redirect away; otherwise continue with refreshed cookies
      if (authRoutes.some((route) => pathname.startsWith(route))) {
        const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
        const redirectUrl =
          callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/home";
        const authRedirect = NextResponse.redirect(
          new URL(redirectUrl, request.url),
        );
        authRedirect.cookies.set(ACCESS_TOKEN_COOKIE, refreshed.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 9,
          path: "/",
        });
        if (refreshed.refresh_token) {
          authRedirect.cookies.set(
            REFRESH_TOKEN_COOKIE,
            refreshed.refresh_token,
            {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 60 * 60 * 24 * 7,
              path: "/",
            },
          );
        }
        return authRedirect;
      }

      return response;
    }
  }

  // Always allow public routes
  if (
    publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/"),
    )
  ) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth routes
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (isAuthenticated) {
      const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
      const redirectUrl =
        callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/home";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  // All other routes are protected - require authentication
  if (!isAuthenticated) {
    const loginUrl = new URL("/sign-in", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

function isTokenExpired(token: string): boolean {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return true;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    const payload = JSON.parse(jsonPayload);

    // Check if token is expired (with 5 minute buffer for clock skew)
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp && currentTime >= payload.exp - 300; // 5 minute buffer
  } catch {
    // If we can't decode the token, consider it expired
    return true;
  }
}

async function tryRefreshToken(
  refreshToken: string,
): Promise<{ access_token: string; refresh_token?: string } | null> {
  try {
    const response = await fetch(`${process.env.BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data?.data?.accessToken) return null;

    return {
      access_token: data.data.accessToken,
      refresh_token: data.data.refreshToken,
    };
  } catch {
    return null;
  }
}

// Configure which paths the proxy should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
