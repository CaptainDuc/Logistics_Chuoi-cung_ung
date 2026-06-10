"use client";

import React, { useEffect } from "react";
import { useAdminStore } from "@/store/useAdminStore";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  QrCode,
  User,
  LogOut,
} from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    label: "Tổng quan",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/dashboard/products",
    label: "Sản phẩm",
    icon: Package,
    exact: false,
  },
  {
    href: "/dashboard/scan",
    label: "Quét QR",
    icon: QrCode,
    isScan: true,
  },
  {
    href: "/dashboard/account",
    label: "Tài khoản",
    icon: User,
    exact: false,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const loadUserFromStorage = useAdminStore((state) => state.loadUserFromStorage);

  useEffect(() => {
    loadUserFromStorage();
  }, []); // Run once on mount

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0f1e]">
      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 pb-24 overflow-y-auto">
        {children}
      </main>

      {/* ===== BOTTOM NAVIGATION ===== */}
      <nav className="bottom-nav">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          
          if (item.isScan) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`bottom-nav-item scan-nav-item ${active ? "active" : ""}`}
              >
                <div className="nav-icon-container">
                  <Icon size={28} className="nav-icon" />
                </div>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`bottom-nav-item ${active ? "active" : ""}`}
            >
              <div className="active-indicator" />
              <Icon size={24} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
