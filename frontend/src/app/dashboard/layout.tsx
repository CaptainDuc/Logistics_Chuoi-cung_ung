"use client";

import React, { useEffect } from "react";
import { useAdminStore } from "@/store/useAdminStore";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar, adminName, adminRole, clearStore } =
    useAdminStore();
  const loadUserFromStorage = useAdminStore(
    (state) => state.loadUserFromStorage
  );

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    try {
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout API failed:", error);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    clearStore();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex">
      <aside
        className={`bg-slate-900 text-white min-h-screen transition-all duration-300 flex flex-col fixed left-0 top-0 z-50 justify-between ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div>
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

        <div className="flex flex-col space-y-2">
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
          <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-500">
            {isSidebarOpen ? <p>© 2026 Smart WMS</p> : <p>v1</p>}
          </div>
        </div>
      </aside>

      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isSidebarOpen ? "pl-64" : "pl-20"
        }`}
      >
        <header className="h-16 bg-white shadow-sm border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors focus:outline-none"
          >
            {isSidebarOpen ? "◀" : "▶"}
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm">
              {adminName ? adminName.charAt(0).toUpperCase() : "A"}
            </div>
            <span className="font-semibold text-sm text-slate-700 hidden sm:inline-block">
              {adminRole && adminName
                ? `${adminRole} ${adminName}`
                : "Người dùng"}
            </span>
          </div>
        </header>
        <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
