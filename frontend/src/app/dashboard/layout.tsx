"use client";

import React from "react";
import { useAdminStore } from "@/store/useAdminStore";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gọi các trạng thái đóng mở sidebar và tên admin từ Zustand store ra dùng
  const { isSidebarOpen, toggleSidebar, adminName } = useAdminStore();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex">
      {/* 1. THANH SIDEBAR MENU BÊN TRÁI - CO GIÃN THEO TRẠNG THÁI */}
      <aside
        className={`bg-slate-900 text-white min-h-screen transition-all duration-300 flex flex-col fixed left-0 top-0 z-50 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
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
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
        </nav>

        {/* THÔNG TIN BẢN QUYỀN HOẶC PHIÊN BẢN */}
        <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-500">
          {isSidebarOpen ? <p>© 2026 Smart WMS</p> : <p>v1</p>}
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
              {adminName.charAt(0)}
            </div>
            <span className="font-semibold text-sm text-slate-700 hidden sm:inline-block">
              {adminName}
            </span>
          </div>
        </header>

        {/* NƠI HIỂN THỊ CHẠY RUỘT CỦA CÁC TRANG CON VÀO ĐÂY */}
        <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
