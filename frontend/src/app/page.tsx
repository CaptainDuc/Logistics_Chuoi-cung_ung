import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-transparent rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200 to-transparent rounded-full blur-3xl opacity-30" />
        <div className="absolute top-1/2 left-1/3 w-60 h-60 bg-gradient-to-br from-pink-200 to-transparent rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          {/* Left section */}
          <section className="space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200/50">
              <span className="text-2xl">🚀</span>
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Logistics thế hệ mới</span>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 rounded-3xl blur-2xl opacity-60" />
                <h1 className="relative text-6xl font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 px-8 py-6 rounded-3xl">
                  Quét QR,
                  <br />
                  Quản lý kho
                  <br />
                  Chuyên nghiệp
                </h1>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur-lg opacity-50" />
                <p className="relative text-lg text-white font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 rounded-2xl leading-relaxed max-w-xl">
                  Hệ thống quét QR và quản lý kho hiện đại với giao diện đẹp, dễ sử dụng, giúp nhân viên tăng năng suất 3x lần.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-2xl shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 transition-all duration-300 transform hover:scale-105"
              >
                ✨ Đăng nhập ngay
              </Link>
              <Link
                href="/scan"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-950 font-semibold rounded-2xl border-2 border-slate-200 shadow-lg hover:shadow-xl hover:bg-slate-50 transition-all duration-300"
              >
                📱 Quét QR
              </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3 pt-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl blur-lg opacity-50" />
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 border border-blue-300 shadow-lg">
                  <div className="text-3xl font-bold text-white">⚡ 3x</div>
                  <p className="text-sm text-blue-100 font-bold mt-2">Tăng năng suất</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl blur-lg opacity-50" />
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 border border-green-300 shadow-lg">
                  <div className="text-3xl font-bold text-white">🎯 100%</div>
                  <p className="text-sm text-green-100 font-bold mt-2">Chính xác</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-400 rounded-2xl blur-lg opacity-50" />
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 border border-orange-300 shadow-lg">
                  <div className="text-3xl font-bold text-white">⏱️ 0s</div>
                  <p className="text-sm text-orange-100 font-bold mt-2">Trễ</p>
                </div>
              </div>
            </div>
          </section>

          {/* Right section - Featured card */}
          <section className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl blur-2xl opacity-50" />
            <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                  <span className="text-2xl">📊</span>
                  <span className="text-sm font-semibold text-purple-700">Dashboard</span>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl blur-lg opacity-50" />
                    <h2 className="relative text-3xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 rounded-xl">
                      Theo dõi nhanh
                    </h2>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-300 to-slate-400 rounded-lg blur-lg opacity-50" />
                    <p className="relative text-slate-700 font-semibold bg-gradient-to-r from-slate-100 to-slate-200 px-4 py-2 rounded-lg border border-slate-300">
                      Xem toàn bộ dữ liệu kho trong một tầm mắt.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl blur-lg opacity-50" />
                    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 border border-blue-300 text-center">
                      <div className="text-2xl font-bold text-white">1,240</div>
                      <p className="text-xs text-blue-100 font-bold mt-1">Đơn hôm nay</p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl blur-lg opacity-50" />
                    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 border border-green-300 text-center">
                      <div className="text-2xl font-bold text-white">24</div>
                      <p className="text-xs text-green-100 font-bold mt-1">Đơn quét xong</p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl blur-lg opacity-50" />
                    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 border border-purple-300 text-center">
                      <div className="text-2xl font-bold text-white">95%</div>
                      <p className="text-xs text-purple-100 font-bold mt-1">Tỷ lệ hoàn thành</p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-400 rounded-2xl blur-lg opacity-50" />
                    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 border border-orange-300 text-center">
                      <div className="text-2xl font-bold text-white">8m</div>
                      <p className="text-xs text-orange-100 font-bold mt-1">Thời gian trung bình</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}