"use client";

import { useState } from "react";
import Link from "next/link";
import QRScanner from "./QRScanner";
import { backendFetch } from "../../lib/api";

export default function ScanPage() {
  const [sku, setSku] = useState("");
  const [status, setStatus] = useState("Chuẩn bị mở camera...");
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [type, setType] = useState<"Import" | "Export">("Export");
  const [resultMessage, setResultMessage] = useState("");

  const handleResult = (text: string) => {
    setSku(text);
    setStatus(`✅ Đã quét: ${text}`);
    setError("");
    setResultMessage("");
  };

  const handleSubmit = async () => {
    if (!sku) {
      setError("❌ Vui lòng quét mã QR trước khi gửi.");
      return;
    }
    if (quantity <= 0) {
      setError("❌ Số lượng phải lớn hơn 0.");
      return;
    }

    setStatus("⏳ Đang gửi yêu cầu...");
    setError("");
    setResultMessage("");

    try {
      const response = await backendFetch("/api/inventory/scan", {
        method: "POST",
        body: JSON.stringify({ sku, type, quantity }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Không thể xử lý yêu cầu.");
        setStatus("❌ Lỗi");
      } else {
        setResultMessage(data.message || "✅ Thao tác thành công.");
        setStatus(`✅ Xong`);
      }
    } catch (err) {
      setError("❌ Không thể kết nối backend.");
      setStatus("❌ Lỗi mạng");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      {/* Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-300 to-transparent rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-300 to-transparent rounded-full blur-3xl opacity-40" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-br from-pink-300 to-transparent rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-2xl blur-xl opacity-50" />
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/50">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-3">
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full text-white font-bold">
                    📱 QUÉT QR
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 rounded-xl blur-lg opacity-50" />
                    <h1 className="relative text-4xl font-bold text-white bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 px-6 py-4 rounded-xl">
                      Xử lý kho thông minh
                    </h1>
                  </div>
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg border border-blue-300">
                    <p className="text-blue-900 font-semibold">💼 Quét mã QR và cập nhật tình trạng kho tức thì.</p>
                  </div>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-slate-200 to-slate-100 text-slate-900 font-semibold rounded-xl border-2 border-slate-300 hover:from-slate-100 hover:to-slate-50 transition-all shadow-md"
                >
                  ← Trang chủ
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-6">
            {/* User Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl blur-lg opacity-50" />
              <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 shadow-xl border border-purple-300">
                <div className="space-y-3 text-white">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white/30 backdrop-blur-sm rounded-xl">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-purple-100 uppercase">👨 Nhân viên</p>
                    <p className="text-lg font-bold">admin@logichain.vn</p>
                  </div>
                  <div className="pt-4 border-t border-white/30 space-y-2">
                    <p className="text-sm font-semibold">🟢 Hoạt động</p>
                    <p className="text-sm">⏰ 08:47 AM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl blur-lg opacity-50" />
                <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-5 shadow-lg border border-blue-300">
                  <p className="text-xs font-bold text-blue-100 uppercase">📊 Đơn đã quét</p>
                  <p className="text-4xl font-bold text-white mt-3">24</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-400 rounded-xl blur-lg opacity-50" />
                <div className="relative bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-5 shadow-lg border border-orange-300">
                  <p className="text-xs font-bold text-orange-100 uppercase">⏳ Chờ xử lý</p>
                  <p className="text-4xl font-bold text-white mt-3">6</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl blur-lg opacity-50" />
                <div className="relative bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-5 shadow-lg border border-green-300">
                  <p className="text-xs font-bold text-green-100 uppercase">✅ Hoàn thành</p>
                  <p className="text-4xl font-bold text-white mt-3">95%</p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl blur-lg opacity-50" />
              <div className="relative bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl p-5 shadow-lg border border-yellow-300">
                <p className="text-sm font-bold text-yellow-900">💡 Mẹo nhanh</p>
                <ul className="text-sm text-yellow-900 mt-3 space-y-2 font-semibold">
                  <li>✓ Giữ camera ổn định</li>
                  <li>✓ Chọn loại giao dịch đúng</li>
                  <li>✓ Kiểm tra kết quả ngay</li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="space-y-6">
            {/* Scanner */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-cyan-400 rounded-2xl blur-2xl opacity-50" />
              <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/50">
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                      <div className="inline-block px-4 py-2 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-bold rounded-lg">
                        🎥 CAMERA QUÉT
                      </div>
                      <div className="inline-block px-4 py-2 bg-gradient-to-r from-slate-200 to-slate-100 rounded-lg border-2 border-slate-300 font-semibold text-slate-900">
                        {status}
                      </div>
                    </div>
                  </div>

                  <div className="relative aspect-video rounded-xl overflow-hidden border-4 border-gradient-to-r from-green-400 to-cyan-400">
                    <QRScanner onResult={handleResult} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl blur-lg opacity-50" />
                      <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-5 shadow-lg border border-blue-300 text-center">
                        <p className="text-xs font-bold text-blue-100 uppercase">📦 Mã SKU</p>
                        <p className="text-3xl font-bold text-white mt-2">{sku || "---"}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl blur-lg opacity-50" />
                      <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-5 shadow-lg border border-purple-300 text-center">
                        <p className="text-xs font-bold text-purple-100 uppercase">📋 Loại</p>
                        <p className="text-3xl font-bold text-white mt-2">{type === "Export" ? "Xuất" : "Nhập"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl blur-2xl opacity-50" />
              <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/50">
                <div className="space-y-2 mb-6">
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg">
                    ⚙️ TÙY CHỈNH
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg blur-lg opacity-50" />
                    <h2 className="relative text-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 rounded-lg">
                      Xác nhận giao dịch
                    </h2>
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <div className="bg-gradient-to-r from-orange-400 to-yellow-400 px-4 py-2 rounded-lg mb-2 inline-block font-bold text-orange-900">
                      📤 Loại giao dịch
                    </div>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as "Import" | "Export")}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-slate-100 text-slate-900 font-semibold outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition"
                    >
                      <option value="Export">📤 Xuất kho</option>
                      <option value="Import">📥 Nhập kho</option>
                    </select>
                  </div>

                  <div>
                    <div className="bg-gradient-to-r from-blue-400 to-cyan-400 px-4 py-2 rounded-lg mb-2 inline-block font-bold text-blue-900">
                      🔢 Số lượng
                    </div>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-slate-100 text-slate-900 font-semibold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    ✅ Gửi thông tin
                  </button>

                  {error && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-pink-400 rounded-xl blur-lg opacity-50" />
                      <div className="relative bg-gradient-to-br from-red-500 to-pink-500 rounded-xl p-4 text-white font-bold border border-red-300 shadow-lg">
                        {error}
                      </div>
                    </div>
                  )}

                  {resultMessage && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl blur-lg opacity-50" />
                      <div className="relative bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white font-bold border border-green-300 shadow-lg">
                        {resultMessage}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}