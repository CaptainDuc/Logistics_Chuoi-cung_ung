"use client";

import React from "react";
import { useAdminStore } from "@/store/useAdminStore";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Gọi các trạng thái đóng mở sidebar, tên admin và hàm xóa store (nếu có) từ Zustand store ra dùng
  // Thêm clearStore từ useAdminStore để xóa sạch dữ liệu khi đăng xuất
  const { isSidebarOpen, toggleSidebar, adminName, clearStore } =
    useAdminStore() as any;

  // Hàm xử lý Đăng xuất đồng bộ hệ thống
  const handleLogout = () => {
    // 1. Xóa thông tin trạng thái user trong Zustand Store (nếu Đức có viết hàm xóa)
    if (clearStore) {
      clearStore();
    }

    // 2. Xóa sạch cookie để middleware chặn lại không cho lọt vào dashboard nữa
    document.cookie = "auth_token=; path=/; max-age=0; SameSite=Strict";

    // 3. Đẩy thủ kho văng ngược ra trang login
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex">
      {/* 1. THANH SIDEBAR MENU BÊN TRÁI - CO GIÃN THEO TRẠNG THÁI */}
      <aside
        className={`bg-slate-900 text-white min-h-screen transition-all duration-300 flex flex-col fixed left-0 top-0 z-50 justify-between ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div>
          {/* LOGO HỆ THỐNG */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
            {isSidebarOpen ? (
              <span className="font-bold text-lg text-emerald-400 tracking-wider">
                Smart WMS
              </span>
            ) : (
              <span className="font-bold text-lg text-emerald-400 mx-auto">
                WMS
              </span>
            )}
          </div>

          {/* CÁC NÚT ĐIỀU HƯỚNG MENU TỚI CÁC TAB */}
          <nav className="p-4 space-y-2 overflow-y-auto">
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-colors group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">
                📊
              </span>
              {isSidebarOpen && (
                <span className="font-medium text-sm">Tổng quan Dashboard</span>
              )}
            </Link>

            <Link
              href="/dashboard/products"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-colors group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">
                📦
              </span>
              {isSidebarOpen && (
                <span className="font-medium text-sm">Quản lý sản phẩm</span>
              )}
            </Link>

            <Link
              href="/dashboard/inbound"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-colors group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">
                📥
              </span>
              {isSidebarOpen && (
                <span className="font-medium text-sm">Quản lý nhập kho</span>
              )}
            </Link>

            <Link
              href="/dashboard/outbound"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-colors group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">
                📤
              </span>
              {isSidebarOpen && (
                <span className="font-medium text-sm">Quản lý xuất kho</span>
              )}
            </Link>
          </nav>
        </div>

        {/* PHẦN DƯỚI CÙNG SIDEBAR: GỒM NÚT LOGOUT VÀ THÔNG TIN PHIÊN BẢN */}
        <div className="flex flex-col space-y-2">
          {/* NÚT BẤM ĐĂNG XUẤT HỆ THỐNG */}
          <div className="px-4">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-600 hover:text-white transition-all text-left font-medium text-sm ${
                isSidebarOpen
                  ? "px-4 py-3 justify-start space-x-3"
                  : "p-3 justify-center"
              }`}
              title="Đăng xuất hệ thống"
            >
              <span className="text-lg">🚪</span>
              {isSidebarOpen && <span>Đăng xuất</span>}
            </button>
          </div>

          {/* THÔNG TIN BẢN QUYỀN HOẶC PHIÊN BẢN */}
          <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-500">
            {isSidebarOpen ? <p>© 2026 Smart WMS</p> : <p>v1</p>}
          </div>
        </div>
      </aside>

      {/* 2. KHU VỰC CHỨA NỘI DUNG LỚN BÊN PHẢI (NAVBAR + MAIN CONTENT) */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isSidebarOpen ? "pl-64" : "pl-20"
        }`}
      >
        {/* THANH NAVBAR PHÍA TRÊN CỐ ĐỊNH */}
        <header className="h-16 bg-white shadow-sm border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
          {/* Nút bấm ẩn/hiện Sidebar nhanh */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors focus:outline-none"
          >
            {isSidebarOpen ? "◀" : "▶"}
          </button>

          {/* Avatar và Tên của Đức lấy trực tiếp từ Zustand */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm">
              {adminName ? adminName.charAt(0).toUpperCase() : "A"}
            </div>
            <span className="font-semibold text-sm text-slate-700 hidden sm:inline-block">
              {adminName || "Admin"}
            </span>
          </div>
        </header>

        {/* NƠI HIỂN THỊ CHẠY RUỘT CỦA CÁC TRANG CON VÀO ĐÂY */}
        <main className="flex-1 p-6 max-w-1600 w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
