import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const qrData = String(payload?.qrData || "").trim();

  if (!qrData) {
    return NextResponse.json(
      { ok: false, message: "Không tìm thấy dữ liệu mã QR." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: `Mã QR đã được ghi nhận: ${qrData}`,
    qrData,
  });
}
