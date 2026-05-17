import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const email = String(payload?.email || "").trim();
  const password = String(payload?.password || "").trim();

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, message: "Email và mật khẩu không được để trống." },
      { status: 400 }
    );
  }

  if (email === "nhanvien@kho.com" && password === "123456") {
    return NextResponse.json({ ok: true, message: "Đăng nhập thành công." });
  }

  return NextResponse.json(
    { ok: false, message: "Email hoặc mật khẩu không đúng." },
    { status: 401 }
  );
}
