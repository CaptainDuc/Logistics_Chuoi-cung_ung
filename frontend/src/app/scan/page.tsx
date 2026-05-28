"use client";

import QRScanner from "./QRScanner";
import { exportToExcel } from "@/utils/exportExcel";
import { Download, QrCode, Package, ScanLine } from "lucide-react";

export default function ScanPage() {
  const scanData = [
    {
      product: "iPhone 15",
      quantity: 10,
      status: "Imported",
    },
    {
      product: "Samsung S24",
      quantity: 5,
      status: "Exported",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white overflow-hidden">
      {/* Glow */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="absolute bottom-[-150px] right-[-100px] h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-14">
        {/* Header */}

        <div className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-5 py-2 text-sm text-indigo-300">
              <ScanLine className="h-4 w-4" />
              Smart QR Scanner
            </div>

            <h1 className="mb-4 text-6xl font-black tracking-tight">
              Quét QR Sản Phẩm
            </h1>

            <p className="max-w-2xl text-lg leading-relaxed text-slate-400">
              Hệ thống quét QR giúp quản lý nhập kho, xuất kho và theo dõi sản
              phẩm realtime.
            </p>
          </div>

          {/* Export */}

          <button
            onClick={() =>
              exportToExcel(scanData, "scan-history")
            }
            className="group flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-7 py-4 text-lg font-bold text-white shadow-2xl shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-500/40"
          >
            <Download className="h-5 w-5 transition group-hover:scale-110" />
            Xuất Excel
          </button>
        </div>

        {/* Stats */}

        <div className="mb-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
              <QrCode className="h-7 w-7" />
            </div>

            <h3 className="mb-1 text-4xl font-black">
              248
            </h3>

            <p className="text-slate-400">
              QR đã quét hôm nay
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Package className="h-7 w-7" />
            </div>

            <h3 className="mb-1 text-4xl font-black">
              120
            </h3>

            <p className="text-slate-400">
              Sản phẩm nhập kho
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400">
              <ScanLine className="h-7 w-7" />
            </div>

            <h3 className="mb-1 text-4xl font-black">
              98%
            </h3>

            <p className="text-slate-400">
              Độ chính xác scan
            </p>
          </div>
        </div>

        {/* Scanner */}

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Camera */}

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black">
                  Camera Scanner
                </h2>

                <p className="mt-2 text-slate-400">
                  Đưa mã QR vào giữa camera để quét.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                Live
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black p-4">
              <QRScanner />
            </div>
          </div>

          {/* Activity */}

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
            <h2 className="mb-6 text-3xl font-black">
              Hoạt động gần đây
            </h2>

            <div className="space-y-4">
              {scanData.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-bold">
                      {item.product}
                    </h3>

                    <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-sm text-indigo-300">
                      {item.status}
                    </span>
                  </div>

                  <p className="text-slate-400">
                    Số lượng: {item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}