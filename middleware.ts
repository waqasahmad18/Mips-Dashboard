import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = request.cookies.get(AUTH_COOKIE_NAME)?.value === "1";
  const isLoginPath = pathname === "/login";

  if (isLoggedIn && isLoginPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isLoggedIn && !isLoginPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api|logo.png|favicon.ico|.*\\..*).*)"],
};
