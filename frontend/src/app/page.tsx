import Link from "next/link";
import { QrCode, LogIn, Warehouse } from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="bg-glow" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        {/* Logo */}

        <div className="mb-10 flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-2xl shadow-indigo-500/30">
            <Warehouse className="h-10 w-10 text-white" />
          </div>

          <div>
            <h1 className="text-5xl font-black">
              Smart WMS
            </h1>

            <p className="mt-1 text-slate-400">
              Warehouse Management System
            </p>
          </div>
        </div>

        {/* Hero */}

        <div className="mb-14 max-w-3xl text-center">
          <h2 className="mb-5 text-6xl font-black leading-tight">
            Quản lý kho bằng QR Code
          </h2>

          <p className="text-lg leading-relaxed text-slate-400">
            Quét mã sản phẩm để nhập kho, xuất kho và quản lý tồn kho realtime.
          </p>
        </div>

        {/* Actions */}

        <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2">
          {/* QR */}

          <Link
            href="/scan"
            className="glass-card group p-8"
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-500/20 text-indigo-400 transition duration-300 group-hover:scale-110">
              <QrCode className="h-10 w-10" />
            </div>

            <h3 className="mb-3 text-3xl font-bold">
              Quét QR
            </h3>

            <p className="mb-6 leading-relaxed text-slate-400">
              Mở camera để quét QR sản phẩm.
            </p>

            <div className="btn btn-primary w-fit">
              Mở Scanner
            </div>
          </Link>

          {/* Login */}

          <Link
            href="/login"
            className="glass-card group p-8"
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/20 text-emerald-400 transition duration-300 group-hover:scale-110">
              <LogIn className="h-10 w-10" />
            </div>

            <h3 className="mb-3 text-3xl font-bold">
              Đăng nhập
            </h3>

            <p className="mb-6 leading-relaxed text-slate-400">
              Truy cập dashboard quản lý kho.
            </p>

            <div className="btn btn-primary w-fit">
              Login
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}