"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Check,
  X,
  PackageMinus,
  FileText,
  FileSpreadsheet,
  Loader2,
  MapPin,
  Hash,
  ArrowUpToLine,
  AlertTriangle,
  CheckCircle,
  User,
} from "lucide-react";
import { useWarehouseStore } from "@/store/useWarehouseStore";
import { useToastStore } from "@/store/useToastStore";
import { getFetchErrorMessage } from "@/lib/apiError";
import { isAdminUser } from "@/lib/authRole";
import { useAdminStore } from "@/store/useAdminStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function OutboundPage() {
  const { adminName } = useAdminStore();
  const { products, isLoading, fetchProducts, addInventoryTransaction } = useWarehouseStore();

  useEffect(() => {
    if (fetchProducts) fetchProducts();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ productSku: "", qty: 1, customerName: "" });
  const toast = useToastStore((s) => s.show);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(isAdminUser());
  }, []);

  const handleOpenModal = () => {
    if (products && products.length > 0) {
      const firstProduct = products[0];
      if (firstProduct) {
        setFormData({ productSku: firstProduct.sku || "", qty: 1, customerName: "" });
      }
    } else {
      setFormData({ productSku: "", qty: 1, customerName: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productSku) {
      toast("Vui lòng chọn một sản phẩm để xuất kho.", "error");
      return;
    }
    const selectedProduct = products.find((p) => p.sku === formData.productSku);
    if (selectedProduct && formData.qty > (selectedProduct.quantity || 0)) {
      toast(`Số lượng xuất (${formData.qty}) vượt quá tồn kho hiện có (${selectedProduct.quantity || 0}).`, "error");
      return;
    }
    setIsSubmitting(true);
    const result = await addInventoryTransaction({
      sku: formData.productSku,
      type: "Export",
      quantity: formData.qty,
    });
    setIsSubmitting(false);
    if (result.ok) {
      toast("Xuất kho thành công.", "success");
      setIsModalOpen(false);
    } else {
      toast(result.message, "error");
    }
  };

  const handleExportOutboundExcel = async () => {
    if (!isAdmin) {
      toast("Chỉ tài khoản Admin mới được xuất Excel.", "error");
      return;
    }
    setIsExporting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/inventory/export-excel?type=Export`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const msg = await getFetchErrorMessage(response, "Không thể xuất Excel xuất kho.");
        throw new Error(msg);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bao-cao-xuat-kho.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast("Đã tải file Excel xuất kho.", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Xuất Excel xuất kho thất bại!", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const safeProducts = products || [];
  const filteredProducts = safeProducts.filter(
    (product) =>
      (product.sku || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.location || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48, height: 48,
              border: "3px solid rgba(244,63,94,0.15)",
              borderTopColor: "#f43f5e",
              borderRadius: "50%",
              margin: "0 auto 16px",
            }}
            className="spinner"
          />
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Đang tải dữ liệu kho hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* ===== PAGE HEADER ===== */}
      <div className="section-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div
              style={{
                width: 38, height: 38, borderRadius: 10,
                background: "linear-gradient(135deg, #e11d48, #f43f5e)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 16px rgba(244,63,94,0.3)",
              }}
            >
              <PackageMinus size={18} color="#fff" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Quản lý Xuất Kho
            </h1>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", paddingLeft: 2 }}>
            Lập phiếu xuất kho giao hàng và cập nhật số lượng tồn kho thực tế.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isAdmin && (
            <button
              className="btn btn-emerald"
              onClick={handleExportOutboundExcel}
              disabled={isExporting}
            >
              {isExporting ? <Loader2 size={14} className="spinner" /> : <FileSpreadsheet size={14} />}
              {isExporting ? "Đang xuất..." : "Xuất Excel"}
            </button>
          )}
          <button
            className="btn btn-rose"
            onClick={handleOpenModal}
          >
            <Plus size={15} />
            Tạo phiếu xuất kho
          </button>
        </div>
      </div>

      {/* ===== SEARCH ===== */}
      <div className="search-bar" style={{ marginBottom: 20, maxWidth: 400 }}>
        <Search size={15} className="search-icon" />
        <input
          className="form-input"
          style={{ paddingLeft: 38 }}
          type="text"
          placeholder="Tìm sản phẩm theo SKU, tên, vị trí..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ===== TABLE ===== */}
      <div
        className="animate-fade-up"
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
                <th>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Hash size={11} />Mã SKU
                  </span>
                </th>
                <th>Tên sản phẩm</th>
                <th>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <MapPin size={11} />Vị trí kệ
                  </span>
                </th>
                <th style={{ textAlign: "right" }}>Số lượng tồn</th>
                <th>Trạng thái kho</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const isAtMin = product.quantity <= product.minQuantity;
                  return (
                    <tr key={product._id}>
                      <td>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#fb7185",
                            background: "rgba(244,63,94,0.08)",
                            padding: "3px 8px",
                            borderRadius: 5,
                            border: "1px solid rgba(244,63,94,0.2)",
                          }}
                        >
                          {product.sku}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13.5 }}>
                          {product.name}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13 }}>
                          <MapPin size={12} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                          {product.location || (
                            <em style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Chưa xếp kệ</em>
                          )}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: isAtMin ? "#fb7185" : "var(--text-primary)",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {Number(product.quantity || 0).toLocaleString()}
                          <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-muted)", marginLeft: 4 }}>cái</span>
                        </span>
                      </td>
                      <td>
                        {isAtMin ? (
                          <span className="badge badge-danger">
                            <AlertTriangle size={9} />
                            Chạm mức tối thiểu
                          </span>
                        ) : (
                          <span className="badge badge-success">
                            <CheckCircle size={9} />
                            Đủ điều kiện xuất
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <PackageMinus size={36} style={{ opacity: 0.2 }} />
                      <span style={{ fontSize: 13 }}>Không tìm thấy hàng hóa nào phù hợp.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-panel">
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: "rgba(244,63,94,0.12)",
                    border: "1px solid rgba(244,63,94,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <FileText size={16} color="#f43f5e" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                    Lập Phiếu Xuất Kho
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Giao hàng cho đối tác / đại lý
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn btn-icon btn-ghost"
                style={{ width: 32, height: 32 }}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmitTicket}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Product select */}
                <div>
                  <label className="form-label">
                    <PackageMinus size={12} />
                    Chọn vật tư / Sản phẩm xuất
                  </label>
                  {safeProducts.length > 0 ? (
                    <select
                      className="form-input"
                      value={formData.productSku}
                      onChange={(e) => setFormData({ ...formData, productSku: e.target.value })}
                    >
                      {safeProducts.map((p) => (
                        <option key={p._id} value={p.sku}>
                          {p.name} ({p.sku}) — Tồn: {p.quantity ?? 0}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div
                      style={{
                        padding: "12px 16px",
                        background: "rgba(244,63,94,0.08)",
                        border: "1px solid rgba(244,63,94,0.2)",
                        borderRadius: 10,
                        fontSize: 13,
                        color: "#fb7185",
                      }}
                    >
                      Chưa có sản phẩm nào trong kho để xuất hàng.
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="form-label">
                    <ArrowUpToLine size={12} />
                    Số lượng xuất
                  </label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    required
                    value={formData.qty}
                    onChange={(e) => setFormData({ ...formData, qty: parseInt(e.target.value) || 1 })}
                    style={{ fontFamily: "monospace", fontWeight: 600 }}
                  />
                </div>

                {/* Customer name */}
                <div>
                  <label className="form-label">
                    <User size={12} />
                    Tên Đại lý / Khách hàng nhận
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    required
                    placeholder="Nhập tên đơn vị hoặc đại lý đối tác..."
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  />
                </div>

                {/* Operator info */}
                <div
                  style={{
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 10,
                    fontSize: 12.5,
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Người tạo phiếu:</span>
                  {adminName}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => !isSubmitting && setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  <X size={14} />
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-rose"
                  disabled={safeProducts.length === 0 || isSubmitting}
                  style={{
                    opacity: safeProducts.length === 0 || isSubmitting ? 0.5 : 1,
                  }}
                >
                  {isSubmitting ? <Loader2 size={14} className="spinner" /> : <Check size={14} />}
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận xuất kho"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
