"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/useAdminStore";
import { LogOut, User, ShieldCheck, Settings } from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { adminName, adminRole, clearStore } = useAdminStore();

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
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

  if (!mounted) return <div className="min-h-screen bg-[#0a0f1e]" />;

  return (
    <div className="page-container" style={{ maxWidth: "600px" }}>
      <div className="section-header" style={{ marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-primary)" }}>
            Tài khoản
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
            Quản lý thông tin và bảo mật cá nhân
          </p>
        </div>
      </div>

      <div className="animate-fade-up" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* User Card */}
        <div style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "20px",
          padding: "24px",
          display: "flex",
          alignItems: "center",
          gap: "16px"
        }}>
          <div className="avatar" style={{ width: "64px", height: "64px", fontSize: "24px" }}>
            {adminName?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)" }}>
              {adminName || "Người dùng"}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
              <ShieldCheck size={14} color="#818cf8" />
              <span style={{ fontSize: "13px", color: "#818cf8", fontWeight: "600" }}>
                {adminRole || "Thủ kho"}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
           <div style={{
             padding: "16px",
             background: "rgba(255, 255, 255, 0.02)",
             border: "1px solid var(--border-subtle)",
             borderRadius: "16px",
             display: "flex",
             alignItems: "center",
             justifyContent: "space-between",
             opacity: 0.5
           }}>
             <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
               <Settings size={18} color="var(--text-muted)" />
               <span style={{ fontSize: "14px", fontWeight: "500" }}>Cài đặt hệ thống</span>
             </div>
             <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Coming soon</span>
           </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="btn btn-rose"
          style={{
            width: "100%",
            height: "54px",
            fontSize: "15px",
            marginTop: "20px",
            borderRadius: "16px"
          }}
        >
          <LogOut size={18} />
          Đăng xuất tài khoản
        </button>
      </div>
    </div>
  );
}
