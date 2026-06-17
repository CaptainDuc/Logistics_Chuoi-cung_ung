import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isTokenExpired(token: string): boolean {
  try {
    const payloadBase64 = token.split(".")[1];
    // atob hoạt động trong Edge Runtime, khác với Buffer (chỉ có ở Node.js runtime)
    const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(normalized));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true; // token sai định dạng -> coi như không hợp lệ
  }
}

export function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get("token");
  const token = tokenCookie?.value;
  const isValid = !!token && !isTokenExpired(token);

  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!isValid && !isLoginPage) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token"); // dọn cookie hết hạn ngay tại edge
    return response;
  }

  if (isValid && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
