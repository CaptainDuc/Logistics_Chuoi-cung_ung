import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. Kiểm tra xem ở trình duyệt đã lưu Token đăng nhập chưa (Đọc từ Cookie)
  // 'auth_token' là tên cookie mà Đức sẽ lưu ở Bước 3 sau khi Backend trả về thành công.
  const token = request.cookies.get("auth_token")?.value;

  const { pathname } = request.nextUrl;

  // Trường hợp 1: Người dùng cố tình truy cập vào Dashboard nhưng CHƯA ĐĂNG NHẬP (Không có token)
  if (pathname.startsWith("/dashboard") && !token) {
    // Chặn đứng lại và ép chuyển hướng về trang Login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Trường hợp 2: Người dùng ĐÃ ĐĂNG NHẬP rồi (Đang có token) nhưng lại gõ vào link /login
  if (pathname.startsWith("/login") && token) {
    // Không cho vào trang login nữa, đá thẳng ngược lại vào Dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Cho phép đi tiếp nếu hợp lệ
  return NextResponse.next();
}

// Cấu hình các Route (Đường dẫn) mà Middleware này bắt buộc phải nhảy vào quét bảo mật
export const config = {
  matcher: [
    "/dashboard/:path*", // Quét trang dashboard và toàn bộ các trang con bên trong (products, inbound, outbound,...)
    "/login", // Quét trang login
  ],
};
