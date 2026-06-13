"use client";

import React, { useEffect } from "react";
import { useAdminStore } from "@/store/useAdminStore";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PackageCheck,
  PackageMinus,
  LogOut,
  Menu,
  X,
  Warehouse,
  Users,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
    href: "/dashboard/inbound",
    label: "Nhập kho",
    icon: PackageCheck,
    exact: false,
  },
  {
    href: "/dashboard/outbound",
    label: "Xuất kho",
    icon: PackageMinus,
    exact: false,
  },
];

const adminNavItems = [
  {
    href: "/dashboard/users",
    label: "Quản lý User",
    icon: Users,
    exact: false,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar, adminName, adminRole, clearStore } =
    useAdminStore();
  const loadUserFromStorage = useAdminStore(
    (state) => state.loadUserFromStorage,
  );

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const visibleNavItems = [
    ...navItems,
    ...(adminRole === "Admin" ? adminNavItems : []),
  ];

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
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

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const sidebarW = isSidebarOpen ? "260px" : "72px";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        display: "flex",
      }}
    >
      {/* ===== SIDEBAR ===== */}
      <aside className="sidebar" style={{ width: sidebarW }}>
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: isSidebarOpen ? "space-between" : "center",
            padding: isSidebarOpen ? "0 16px 0 20px" : "0",
            borderBottom: "1px solid var(--border-subtle)",
            flexShrink: 0,
          }}
        >
          {isSidebarOpen && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Warehouse size={18} color="#fff" />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 15,
                    letterSpacing: "-0.02em",
                    background: "linear-gradient(135deg, #818cf8, #c084fc)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Smart WMS
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--text-muted)",
                    marginTop: -1,
                  }}
                >
                  Warehouse System
                </div>
              </div>
            </div>
          )}

          {!isSidebarOpen && (
            <div
              style={{
                width: 36,
                height: 36,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Warehouse size={18} color="#fff" />
            </div>
          )}

          {isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="toggle-btn"
              title="Thu gọn sidebar"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav
          style={{
            flex: 1,
            padding: "16px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {!isSidebarOpen && (
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <button
                onClick={toggleSidebar}
                className="toggle-btn"
                title="Mở rộng sidebar"
              >
                <Menu size={15} />
              </button>
            </div>
          )}

          {isSidebarOpen && (
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                padding: "4px 14px 8px",
              }}
            >
              Menu chính
            </div>
          )}

          {visibleNavItems.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item ${active ? "active" : ""}`}
                title={!isSidebarOpen ? item.label : undefined}
                style={{
                  justifyContent: isSidebarOpen ? "flex-start" : "center",
                  padding: isSidebarOpen ? "10px 14px" : "10px",
                }}
              >
                <span className="nav-indicator" />
                <Icon
                  size={18}
                  className="nav-icon"
                  style={{
                    flexShrink: 0,
                    color: active ? "var(--accent-primary)" : "currentColor",
                    filter: active
                      ? "drop-shadow(0 0 6px rgba(99,102,241,0.6))"
                      : "none",
                    transition: "all 0.2s ease",
                  }}
                />
                {isSidebarOpen && (
                  <span style={{ fontSize: 13.5, fontWeight: 500 }}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: "12px 10px",
            borderTop: "1px solid var(--border-subtle)",
            flexShrink: 0,
          }}
        >
          {/* User info */}
          {isSidebarOpen && adminName && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: 12,
                border: "1px solid var(--border-subtle)",
                marginBottom: 8,
              }}
            >
              <div
                className="avatar"
                style={{ width: 32, height: 32, fontSize: 13 }}
              >
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: "hidden", flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {adminName}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                  {adminRole || "Thủ kho"}
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Đăng xuất"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: isSidebarOpen ? "flex-start" : "center",
              gap: 10,
              width: "100%",
              padding: isSidebarOpen ? "9px 14px" : "9px",
              borderRadius: 10,
              background: "rgba(244, 63, 94, 0.08)",
              border: "1px solid rgba(244, 63, 94, 0.15)",
              color: "#fb7185",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              const t = e.currentTarget;
              t.style.background = "rgba(244, 63, 94, 0.18)";
              t.style.borderColor = "rgba(244, 63, 94, 0.35)";
            }}
            onMouseLeave={(e) => {
              const t = e.currentTarget;
              t.style.background = "rgba(244, 63, 94, 0.08)";
              t.style.borderColor = "rgba(244, 63, 94, 0.15)";
            }}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {isSidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          paddingLeft: sidebarW,
          transition: "padding-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Header */}
        <header className="dashboard-header">
          {!isSidebarOpen && (
            <button onClick={toggleSidebar} className="toggle-btn">
              <Menu size={15} />
            </button>
          )}
          {isSidebarOpen && <div />}

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Time badge */}
            <div
              style={{
                padding: "5px 12px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ color: "var(--accent-emerald)" }}>●</span>
              <span>Đang hoạt động</span>
            </div>

            {/* Avatar + Name */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "5px 12px 5px 6px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
              }}
            >
              <div
                className="avatar"
                style={{ width: 30, height: 30, fontSize: 12 }}
              >
                {adminName ? adminName.charAt(0).toUpperCase() : "A"}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  maxWidth: 140,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {adminRole && adminName
                  ? `${adminRole} · ${adminName}`
                  : "Người dùng"}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1 }}>{children}</main>
      </div>
    </div>
  );
}
