import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto flex max-w-xl flex-col gap-6 rounded-[32px] border border-slate-700/60 bg-slate-900/95 p-6 shadow-2xl shadow-cyan-500/10">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">
            Kiểm kho thông minh
          </p>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Mobile App - Quét QR trên trình duyệt
          </h1>
          <p className="mt-4 text-slate-300">
            Nhấn vào Đăng nhập để vào hệ thống nhân viên hoặc mở trang quét mã ngay lập tức.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/login"
            className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-4 text-center text-white transition hover:bg-cyan-500/15"
          >
            Đăng nhập nhân viên
          </Link>
          <Link
            href="/scan"
            className="rounded-3xl border border-slate-500/30 bg-slate-800/90 px-5 py-4 text-center text-slate-200 transition hover:bg-slate-700/80"
          >
            Mở trang quét QR
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-700/60 bg-slate-950/80 p-4 text-slate-400">
          <p className="text-sm leading-6">
            Lưu ý: Ứng dụng này được thiết kế để sử dụng trên thiết bị di động với trình duyệt hỗ trợ camera. Đảm bảo cấp quyền truy cập camera khi được yêu cầu để trải nghiệm quét mã QR mượt mà.
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Nếu gặp sự cố khi quét mã QR, hãy kiểm tra lại quyền truy cập camera của trình duyệt và đảm bảo mã QR rõ ràng, đủ sáng.
          </p>
        </div>
      </div>
    </main>
  );
}
