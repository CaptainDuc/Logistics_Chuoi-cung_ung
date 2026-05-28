"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Đăng nhập thành công (demo)");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-300 to-transparent rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-tl from-indigo-300 to-transparent rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 gap-8">
        {/* Left */}
        <div className="flex-1 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200">
            <span className="text-2xl">🔐</span>
            <span className="text-sm font-semibold text-purple-700">Xác thực an toàn</span>
          </div>

          {/* Main Title Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 rounded-3xl blur-xl opacity-50" />
            <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-3xl p-8 shadow-xl">
              <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight">
                📱 Đăng nhập
                <br />
                Hệ thống kho
              </h1>
            </div>
          </div>
          
          {/* Description Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur-lg opacity-50" />
            <div className="relative bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-6 border-2 border-blue-300 shadow-lg">
              <p className="text-lg font-semibold text-blue-900">
                ⚡ Quét QR, quản lý đơn hàng, kiểm kho - tất cả trong một giao diện chuyên nghiệp.
              </p>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl blur-lg opacity-50" />
              <div className="relative bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl p-5 shadow-lg border border-blue-300">
                <span className="text-4xl">🚀</span>
                <p className="text-base font-bold text-white mt-3">Nhanh chóng</p>
                <p className="text-sm text-blue-100 mt-1">Xử lý tức thì</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl blur-lg opacity-50" />
              <div className="relative bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl p-5 shadow-lg border border-green-300">
                <span className="text-4xl">🔒</span>
                <p className="text-base font-bold text-white mt-3">An toàn</p>
                <p className="text-sm text-green-100 mt-1">Bảo vệ tối đa</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl blur-lg opacity-50" />
              <div className="relative bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl p-5 shadow-lg border border-purple-300">
                <span className="text-4xl">✨</span>
                <p className="text-base font-bold text-white mt-3">Hiện đại</p>
                <p className="text-sm text-purple-100 mt-1">Giao diện tươi mới</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-400 rounded-2xl blur-lg opacity-50" />
              <div className="relative bg-gradient-to-br from-orange-400 to-red-400 rounded-2xl p-5 shadow-lg border border-orange-300">
                <span className="text-4xl">⚡</span>
                <p className="text-base font-bold text-white mt-3">Đơn giản</p>
                <p className="text-sm text-orange-100 mt-1">Dễ sử dụng</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Form Card */}
        <section className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 rounded-3xl blur-2xl opacity-60" />
            <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50 space-y-6">
              {/* Header */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg mb-4">
                  <span className="text-3xl">📦</span>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Chào mừng
                </h2>
                <p className="text-slate-500 text-sm mt-2">Nhân viên kho LogiChain</p>
              </div>

              {/* Form */}
              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-2 rounded-lg border border-purple-200">
                    📧 Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@logichain.com"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-950 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20"
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block bg-gradient-to-r from-blue-100 to-cyan-100 px-3 py-2 rounded-lg border border-blue-200">
                    🔑 Mật khẩu
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-950 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  ✨ Đăng nhập
                </button>
              </form>

              {/* Info Box */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl blur-lg opacity-50" />
                <div className="relative bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-xl p-4 shadow-lg">
                  <p className="text-sm font-semibold text-yellow-900">💡 Gợi ý:</p>
                  <p className="text-xs text-yellow-800 mt-1">Sử dụng tài khoản nhân viên để đăng nhập vào hệ thống.</p>
                </div>
              </div>

              {/* Home Link */}
              <Link
                href="/"
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-slate-200 to-slate-100 text-slate-900 font-semibold rounded-xl border-2 border-slate-300 hover:from-slate-100 hover:to-slate-50 transition-all shadow-md hover:shadow-lg"
              >
                ← Quay về trang chủ
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}