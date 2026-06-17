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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function OutboundPage() {
  const { adminName } = useAdminStore();
  const { products, isLoading, fetchProducts, addInventoryTransaction } =
    useWarehouseStore();
  const toast = useToastStore((s) => s.show);

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState<{ _id: string; name: string }[]>(
    [],
  );
  const [formData, setFormData] = useState({
    productSku: "",
    qty: 1,
    customerId: "",
  });

  // Fast Customer Modal States
  const [isFastCustomerModalOpen, setIsFastCustomerModalOpen] = useState(false);
  const [fastCustomerName, setFastCustomerName] = useState("");
  const [contactName, setContactName] = useState(""); // Thêm trường này
  const [phone, setPhone] = useState("");
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    setIsAdmin(isAdminUser());
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setCustomers(data.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách khách hàng");
    }
  };

  const handleOpenModal = () => {
    // Tự động chọn sản phẩm đầu tiên nếu có để tránh trống trường
    if (products && products.length > 0) {
      setFormData({
        productSku: products[0].sku,
        qty: 1,
        customerId: "",
      });
    } else {
      setFormData({ productSku: "", qty: 1, customerId: "" });
    }
    setIsModalOpen(true);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingCustomer(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // Gửi đầy đủ thông tin
        body: JSON.stringify({
          name: fastCustomerName,
          contactName: contactName,
          phone: phone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast("Đã thêm khách hàng mới", "success");
        fetchCustomers();
        setIsFastCustomerModalOpen(false);
        // Reset form
        setFastCustomerName("");
        setContactName("");
        setPhone("");
      } else toast(data.message, "error");
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) {
      toast("Vui lòng chọn khách hàng", "error");
      return;
    }

    setIsSubmitting(true);
    const result = await addInventoryTransaction({
      sku: formData.productSku,
      type: "Export",
      quantity: formData.qty,
      customerName:
        customers.find((c) => c._id === formData.customerId)?.name || "",
    });
    setIsSubmitting(false);
    if (result.ok) {
      toast("Xuất kho thành công.", "success");
      setIsModalOpen(false);
    } else toast(result.message, "error");
  };

  const handleExportOutboundExcel = async () => {
    if (!isAdmin) {
      toast("Chỉ tài khoản Admin mới được xuất Excel.", "error");
      return;
    }
    setIsExporting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/inventory/export-excel?type=Export`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) {
        const msg = await getFetchErrorMessage(
          response,
          "Không thể xuất Excel xuất kho.",
        );
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
      toast(
        err instanceof Error ? err.message : "Xuất Excel xuất kho thất bại!",
        "error",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const safeProducts = products || [];
  const filteredProducts = safeProducts.filter(
    (product) =>
      (product.sku || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.location || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
              border: "3px solid rgba(244,63,94,0.15)",
              borderTopColor: "#f43f5e",
              borderRadius: "50%",
              margin: "0 auto 16px",
            }}
            className="spinner"
          />
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Đang tải dữ liệu kho hàng...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* ===== PAGE HEADER ===== */}
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
                background: "linear-gradient(135deg, #e11d48, #f43f5e)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(244,63,94,0.3)",
              }}
            >
              <PackageMinus size={18} color="#fff" />
            </div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              Quản lý Xuất Kho
            </h1>
          </div>
          <p
            style={{ fontSize: 13, color: "var(--text-muted)", paddingLeft: 2 }}
          >
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
              {isExporting ? (
                <Loader2 size={14} className="spinner" />
              ) : (
                <FileSpreadsheet size={14} />
              )}
              {isExporting ? "Đang xuất..." : "Xuất Excel"}
            </button>
          )}
          <button className="btn btn-rose" onClick={handleOpenModal}>
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
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Hash size={11} />
                    Mã SKU
                  </span>
                </th>
                <th>Tên sản phẩm</th>
                <th>
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <MapPin size={11} />
                    Vị trí kệ
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
                        <span
                          style={{
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            fontSize: 13.5,
                          }}
                        >
                          {product.name}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 13,
                          }}
                        >
                          <MapPin
                            size={12}
                            style={{
                              color: "var(--text-muted)",
                              flexShrink: 0,
                            }}
                          />
                          {product.location || (
                            <em
                              style={{
                                color: "var(--text-muted)",
                                fontStyle: "italic",
                              }}
                            >
                              Chưa xếp kệ
                            </em>
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
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 400,
                              color: "var(--text-muted)",
                              marginLeft: 4,
                            }}
                          >
                            cái
                          </span>
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
                      <span style={{ fontSize: 13 }}>
                        Không tìm thấy hàng hóa nào phù hợp.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MODAL XUẤT KHO ===== */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-panel" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="modal-icon">
                  <FileText size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>
                    Lập Phiếu Xuất Kho
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Giao hàng cho đối tác / đại lý
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn btn-ghost"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmitTicket}>
              <div
                className="modal-body"
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {/* Product Select */}
                <div>
                  <label className="form-label">SẢN PHẨM</label>
                  <select
                    className="form-input"
                    value={formData.productSku}
                    onChange={(e) =>
                      setFormData({ ...formData, productSku: e.target.value })
                    }
                  >
                    {products.map((p) => (
                      <option key={p._id} value={p.sku}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity Input */}
                <div>
                  <label className="form-label">SỐ LƯỢNG XUẤT</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.qty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        qty: parseInt(e.target.value) || 1,
                      })
                    }
                    min="1"
                  />
                </div>

                {/* Customer Select */}
                <div>
                  <label className="form-label">CHỌN KHÁCH HÀNG</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <select
                      className="form-input"
                      value={formData.customerId}
                      onChange={(e) =>
                        setFormData({ ...formData, customerId: e.target.value })
                      }
                    >
                      <option value="">-- Chọn khách hàng --</option>
                      {customers.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setIsFastCustomerModalOpen(true)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Created By (Read-only) */}
                <div>
                  <label className="form-label">NGƯỜI TẠO PHIẾU</label>
                  <input
                    className="form-input"
                    disabled
                    value={adminName}
                    style={{ opacity: 0.7, cursor: "not-allowed" }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="submit"
                  className="btn btn-rose"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận xuất kho"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL THÊM KHÁCH HÀNG MỚI ===== */}
      {isFastCustomerModalOpen && (
        <div className="modal-overlay">
          <div className="modal-panel" style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h3>Thêm khách hàng mới</h3>
              <button
                onClick={() => setIsFastCustomerModalOpen(false)}
                className="btn btn-ghost"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer}>
              <div
                className="modal-body"
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div>
                  <label className="form-label">Tên Khách Hàng *</label>
                  <input
                    className="form-input"
                    placeholder="Ví dụ: Công ty TNHH A..."
                    value={fastCustomerName}
                    onChange={(e) => setFastCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Người liên hệ</label>
                  <input
                    className="form-input"
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Số điện thoại</label>
                  <input
                    className="form-input"
                    placeholder="090..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsFastCustomerModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-rose"
                  disabled={isCreatingCustomer}
                >
                  {isCreatingCustomer ? "Đang lưu..." : "Lưu lại"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
