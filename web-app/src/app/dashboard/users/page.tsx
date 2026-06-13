"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  UserPlus,
  Search,
  Loader2,
  Trash2,
  ShieldCheck,
  X,
  RefreshCw,
  UserCircle,
  Lock,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { isAdminUser } from "@/lib/authRole";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ─── Types ───────────────────────────────────────────────
interface UserAccount {
  _id: string;
  username: string;
  email?: string;
  role: "Admin" | "User";
  isActive: boolean;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  total?: number;
}

// ─── Helpers ─────────────────────────────────────────────
function getAuthHeader() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── Add User Modal ───────────────────────────────────────
interface AddUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function AddUserModal({ onClose, onSuccess }: AddUserModalProps) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    role: "User",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!form.username.trim() || !form.password) {
      setError("Tên đăng nhập và mật khẩu là bắt buộc.");
      return;
    }
    if (form.username.trim().length < 3) {
      setError("Tên đăng nhập phải có ít nhất 3 ký tự.");
      return;
    }
    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
          email: form.email.trim() || undefined,
          role: form.role,
        }),
      });
      const data: ApiResponse<UserAccount> = await res.json();
      if (!data.success) {
        setError(data.message || "Tạo tài khoản thất bại.");
        return;
      }
      onSuccess();
      onClose();
    } catch {
      setError("Lỗi kết nối đến server.");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordsMatch =
    form.confirmPassword && form.password === form.confirmPassword;
  const passwordsMismatch =
    form.confirmPassword && form.password !== form.confirmPassword;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        padding: "20px",
        overflowY: "auto",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "var(--bg-card, #1a1b2e)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 16,
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          margin: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))",
                border: "1px solid rgba(99,102,241,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserPlus size={16} color="#818cf8" />
            </div>
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Tạo tài khoản mới
            </span>
          </div>
          <button
            className="btn btn-icon btn-ghost"
            style={{ width: 32, height: 32 }}
            onClick={onClose}
            disabled={isLoading}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {error && (
            <div
              style={{
                padding: "10px 14px",
                background: "rgba(244,63,94,0.08)",
                border: "1px solid rgba(244,63,94,0.2)",
                borderRadius: 9,
                fontSize: 13,
                color: "#fb7185",
              }}
            >
              {error}
            </div>
          )}

          {/* Username */}
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-muted)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              Tên đăng nhập *
            </label>
            <div style={{ position: "relative" }}>
              <UserCircle
                size={15}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  pointerEvents: "none",
                }}
              />
              <input
                className="form-input"
                style={{ paddingLeft: 36 }}
                placeholder="Nhập tên đăng nhập..."
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-muted)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              Mật khẩu *
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={15}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  pointerEvents: "none",
                }}
              />
              <input
                className="form-input"
                style={{ paddingLeft: 36, paddingRight: 40 }}
                type={showPassword ? "text" : "password"}
                placeholder="Tối thiểu 6 ký tự..."
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-muted)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              Xác nhận mật khẩu *
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={15}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  pointerEvents: "none",
                }}
              />
              <input
                className="form-input"
                style={{
                  paddingLeft: 36,
                  paddingRight: 40,
                  borderColor: passwordsMismatch
                    ? "rgba(244,63,94,0.5)"
                    : passwordsMatch
                      ? "rgba(16,185,129,0.5)"
                      : undefined,
                }}
                type={showConfirm ? "text" : "password"}
                placeholder="Nhập lại mật khẩu..."
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {passwordsMismatch && (
              <p
                style={{
                  fontSize: 11.5,
                  color: "#fb7185",
                  marginTop: 5,
                  marginLeft: 2,
                }}
              >
                Mật khẩu không khớp.
              </p>
            )}
            {passwordsMatch && (
              <p
                style={{
                  fontSize: 11.5,
                  color: "#10b981",
                  marginTop: 5,
                  marginLeft: 2,
                }}
              >
                Mật khẩu khớp.
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-muted)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              Email{" "}
              <span style={{ fontWeight: 400, textTransform: "none" }}>
                (tuỳ chọn)
              </span>
            </label>
            <input
              className="form-input"
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={isLoading}
            />
          </div>

          {/* Role */}
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-muted)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              Vai trò
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["User", "Admin"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setForm({ ...form, role: r })}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: "9px 12px",
                    borderRadius: 9,
                    border:
                      form.role === r
                        ? "1px solid rgba(99,102,241,0.5)"
                        : "1px solid var(--border-subtle)",
                    background:
                      form.role === r
                        ? "rgba(99,102,241,0.1)"
                        : "rgba(255,255,255,0.03)",
                    color:
                      form.role === r ? "#818cf8" : "var(--text-secondary)",
                    fontSize: 13,
                    fontWeight: form.role === r ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  {r === "Admin" ? (
                    <ShieldCheck size={14} />
                  ) : (
                    <UserCircle size={14} />
                  )}
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: "0 24px 20px",
          }}
        >
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 20px",
              borderRadius: 9,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none",
              color: "#fff",
              fontSize: 13.5,
              fontWeight: 700,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              transition: "opacity 0.15s ease",
            }}
          >
            {isLoading ? (
              <Loader2 size={14} className="spinner" />
            ) : (
              <UserPlus size={14} />
            )}
            {isLoading ? "Đang tạo..." : "Tạo tài khoản"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Change Password Modal ────────────────────────────────
interface ChangePasswordModalProps {
  user: UserAccount;
  onClose: () => void;
  onSuccess: () => void;
}

function ChangePasswordModal({
  user,
  onClose,
  onSuccess,
}: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordsMatch = confirmPassword && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword && newPassword !== confirmPassword;

  const handleSubmit = async () => {
    setError("");
    if (!newPassword) {
      setError("Vui lòng nhập mật khẩu mới.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/${user._id}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify({ password: newPassword }),
      });
      const data: ApiResponse<UserAccount> = await res.json();
      if (!data.success) {
        setError(data.message || "Đổi mật khẩu thất bại.");
        return;
      }
      onSuccess();
      onClose();
    } catch {
      setError("Lỗi kết nối đến server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        padding: "20px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "var(--bg-card, #1a1b2e)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 16,
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                background:
                  "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,191,36,0.1))",
                border: "1px solid rgba(245,158,11,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <KeyRound size={16} color="#f59e0b" />
            </div>
            <div>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  lineHeight: 1.2,
                }}
              >
                Đổi mật khẩu
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                Tài khoản:{" "}
                <span style={{ color: "#818cf8", fontWeight: 600 }}>
                  {user.username}
                </span>
              </p>
            </div>
          </div>
          <button
            className="btn btn-icon btn-ghost"
            style={{ width: 32, height: 32 }}
            onClick={onClose}
            disabled={isLoading}
          >
            <X size={15} />
          </button>
        </div>

        {/* Info banner */}
        <div
          style={{
            margin: "16px 24px 0",
            padding: "10px 14px",
            background: "rgba(245,158,11,0.07)",
            border: "1px solid rgba(245,158,11,0.18)",
            borderRadius: 9,
            fontSize: 12.5,
            color: "rgba(245,158,11,0.9)",
            lineHeight: 1.5,
          }}
        >
          Mật khẩu mới sẽ có hiệu lực ngay lập tức. Người dùng cần đăng nhập lại
          bằng mật khẩu mới.
        </div>

        {/* Body */}
        <div
          style={{
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {error && (
            <div
              style={{
                padding: "10px 14px",
                background: "rgba(244,63,94,0.08)",
                border: "1px solid rgba(244,63,94,0.2)",
                borderRadius: 9,
                fontSize: 13,
                color: "#fb7185",
              }}
            >
              {error}
            </div>
          )}

          {/* New password */}
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-muted)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              Mật khẩu mới *
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={15}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  pointerEvents: "none",
                }}
              />
              <input
                className="form-input"
                style={{ paddingLeft: 36, paddingRight: 40 }}
                type={showNew ? "text" : "password"}
                placeholder="Tối thiểu 6 ký tự..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm new password */}
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-muted)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              Xác nhận mật khẩu mới *
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={15}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  pointerEvents: "none",
                }}
              />
              <input
                className="form-input"
                style={{
                  paddingLeft: 36,
                  paddingRight: 40,
                  borderColor: passwordsMismatch
                    ? "rgba(244,63,94,0.5)"
                    : passwordsMatch
                      ? "rgba(16,185,129,0.5)"
                      : undefined,
                }}
                type={showConfirm ? "text" : "password"}
                placeholder="Nhập lại mật khẩu mới..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {passwordsMismatch && (
              <p
                style={{
                  fontSize: 11.5,
                  color: "#fb7185",
                  marginTop: 5,
                  marginLeft: 2,
                }}
              >
                Mật khẩu không khớp.
              </p>
            )}
            {passwordsMatch && (
              <p
                style={{
                  fontSize: 11.5,
                  color: "#10b981",
                  marginTop: 5,
                  marginLeft: 2,
                }}
              >
                Mật khẩu khớp.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: "0 24px 20px",
          }}
        >
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !!passwordsMismatch}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 20px",
              borderRadius: 9,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              border: "none",
              color: "#fff",
              fontSize: 13.5,
              fontWeight: 700,
              cursor:
                isLoading || !!passwordsMismatch ? "not-allowed" : "pointer",
              opacity: isLoading || !!passwordsMismatch ? 0.6 : 1,
              transition: "opacity 0.15s ease",
            }}
          >
            {isLoading ? (
              <Loader2 size={14} className="spinner" />
            ) : (
              <KeyRound size={14} />
            )}
            {isLoading ? "Đang lưu..." : "Đổi mật khẩu"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toggle Confirm Modal ────────────────────────────────
interface ToggleConfirmModalProps {
  user: UserAccount;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

function ToggleConfirmModal({
  user,
  onClose,
  onConfirm,
  isLoading,
}: ToggleConfirmModalProps) {
  const willLock = user.isActive;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        padding: "20px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--bg-card, #1a1b2e)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 16,
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                background: willLock
                  ? "rgba(244,63,94,0.1)"
                  : "rgba(16,185,129,0.1)",
                border: willLock
                  ? "1px solid rgba(244,63,94,0.25)"
                  : "1px solid rgba(16,185,129,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {willLock ? (
                <ToggleLeft size={16} color="#fb7185" />
              ) : (
                <ToggleRight size={16} color="#10b981" />
              )}
            </div>
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {willLock ? "Khóa tài khoản?" : "Mở khóa tài khoản?"}
            </span>
          </div>
          <button
            className="btn btn-icon btn-ghost"
            style={{ width: 32, height: 32 }}
            onClick={onClose}
            disabled={isLoading}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 24px" }}>
          <p
            style={{
              fontSize: 13.5,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}
          >
            {willLock ? (
              <>
                Bạn có chắc muốn{" "}
                <strong style={{ color: "#fb7185" }}>khóa</strong> tài khoản{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  "{user.username}"
                </strong>
                ? Người dùng sẽ không thể đăng nhập cho đến khi được mở khóa.
              </>
            ) : (
              <>
                Bạn có chắc muốn{" "}
                <strong style={{ color: "#10b981" }}>mở khóa</strong> tài khoản{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  "{user.username}"
                </strong>
                ? Người dùng sẽ có thể đăng nhập trở lại.
              </>
            )}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: "0 24px 20px",
          }}
        >
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 20px",
              borderRadius: 9,
              background: willLock
                ? "linear-gradient(135deg, #f43f5e, #e11d48)"
                : "linear-gradient(135deg, #10b981, #059669)",
              border: "none",
              color: "#fff",
              fontSize: 13.5,
              fontWeight: 700,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              transition: "opacity 0.15s ease",
            }}
          >
            {isLoading ? (
              <Loader2 size={14} className="spinner" />
            ) : willLock ? (
              <ToggleLeft size={14} />
            ) : (
              <ToggleRight size={14} />
            )}
            {isLoading
              ? "Đang xử lý..."
              : willLock
                ? "Khóa tài khoản"
                : "Mở khóa"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Role Badge ───────────────────────────────────────────
function RoleBadge({ role }: { role: "Admin" | "User" }) {
  const isAdmin = role === "Admin";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 9px",
        borderRadius: 20,
        fontSize: 11.5,
        fontWeight: 700,
        letterSpacing: "0.03em",
        background: isAdmin
          ? "rgba(99,102,241,0.12)"
          : "rgba(255,255,255,0.06)",
        border: isAdmin
          ? "1px solid rgba(99,102,241,0.3)"
          : "1px solid var(--border-subtle)",
        color: isAdmin ? "#818cf8" : "var(--text-muted)",
      }}
    >
      {isAdmin ? <ShieldCheck size={11} /> : <UserCircle size={11} />}
      {role}
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────
function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 9px",
        borderRadius: 20,
        fontSize: 11.5,
        fontWeight: 600,
        background: isActive ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.08)",
        border: isActive
          ? "1px solid rgba(16,185,129,0.25)"
          : "1px solid rgba(244,63,94,0.2)",
        color: isActive ? "var(--accent-emerald, #10b981)" : "#fb7185",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "currentColor",
          display: "inline-block",
        }}
      />
      {isActive ? "Hoạt động" : "Đã khóa"}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | "Admin" | "User">("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserAccount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<UserAccount | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [changePasswordTarget, setChangePasswordTarget] =
    useState<UserAccount | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = useCallback(
    async (quiet = false) => {
      if (!quiet) setIsLoading(true);
      else setIsRefreshing(true);
      try {
        const params = new URLSearchParams();
        if (roleFilter) params.set("role", roleFilter);
        const res = await fetch(`${API_URL}/users?${params}`, {
          headers: getAuthHeader(),
        });
        const data: ApiResponse<UserAccount[]> = await res.json();
        if (data.success) setUsers(data.data);
      } catch {
        showToast("Không thể tải danh sách tài khoản.", "error");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [roleFilter],
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/users/${deleteTarget._id}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      const data: ApiResponse<UserAccount> = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
        showToast(`Đã xóa tài khoản "${deleteTarget.username}".`, "success");
      } else {
        showToast(data.message || "Xóa thất bại.", "error");
      }
    } catch {
      showToast("Lỗi kết nối.", "error");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Now called only after confirm modal
  const handleToggleActive = async () => {
    if (!toggleTarget) return;
    setIsToggling(true);
    try {
      const res = await fetch(`${API_URL}/users/${toggleTarget._id}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify({ isActive: !toggleTarget.isActive }),
      });
      const data: ApiResponse<UserAccount> = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === toggleTarget._id
              ? { ...u, isActive: !toggleTarget.isActive }
              : u,
          ),
        );
        showToast(
          `Tài khoản "${toggleTarget.username}" đã ${
            !toggleTarget.isActive ? "được mở khóa" : "bị khóa"
          }.`,
          "success",
        );
      } else {
        showToast(data.message || "Thao tác thất bại.", "error");
      }
    } catch {
      showToast("Lỗi kết nối.", "error");
    } finally {
      setIsToggling(false);
      setToggleTarget(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ── Loading state ──
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: "3px solid rgba(99,102,241,0.15)",
              borderTopColor: "#6366f1",
              borderRadius: "50%",
              margin: "0 auto 16px",
            }}
            className="spinner"
          />
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Đang tải danh sách tài khoản...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* ── Toast ── */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            padding: "11px 18px",
            borderRadius: 10,
            fontSize: 13.5,
            fontWeight: 600,
            background:
              toast.type === "success"
                ? "rgba(16,185,129,0.12)"
                : "rgba(244,63,94,0.12)",
            border:
              toast.type === "success"
                ? "1px solid rgba(16,185,129,0.3)"
                : "1px solid rgba(244,63,94,0.3)",
            color: toast.type === "success" ? "#10b981" : "#fb7185",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            backdropFilter: "blur(8px)",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="section-header">
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
              }}
            >
              <Users size={18} color="#fff" />
            </div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              Quản lý tài khoản
            </h1>
          </div>
          <p
            style={{ fontSize: 13, color: "var(--text-muted)", paddingLeft: 2 }}
          >
            Xem, tạo và quản lý tài khoản hệ thống. ·{" "}
            <strong style={{ color: "var(--text-secondary)" }}>
              {users.length} tài khoản
            </strong>
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            className="btn btn-ghost"
            onClick={() => fetchUsers(true)}
            disabled={isRefreshing}
            title="Làm mới"
          >
            <RefreshCw size={14} className={isRefreshing ? "spinner" : ""} />
            {isRefreshing ? "Đang tải..." : "Làm mới"}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 18px",
              borderRadius: 9,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none",
              color: "#fff",
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
            }}
          >
            <UserPlus size={15} />
            Thêm tài khoản
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <div
          className="search-bar"
          style={{ maxWidth: 340, flex: "1 1 240px" }}
        >
          <Search size={15} className="search-icon" />
          <input
            className="form-input search-bar"
            style={{ paddingLeft: 38 }}
            type="text"
            placeholder="Tìm theo tên, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Role filter pills */}
        <div style={{ display: "flex", gap: 6 }}>
          {(["", "Admin", "User"] as const).map((r) => (
            <button
              key={r || "all"}
              onClick={() => setRoleFilter(r)}
              style={{
                padding: "7px 14px",
                borderRadius: 20,
                border:
                  roleFilter === r
                    ? "1px solid rgba(99,102,241,0.45)"
                    : "1px solid var(--border-subtle)",
                background:
                  roleFilter === r
                    ? "rgba(99,102,241,0.1)"
                    : "rgba(255,255,255,0.03)",
                color: roleFilter === r ? "#818cf8" : "var(--text-muted)",
                fontSize: 12.5,
                fontWeight: roleFilter === r ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {r === "Admin" && <ShieldCheck size={12} />}
              {r === "User" && <UserCircle size={12} />}
              {r || "Tất cả"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      {filteredUsers.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <Users size={48} style={{ opacity: 0.2 }} />
          <p style={{ fontSize: 14, fontWeight: 500 }}>
            {searchQuery
              ? "Không tìm thấy tài khoản nào."
              : "Chưa có tài khoản nào."}
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {/* Table head */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr auto",
              gap: 12,
              padding: "11px 20px",
              background: "rgba(255,255,255,0.03)",
              borderBottom: "1px solid var(--border-subtle)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            <span>Tên đăng nhập</span>
            <span>Email</span>
            <span>Vai trò</span>
            <span>Trạng thái</span>
            <span>Ngày tạo</span>
            <span>Thao tác</span>
          </div>

          {/* Rows */}
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr auto",
                gap: 12,
                padding: "14px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                alignItems: "center",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.025)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {/* Username */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background:
                      user.role === "Admin"
                        ? "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))"
                        : "rgba(255,255,255,0.06)",
                    border:
                      user.role === "Admin"
                        ? "1px solid rgba(99,102,241,0.3)"
                        : "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color:
                      user.role === "Admin" ? "#818cf8" : "var(--text-muted)",
                    flexShrink: 0,
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  {user.username}
                </span>
              </div>

              {/* Email */}
              <span
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.email || <span style={{ opacity: 0.4 }}>—</span>}
              </span>

              {/* Role */}
              <div>
                <RoleBadge role={user.role} />
              </div>

              {/* Status */}
              <div>
                <StatusBadge isActive={user.isActive} />
              </div>

              {/* Created */}
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {formatDate(user.createdAt)}
              </span>

              {/* Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {/* Change password */}
                <button
                  onClick={() => setChangePasswordTarget(user)}
                  title="Đổi mật khẩu"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "1px solid rgba(245,158,11,0.2)",
                    background: "rgba(245,158,11,0.06)",
                    color: "#f59e0b",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(245,158,11,0.14)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(245,158,11,0.06)";
                  }}
                >
                  <KeyRound size={14} />
                </button>

                {/* Toggle active — now opens confirm modal */}
                <button
                  onClick={() => setToggleTarget(user)}
                  title={user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "1px solid var(--border-subtle)",
                    background: "rgba(255,255,255,0.03)",
                    color: user.isActive ? "#10b981" : "#fb7185",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  }}
                >
                  {user.isActive ? (
                    <ToggleRight size={14} />
                  ) : (
                    <ToggleLeft size={14} />
                  )}
                </button>

                {/* Delete */}
                <button
                  onClick={() => setDeleteTarget(user)}
                  title="Xóa tài khoản"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "1px solid rgba(244,63,94,0.2)",
                    background: "rgba(244,63,94,0.06)",
                    color: "#fb7185",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(244,63,94,0.14)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(244,63,94,0.06)";
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Modal ── */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchUsers(true);
            showToast("Tạo tài khoản thành công.", "success");
          }}
        />
      )}

      {/* ── Change Password Modal ── */}
      {changePasswordTarget && (
        <ChangePasswordModal
          user={changePasswordTarget}
          onClose={() => setChangePasswordTarget(null)}
          onSuccess={() =>
            showToast(
              `Đã đổi mật khẩu cho "${changePasswordTarget.username}".`,
              "success",
            )
          }
        />
      )}

      {/* ── Toggle Confirm Modal ── */}
      {toggleTarget && (
        <ToggleConfirmModal
          user={toggleTarget}
          onClose={() => setToggleTarget(null)}
          onConfirm={handleToggleActive}
          isLoading={isToggling}
        />
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-panel" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: "rgba(244,63,94,0.12)",
                    border: "1px solid rgba(244,63,94,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Trash2 size={16} color="#fb7185" />
                </div>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  Xóa tài khoản?
                </span>
              </div>
              <button
                className="btn btn-icon btn-ghost"
                style={{ width: 32, height: 32 }}
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                <X size={15} />
              </button>
            </div>

            <div className="modal-body">
              <p
                style={{
                  fontSize: 13.5,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                Bạn có chắc muốn xóa tài khoản{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  "{deleteTarget.username}"
                </strong>
                ? Thao tác này không thể hoàn tác.
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-ghost"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Hủy
              </button>
              <button
                className="btn btn-rose"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting && <Loader2 size={14} className="spinner" />}
                {isDeleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
