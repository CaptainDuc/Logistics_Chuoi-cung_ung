"use client";

import Link from "next/link";
import { QrCode, LogIn, Warehouse, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  // Đọc thông tin đăng nhập từ localStorage
  const readAuthFromStorage = () => {
    const savedRole = localStorage.getItem("userRole");
    const savedUsername = localStorage.getItem("username");
    setRole(savedRole);
    setUsername(savedUsername);
  };

  useEffect(() => {
    readAuthFromStorage();
  }, []);

  // Đồng bộ khi localStorage thay đổi (ví dụ: logout từ tab khác hoặc quay về trang chủ sau logout)
  useEffect(() => {
    const handleStorage = () => readAuthFromStorage();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Hàm xử lý Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    setRole(null);
    setUsername(null);
    alert("Đã đăng xuất tài khoản!");
  };

  // Hàm bảo vệ nút Quét QR (Bắt buộc phải đăng nhập mới cho vào)
  const handleGoToScan = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const token = localStorage.getItem("token");
    if (!token) {
      e.preventDefault();
      alert("Hệ thống bảo mật: Bạn cần đăng nhập trước khi sử dụng camera quét QR!");
      router.push("/login");
    }
  };

  // Redirect đã login → dashboard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && pathname === "/") {
      router.push("/dashboard");
    }
  }, [router]);

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
            <h1 className="text-5xl font-black">Smart WMS</h1>
            <p className="mt-1 text-slate-400">Warehouse Management System</p>
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
          
          {/* Trạng thái đăng nhập thực tế hiển thị ở đây */}
          {username && (
            <div className="mt-4 inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-mono text-indigo-400">
              Đang hoạt động: <span className="font-bold text-white">{username}</span> ({role === "Admin" ? "Quản lý" : "Nhân viên"})
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2">
          
          {/* NÚT 1: QR CODE (Bảo vệ bằng quyền truy cập) */}
          <Link
            href="/scan"
            onClick={handleGoToScan}
            className="glass-card group p-8"
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-500/20 text-indigo-400 transition duration-300 group-hover:scale-110">
              <QrCode className="h-10 w-10" />
            </div>
            <h3 className="mb-3 text-3xl font-bold">Quét QR</h3>
            <p className="mb-6 leading-relaxed text-slate-400">
              Mở camera để quét QR sản phẩm áp dụng cho dữ liệu kho.
            </p>
            <div className="btn btn-primary w-fit">Mở Scanner</div>
          </Link>

          {/* NÚT 2: ĐĂNG NHẬP / ĐĂNG XUẤT (Tự động biến đổi giao diện) */}
          {!username ? (
            // Nếu CHƯA ĐĂNG NHẬP -> Hiện nút Đăng Nhập bình thường
            <Link href="/login" className="glass-card group p-8">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/20 text-emerald-400 transition duration-300 group-hover:scale-110">
                <LogIn className="h-10 w-10" />
              </div>
              <h3 className="mb-3 text-3xl font-bold">Đăng nhập</h3>
              <p className="mb-6 leading-relaxed text-slate-400">
                Truy cập hệ thống điều hành quản lý kho.
              </p>
              <div className="btn btn-primary w-fit">Login</div>
            </Link>
          ) : (
            // Nếu ĐÃ ĐĂNG NHẬP -> Biến thành nút Đăng Xuất cực xịn
            <div onClick={handleLogout} className="glass-card group p-8 cursor-pointer">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/20 text-rose-400 transition duration-300 group-hover:scale-110">
                <LogOut className="h-10 w-10" />
              </div>
              <h3 className="mb-3 text-3xl font-bold">Đăng xuất</h3>
              <p className="mb-6 leading-relaxed text-slate-400">
                Thoát tài khoản <span className="text-white font-semibold">{username}</span> khỏi phiên làm việc hiện tại.
              </p>
              <div className="btn bg-gradient-to-r from-rose-500 to-red-600 text-white w-fit">
                Logout
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
