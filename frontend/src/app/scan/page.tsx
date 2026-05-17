"use client";

import { useState } from "react";
import Link from "next/link";
import QRScanner from "./QRScanner";

export default function ScanPage() {
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("Chuẩn bị mở camera...");
  const [error, setError] = useState("");
  const [lastScan, setLastScan] = useState("");

  const handleResult = async (text: string) => {
    setResult(text);
    setStatus("Gửi dữ liệu quét lên server...");
    setError("");

    try {
      const response = await fetch("/api/inventory/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrData: text }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Không thể ghi nhận mã QR.");
        setStatus("Lỗi kết nối.");
      } else {
        setLastScan(text);
        setStatus(data.message || "Quét thành công.");
      }
    } catch {
      setError("Lỗi mạng. Vui lòng thử lại.");
      setStatus("Không thể gửi dữ liệu.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100">
      <div className="mx-auto flex max-w-xl flex-col gap-5 rounded-[32px] border border-slate-700/80 bg-slate-900/95 p-5 shadow-2xl shadow-cyan-500/10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/80">Quét xuất nhập kho</p>
            <h1 className="mt-2 text-3xl font-semibold">Thiết bị di động</h1>
          </div>
          <Link
            href="/login"
            className="rounded-3xl border border-slate-700/90 bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
          >
            Đăng nhập
          </Link>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-cyan-500/10 bg-black/80 p-4">
          <div className="relative h-[320px] overflow-hidden rounded-3xl border border-slate-700/70 bg-slate-950">
            <QRScanner onResult={handleResult} />
          </div>
          <div className="mt-4 rounded-3xl border border-slate-700/80 bg-slate-950/90 p-4 text-sm text-slate-300">
            <p className="font-semibold text-slate-100">Trạng thái:</p>
            <p className="mt-2">{status}</p>
            {error ? <p className="mt-2 text-rose-300">{error}</p> : null}
            {lastScan ? <p className="mt-2 text-cyan-300">Mã gần nhất: {lastScan}</p> : null}
          </div>
        </div>

        <div className="grid gap-3 rounded-[28px] border border-slate-700/70 bg-slate-900/80 p-4 text-sm text-slate-300">
          <p>
            Hướng dẫn: Mở camera, đưa mã QR vào vùng quét. Khi mã được đọc, hệ thống sẽ tự động gửi dữ liệu về server và hiển thị kết quả.
          </p>
          <p className="text-slate-400">Nếu QR không quét được, kiểm tra quyền truy cập camera và thử lại.</p>
        </div>
      </div>
    </div>
  );
}