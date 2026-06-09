"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Loader2,
  UserPlus,
  ShieldCheck,
  UserX,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";
import { useToastStore } from "@/store/useToastStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface UserItem {
  _id: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const { adminName, adminRole } = useAdminStore();
  const toast = useToastStore((s) => s.show);

  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  // Create modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("User");
  const [isCreating, setIsCreating] = useState(false);

  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserItem | null>(null);
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = adminRole === "Admin";

  const getAuthHeaders = () => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (roleFilter) params.append("role", roleFilter);
      if (activeFilter) params.append("isActive", activeFilter);

      const response = await fetch(`${API_URL}/users?${params.toString()}`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        toast(data.message || "Không thể tải danh sách tài khoản.", "error");
      }
    } catch {
      toast("Lỗi kết nối server.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, roleFilter, activeFilter]);

  const handleCreate = async () => {
    if (!newUsername || !newPassword) {
      toast("Vui lòng điền đầy đủ thông tin.", "error");
      return;
    }
    if (newUsername.length < 3 || newPassword.length < 6) {
      toast("Username tối thiểu 3 ký tự, password tối thiểu 6 ký tự.", "error");
      return;
    }
    setIsCreating(true);
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast("Tạo tài khoản thành công.", "success");
        setIsCreateOpen(false);
        setNewUsername("");
        setNewPassword("");
        setNewRole("User");
        fetchUsers();
      } else {
        toast(data.message || "Tạo tài khoản thất bại.", "error");
      }
    } catch {
      toast("Lỗi server khi tạo tài khoản.", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setIsEditing(true);
    try {
      const body: Record<string, unknown> = {};
      if (editPassword) body.password = editPassword;
      if (editRole) body.role = editRole;
      body.isActive = editActive;

      const res = await fetch(`${API_URL}/users/${editTarget._id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        toast("Cập nhật tài khoản thành công.", "success");
        setIsEditOpen(false);
        fetchUsers();
      } else {
        toast(data.message || "Cập nhật thất bại.", "error");
      }
    } catch {
      toast("Lỗi server khi cập nhật.", "error");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/users/${deleteTarget._id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        toast("Đã xóa tài khoản.", "success");
        setDeleteTarget(null);
        fetchUsers();
      } else {
        toast(data.message || "Xóa thất bại.", "error");
      }
    } catch {
      toast("Lỗi server khi xóa tài khoản.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const openEdit = (user: UserItem) => {
    setEditTarget(user);
    setEditPassword("");
    setEditRole(user.role);
    setEditActive(user.isActive);
    setIsEditOpen(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="page-container">
      {/* ===== HEADER ===== */}
      <div className="section-header">
        <div>
          <div
            style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(139,92,246,0.3)",
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
              Quản lý Tài Khoản
            </h1>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", paddingLeft: 2 }}>
            Quản lý nhân viên, phân quyền và trạng thái tài khoản.
            {isAdmin && (
              <span style={{ color: "#8b5cf6", fontWeight: 600 }}>
                {" "}
                · Quyền Admin
              </span>
            )}
          </p>
        </div>

        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => setIsCreateOpen(true)}
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
              boxShadow: "0 4px 16px rgba(139,92,246,0.3)",
            }}
          >
            <UserPlus size={15} />
            Tạo tài khoản
          </button>
        )}
      </div>

      {/* ===== FILTERS ===== */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <div className="search-bar" style={{ maxWidth: 300 }}>
          <Search size={15} className="search-icon" />
          <input
            className="form-input"
            style={{ paddingLeft: 38 }}
            type="text"
            placeholder="Tìm username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Role filter */}
        <select
          className="form-input"
          style={{ maxWidth: 160 }}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">Tất cả vai trò</option>
          <option value="Admin">Admin</option>
          <option value="User">Nhân viên</option>
        </select>

        {/* Active filter */}
        <select
          className="form-input"
          style={{ maxWidth: 160 }}
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Bị khóa</option>
        </select>
      </div>

      {/* ===== TABLE ===== */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-default)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Cập nhật lần cuối</th>
                {isAdmin && <th style={{ textAlign: "right" }}>Hành động</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5}>
                    <div className="empty-state" style={{ padding: 48 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          border: "3px solid rgba(99,102,241,0.2)",
                          borderTopColor: "#6366f1",
                          borderRadius: "50%",
                        }}
                        className="spinner"
                      />
                      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        Đang tải danh sách...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5}>
                    <div className="empty-state">
                      <Users size={40} style={{ opacity: 0.2 }} />
                      <span style={{ fontSize: 13 }}>
                        Không tìm thấy tài khoản nào.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            background: user.role === "Admin"
                              ? "rgba(139,92,246,0.12)"
                              : "rgba(99,102,241,0.08)",
                            border: user.role === "Admin"
                              ? "1px solid rgba(139,92,246,0.2)"
                              : "1px solid rgba(99,102,241,0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {user.role === "Admin" ? (
                            <ShieldCheck size={16} color="#8b5cf6" />
                          ) : (
                            <Users size={16} color="#6366f1" />
                          )}
                        </div>
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: 13.5,
                            color: "var(--text-primary)",
                          }}
                        >
                          {user.username}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          user.role === "Admin" ? "badge-purple" : "badge-blue"
                        }`}
                        style={
                          user.role === "Admin"
                            ? {
                                background: "rgba(139,92,246,0.1)",
                                border: "1px solid rgba(139,92,246,0.25)",
                                color: "#8b5cf6",
                              }
                            : {
                                background: "rgba(99,102,241,0.08)",
                                border: "1px solid rgba(99,102,241,0.2)",
                                color: "#818cf8",
                              }
                        }
                      >
                        {user.role === "Admin" ? "Admin" : "Nhân viên"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${user.isActive ? "badge-success" : "badge-danger"}`}
                      >
                        {user.isActive ? (
                          <>
                            <CheckCircle size={9} /> Đang hoạt động
                          </>
                        ) : (
                          <>
                            <XCircle size={9} /> Bị khóa
                          </>
                        )}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {formatDate(user.updatedAt)}
                      </span>
                    </td>
                    {isAdmin && (
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            className="btn btn-icon btn-ghost"
                            onClick={() => openEdit(user)}
                            title="Chỉnh sửa"
                            style={{ width: 32, height: 32 }}
                          >
                            <Edit3 size={14} color="var(--accent-primary)" />
                          </button>
                          <button
                            className="btn btn-icon btn-ghost"
                            onClick={() => setDeleteTarget(user)}
                            title="Xóa tài khoản"
                            style={{ width: 32, height: 32 }}
                            disabled={user.username === adminName}
                          >
                            <Trash2 size={14} color="#fb7185" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MODAL: CREATE ===== */}
      {isCreateOpen && (
        <div className="modal-overlay">
          <div className="modal-panel">
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: "rgba(139,92,246,0.12)",
                    border: "1px solid rgba(139,92,246,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UserPlus size={16} color="#8b5cf6" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                    Tạo tài khoản mới
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Tạo tài khoản cho nhân viên mới
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="btn btn-icon btn-ghost"
                style={{ width: 32, height: 32 }}
              >
                <X size={15} />
              </button>
            </div>

            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="form-label">Username</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Tên đăng nhập (3-50 ký tự)"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Mật khẩu</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Vai trò</label>
                <select
                  className="form-input"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="User">Nhân viên (User)</option>
                  <option value="Admin">Quản trị (Admin)</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setIsCreateOpen(false)}>
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={isCreating}
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
                  boxShadow: "0 4px 16px rgba(139,92,246,0.3)",
                }}
              >
                {isCreating ? <Loader2 size={14} className="spinner" /> : <CheckCircle size={14} />}
                {isCreating ? "Đang tạo..." : "Tạo tài khoản"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: EDIT ===== */}
      {isEditOpen && editTarget && (
        <div className="modal-overlay">
          <div className="modal-panel">
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: "rgba(99,102,241,0.12)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Edit3 size={16} color="#818cf8" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                    Chỉnh sửa: {editTarget.username}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Đổi mật khẩu, vai trò hoặc khóa tài khoản
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="btn btn-icon btn-ghost"
                style={{ width: 32, height: 32 }}
              >
                <X size={15} />
              </button>
            </div>

            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="form-label">Mật khẩu mới (bỏ trống nếu không đổi)</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Để trống = giữ nguyên mật khẩu cũ"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Vai trò</label>
                <select
                  className="form-input"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                >
                  <option value="User">Nhân viên (User)</option>
                  <option value="Admin">Quản trị (Admin)</option>
                </select>
              </div>
              <div>
                <label className="form-label">Trạng thái tài khoản</label>
                <div style={{ display: "flex", gap: 12 }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      fontSize: 13.5,
                      color: "var(--text-secondary)",
                    }}
                  >
                    <input
                      type="radio"
                      checked={editActive}
                      onChange={() => setEditActive(true)}
                    />
                    <CheckCircle size={14} color="#10b981" />
                    Hoạt động
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      fontSize: 13.5,
                      color: "var(--text-secondary)",
                    }}
                  >
                    <input
                      type="radio"
                      checked={!editActive}
                      onChange={() => setEditActive(false)}
                    />
                    <XCircle size={14} color="#fb7185" />
                    Bị khóa
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setIsEditOpen(false)}>
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleEdit}
                disabled={isEditing}
              >
                {isEditing ? <Loader2 size={14} className="spinner" /> : <CheckCircle size={14} />}
                {isEditing ? "Đang cập nhật..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: DELETE CONFIRM ===== */}
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
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                  Xóa tài khoản?
                </span>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn btn-icon btn-ghost"
                style={{ width: 32, height: 32 }}
              >
                <X size={15} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Bạn có chắc muốn xóa tài khoản{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  "{deleteTarget.username}"
                </strong>{" "}
                ({deleteTarget.role === "Admin" ? "Admin" : "Nhân viên"})?
                <br />
                <span style={{ color: "#fb7185", fontSize: 12 }}>
                  Thao tác này không thể hoàn tác.
                </span>
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
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
