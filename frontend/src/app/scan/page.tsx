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
  const [type, setType] = useState<'Import' | 'Export'>('Export');
  const [resultMessage, setResultMessage] = useState("");

  const handleResult = (text: string) => {
    setSku(text);
    setStatus(`Đã quét: ${text}`);
    setError("");
    setResultMessage("");
  };

  const handleSubmit = async () => {
    if (!sku) {
      setError('Vui lòng quét mã QR trước khi gửi.');
      return;
    }
    if (quantity <= 0) {
      setError('Số lượng phải lớn hơn 0.');
      return;
    }

    setStatus('Đang gửi yêu cầu xử lý xuất/nhập kho...');
    setError('');
    setResultMessage('');

    try {
      const response = await backendFetch('/api/inventory/scan', {
        method: 'POST',
        body: JSON.stringify({ sku, type, quantity }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Không thể xử lý yêu cầu.');
        setStatus('Lỗi khi gửi yêu cầu.');
      } else {
        setResultMessage(data.message || 'Thao tác thành công.');
        setStatus(`Kết quả: ${data.message}`);
      }
    } catch (err) {
      setError('Không thể kết nối backend. Kiểm tra lại link và mạng.');
      setStatus('Lỗi mạng.');
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
          <Link href="/login" className="rounded-3xl border border-slate-700/90 bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700">
            Đăng nhập
          </Link>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-cyan-500/10 bg-black/80 p-4">
          <div className="relative h-[320px] overflow-hidden rounded-3xl border border-slate-700/70 bg-slate-950">
            <QRScanner onResult={handleResult} />
          </div>

          <div className="mt-4 grid gap-4 rounded-3xl border border-slate-700/80 bg-slate-950/90 p-4 text-sm text-slate-300">
            <div>
              <p className="font-semibold text-slate-100">Mã SKU đã quét:</p>
              <p className="mt-2 text-slate-200 break-words">{sku || 'Chưa có dữ liệu'}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-slate-300">Loại giao dịch</span>
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value as 'Import' | 'Export')}
                  className="mt-2 w-full rounded-3xl border border-slate-700/90 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                >
                  <option value="Export">Xuất kho</option>
                  <option value="Import">Nhập kho</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-slate-300">Số lượng</span>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  className="mt-2 w-full rounded-3xl border border-slate-700/90 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                />
              </label>
            </div>

            {resultMessage ? <div className="rounded-3xl bg-emerald-600/15 p-3 text-slate-100">{resultMessage}</div> : null}
            {error ? <div className="rounded-3xl bg-rose-600/15 p-3 text-rose-200">{error}</div> : null}

            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-3xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Gửi đơn quét đến Backend
            </button>
          </div>

          <div className="mt-4 rounded-3xl border border-slate-700/80 bg-slate-950/90 p-4 text-sm text-slate-300">
            <p className="font-semibold text-slate-100">Trạng thái camera:</p>
            <p className="mt-2">{status}</p>
          </div>
        </div>

        <div className="grid gap-3 rounded-[28px] border border-slate-700/70 bg-slate-900/80 p-4 text-sm text-slate-300">
          <p>Hướng dẫn: Quét mã QR trước, chọn loại giao dịch và số lượng, sau đó gửi yêu cầu lên backend.</p>
          <p className="text-slate-400">Backend đang sử dụng URL: {process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}.</p>
        </div>
      </div>
    </div>
  );
}