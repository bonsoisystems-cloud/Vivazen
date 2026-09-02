import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "vivazen-luxury-secret-key-2026-super-secure-token";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const TOKEN_COOKIE_NAME = "vivazen_auth_token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;

    let user: { id: string; role: string } | null = null;

    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        user = {
          id: payload.id as string,
          role: payload.role as string,
        };
      } catch {
        user = null;
      }
    }

    // If on login page and already authenticated, redirect to /admin
    if (isLoginPage) {
      if (user) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    // If not authenticated, redirect to login
    if (!user) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If accessing admin-only routes like /admin/users, check for ADMIN role
    if (pathname.startsWith("/admin/users") && user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin?error=unauthorized", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
