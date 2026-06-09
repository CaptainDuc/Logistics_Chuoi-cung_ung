"use client";

import Link from "next/link";
import { LogIn, Warehouse, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const savedUsername = localStorage.getItem("userName");
    setUserName(savedUsername);
    
    // Auto redirect if logged in
    if (localStorage.getItem("token")) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <main className="relative min-h-screen bg-[#0a0f1e] overflow-hidden flex flex-col items-center justify-center px-6 text-center">
      {/* Glow Effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-2xl w-full">
        {/* Logo Section */}
        <div className="mb-8 flex flex-col items-center animate-fade-up">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[24px] flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-6 group hover:scale-110 transition-transform duration-500">
            <Warehouse className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">WMS</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-[0.2em]">
            Warehouse Management System
          </p>
        </div>

        {/* Hero Section */}
        <div className="mb-12 animate-fade-up" style={{ animationDelay: "100ms" }}>
          <h2 className="text-5xl font-black text-white leading-tight mb-6">
            Quản lý kho <br/> linh hoạt & bền bỉ
          </h2>
          <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
            Hệ thống quản lý kho thông minh tích hợp QR Code, tối ưu hóa quy trình nhập xuất chuyên nghiệp.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 w-full animate-fade-up" style={{ animationDelay: "200ms" }}>
          {!userName ? (
            <Link 
              href="/login" 
              className="flex items-center justify-between w-full p-5 bg-white rounded-2xl group active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4 text-slate-900">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                  <LogIn className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold">Bắt đầu ngay</div>
                  <div className="text-xs text-slate-500 font-medium">Đăng nhập vào hệ thống</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <Link 
              href="/dashboard" 
              className="flex items-center justify-between w-full p-5 bg-indigo-500 rounded-2xl group active:scale-[0.98] transition-all shadow-xl shadow-indigo-500/25"
            >
              <div className="flex items-center gap-4 text-white">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Warehouse className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold">Truy cập Dashboard</div>
                  <div className="text-xs text-white/70 font-medium">Phiên làm việc: {userName}</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/50 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}

          <div className="p-4 border border-white/5 bg-white/5 rounded-2xl">
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Tất cả hệ thống đang hoạt động
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
