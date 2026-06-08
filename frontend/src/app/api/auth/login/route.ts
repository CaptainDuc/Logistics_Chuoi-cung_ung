import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api"; // Kéo hàm kết nối backend thật vào

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => ({}));
    
    // 🚀 Gửi dữ liệu đăng nhập sang Backend thật (cổng 4000)
    const response = await backendFetch("api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, message: data.message || "Đăng nhập thất bại." },
        { status: response.status }
      );
    }

    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: "Không thể kết nối đến Server Backend thật." },
      { status: 500 }
    );
  }
}