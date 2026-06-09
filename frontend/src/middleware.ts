import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");

  const isLoginPage = request.nextUrl.pathname === "/login" || request.nextUrl.pathname.includes("auth");

  // Chưa login → redirect về login (trừ trang login)
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Đã login mà vào trang login → redirect về dashboard
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/scan",
    "/login",
    "/(auth)/:path*",
  ],
};
