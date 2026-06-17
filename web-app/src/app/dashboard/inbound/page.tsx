"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Check,
  X,
  PackageCheck,
  FileText,
  FileSpreadsheet,
  Loader2,
  MapPin,
  Hash,
  ArrowDownToLine,
  AlertTriangle,
  CheckCircle,
  Truck,
  Clock,
  ArrowDownRight,
  User,
  QrCode,
  Building2,
} from "lucide-react";
import { useWarehouseStore } from "@/store/useWarehouseStore";
import { useToastStore } from "@/store/useToastStore";
import { getFetchErrorMessage } from "@/lib/apiError";
import { isAdminUser } from "@/lib/authRole";
import { useAdminStore } from "@/store/useAdminStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Supplier {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  sku: string;
  name: string;
  location?: string;
  quantity: number;
  minQuantity: number;
}

interface InboundLog {
  _id: string;
  quantity: number;
  createdAt: string;
  supplierName: string;
  executor: {
    username: string;
    role: string;
  };
}

export default function InboundPage() {
  const { adminName } = useAdminStore();
  const { products, isLoading, fetchProducts, addInventoryTransaction } =
    useWarehouseStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State lịch sử nhập kho của sản phẩm
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<InboundLog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Quản lý nhà cung cấp
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isFastSupplierModalOpen, setIsFastSupplierModalOpen] = useState(false);
  const [fastSupplierName, setFastSupplierName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isCreatingSupplier, setIsCreatingSupplier] = useState(false);

  const [formData, setFormData] = useState({
    productSku: "",
    qty: 1,
    supplierId: "",
    note: "",
  });

  const toast = useToastStore((s) => s.show);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (fetchProducts) fetchProducts();
    fetchSuppliers();
  }, [fetchProducts]);

  useEffect(() => {
    setIsAdmin(isAdminUser());
  }, []);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/suppliers`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const resData = await response.json();
        if (resData.success) {
          const supplierList = resData.data || [];
          setSuppliers(supplierList);
          if (supplierList.length > 0) {
            setFormData((prev) => ({
              ...prev,
              supplierId: supplierList[0]._id,
            }));
          }
        }
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách nhà cung cấp:", err);
    }
  };

  // Fetch lịch sử nhập kho theo productId
  const handleOpenHistory = async (product: Product) => {
    setSelectedProduct(product);
    setIsHistoryModalOpen(true);
    setIsLoadingHistory(true);
    setHistoryLogs([]);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/inventory/logs?productId=${product._id}&type=Import`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const resData = await response.json();
      if (resData.success) {
        const mapped = (resData.data || []).map((t: any) => ({
          _id: t._id,
          quantity: t.quantity,
          createdAt: t.createdAt,
          supplierName: t.productId?.supplierId?.name || "Không xác định",
          executor: {
            username: t.userId?.username || "Ẩn danh",
            role: t.userId?.role || "User",
          },
        }));
        setHistoryLogs(mapped);
      }
    } catch (err) {
      toast("Không thể tải lịch sử giao dịch.", "error");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleCreateFastSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fastSupplierName.trim()) {
      toast("Vui lòng nhập tên nhà cung cấp.", "error");
      return;
    }
    setIsCreatingSupplier(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/suppliers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: fastSupplierName.trim(),
          contactName: contactName.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      });
      const resData = await response.json();
      if (!response.ok)
        throw new Error(resData.message || "Tạo nhà cung cấp nhanh thất bại.");
      toast("Đã thêm nhanh nhà cung cấp mới!", "success");
      const newSupplier = resData.data;
      setSuppliers((prev) => [...prev, newSupplier]);
      setFormData((prev) => ({ ...prev, supplierId: newSupplier._id }));
      setFastSupplierName("");
      setContactName("");
      setEmail("");
      setPhone("");
      setIsFastSupplierModalOpen(false);
    } catch (err: any) {
      toast(err.message || "Không thể tạo nhanh nhà cung cấp", "error");
    } finally {
      setIsCreatingSupplier(false);
    }
  };

  const handleExportInboundExcel = async () => {
    if (!isAdmin) {
      toast("Chỉ tài khoản Admin mới được xuất Excel.", "error");
      return;
    }
    setIsExporting(true);
    let url = "";
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/inventory/export-excel?type=Import`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) {
        const msg = await getFetchErrorMessage(
          response,
          "Không thể xuất Excel nhập kho.",
        );
        throw new Error(msg);
      }
      const blob = await response.blob();
      url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bao-cao-nhap-kho.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast("Đã tải file Excel nhập kho.", "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Xuất Excel nhập kho thất bại!",
        "error",
      );
    } finally {
      if (url) window.URL.revokeObjectURL(url);
      setIsExporting(false);
    }
  };

  const handleOpenModal = (sku?: string) => {
    const defaultSupplierId = suppliers.length > 0 ? suppliers[0]._id : "";
    const safeProducts = products || [];
    setFormData({
      productSku:
        sku || (safeProducts.length > 0 ? safeProducts[0].sku || "" : ""),
      qty: 1,
      supplierId: defaultSupplierId,
      note: "",
    });
    setIsModalOpen(true);
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productSku) {
      toast("Vui lòng chọn một sản phẩm để nhập kho.", "error");
      return;
    }
    if (!formData.supplierId) {
      toast("Vui lòng lựa chọn hoặc tạo nhanh một nhà cung cấp.", "error");
      return;
    }
    setIsSubmitting(true);
    const result = await addInventoryTransaction({
      sku: formData.productSku,
      type: "Import",
      quantity: formData.qty,
      supplierId: formData.supplierId,
      note: formData.note,
    });
    setIsSubmitting(false);
    if (result.ok) {
      toast("Nhập kho thành công.", "success");
      setIsModalOpen(false);
    } else {
      toast(result.message, "error");
    }
  };

  const safeProducts: Product[] = products || [];
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
              border: "3px solid rgba(99,102,241,0.15)",
              borderTopColor: "#6366f1",
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
                background: "linear-gradient(135deg, #d97706, #f59e0b)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(245,158,11,0.3)",
              }}
            >
              <PackageCheck size={18} color="#fff" />
            </div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              Quản lý Nhập Kho
            </h1>
          </div>
          <p
            style={{ fontSize: 13, color: "var(--text-muted)", paddingLeft: 2 }}
          >
            Lập phiếu nhập kho và cập nhật số lượng tồn kho thực tế.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isAdmin && (
            <button
              className="btn btn-emerald"
              onClick={handleExportInboundExcel}
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
          <button
            className="btn btn-primary"
            style={{
              background: "linear-gradient(135deg, #d97706, #f59e0b)",
              boxShadow: "0 4px 16px rgba(245,158,11,0.3)",
            }}
            onClick={() => handleOpenModal()}
          >
            <Plus size={15} />
            Tạo phiếu nhập kho
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
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const isLow = product.quantity < product.minQuantity;
                  return (
                    <tr
                      key={product._id}
                      onClick={() => handleOpenHistory(product)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#f59e0b",
                            background: "rgba(245,158,11,0.08)",
                            padding: "3px 8px",
                            borderRadius: 5,
                            border: "1px solid rgba(245,158,11,0.2)",
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
                            color: isLow ? "#fb7185" : "var(--text-primary)",
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
                        {isLow ? (
                          <span className="badge badge-danger">
                            <AlertTriangle size={9} />
                            Cần nhập thêm
                          </span>
                        ) : (
                          <span className="badge badge-success">
                            <CheckCircle size={9} />
                            An toàn
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
                      <PackageCheck size={36} style={{ opacity: 0.2 }} />
                      <span style={{ fontSize: 13 }}>
                        Không tìm thấy sản phẩm nào khớp với từ khóa.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MODAL LỊCH SỬ NHẬP KHO ===== */}
      {isHistoryModalOpen && selectedProduct && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
            animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setIsHistoryModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#11131e",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              width: "100%",
              maxWidth: 520,
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              overflow: "hidden",
              animation: "scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background:
                  "linear-gradient(to right, rgba(245,158,11,0.05), transparent)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "rgba(245,158,11,0.15)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Clock size={15} color="#f59e0b" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
                    Lịch Sử Nhập Kho
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                    {selectedProduct.name} —{" "}
                    <span style={{ color: "#f59e0b", fontFamily: "monospace" }}>
                      {selectedProduct.sku}
                    </span>
                  </div>
                </div>
              </div>
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  padding: 4,
                }}
                onClick={() => setIsHistoryModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body - danh sách log */}
            <div
              style={{
                padding: 16,
                maxHeight: 420,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {isLoadingHistory ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 48,
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      border: "3px solid rgba(245,158,11,0.2)",
                      borderTopColor: "#f59e0b",
                      borderRadius: "50%",
                    }}
                    className="spinner"
                  />
                  <span style={{ fontSize: 13, color: "#9ca3af" }}>
                    Đang tải lịch sử...
                  </span>
                </div>
              ) : historyLogs.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 48,
                    gap: 10,
                  }}
                >
                  <ArrowDownRight
                    size={36}
                    style={{ opacity: 0.2, color: "#f59e0b" }}
                  />
                  <span style={{ fontSize: 13, color: "#9ca3af" }}>
                    Chưa có phiếu nhập kho nào cho sản phẩm này.
                  </span>
                </div>
              ) : (
                historyLogs.map((log, idx) => (
                  <div
                    key={log._id}
                    style={{
                      padding: "12px 14px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      animation: `fadeIn 0.2s ease ${idx * 30}ms both`,
                    }}
                  >
                    {/* Icon */}
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        flexShrink: 0,
                        background: "rgba(245,158,11,0.12)",
                        border: "1px solid rgba(245,158,11,0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ArrowDownRight size={16} color="#f59e0b" />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Mã chứng từ */}
                      <div
                        style={{
                          fontSize: 11,
                          color: "#6b7280",
                          fontFamily: "monospace",
                          marginBottom: 4,
                        }}
                      >
                        #{log._id.slice(-8).toUpperCase()}
                      </div>
                      {/* Người thực hiện + nhà cung cấp */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 12,
                            color: "#e5e7eb",
                          }}
                        >
                          <User size={11} color="#9ca3af" />
                          {log.executor.username}
                          <span
                            style={{
                              fontSize: 10,
                              color: "#818cf8",
                              fontWeight: 600,
                              textTransform: "uppercase",
                            }}
                          >
                            {log.executor.role}
                          </span>
                        </span>
                        <span style={{ color: "#374151" }}>·</span>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 12,
                            color: "#9ca3af",
                          }}
                        >
                          <Building2 size={11} />
                          {log.supplierName}
                        </span>
                      </div>
                    </div>

                    {/* Số lượng + thời gian */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#f59e0b",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        +{log.quantity} cái
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}
                      >
                        {new Date(log.createdAt).toLocaleString("vi-VN")}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "14px 24px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                backgroundColor: "rgba(0,0,0,0.15)",
              }}
            >
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                {historyLogs.length} phiếu nhập
              </span>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "rgba(255,255,255,0.03)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                  onClick={() => setIsHistoryModalOpen(false)}
                >
                  Đóng lại
                </button>
                <button
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "none",
                    background: "linear-gradient(135deg, #d97706, #f59e0b)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  onClick={() => {
                    setIsHistoryModalOpen(false);
                    handleOpenModal(selectedProduct.sku);
                  }}
                >
                  <ArrowDownToLine size={14} />
                  Tạo phiếu nhập kho
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL CHÍNH: LẬP PHIẾU NHẬP KHO ===== */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-panel">
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: "rgba(245,158,11,0.12)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileText size={16} color="#f59e0b" />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    Lập Phiếu Nhập Kho
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Cập nhật số lượng hàng hóa nhập vào kho
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
              <div
                className="modal-body"
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                {/* Product select */}
                <div>
                  <label className="form-label">
                    <PackageCheck size={12} />
                    Chọn vật tư / Sản phẩm nhập
                  </label>
                  {safeProducts.length > 0 ? (
                    <select
                      className="form-input"
                      value={formData.productSku}
                      onChange={(e) => {
                        const selectedProd = safeProducts.find(
                          (p) => p.sku === e.target.value,
                        );
                        setFormData({
                          ...formData,
                          productSku: selectedProd ? selectedProd.sku : "",
                        });
                      }}
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
                      Chưa có sản phẩm nào. Hãy thêm sản phẩm trước.
                    </div>
                  )}
                </div>

                {/* Nhà cung cấp */}
                <div>
                  <label
                    className="form-label"
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <Truck size={12} />
                    Đối tác / Nhà cung cấp
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <select
                      className="form-input"
                      style={{ flex: 1 }}
                      value={formData.supplierId}
                      required
                      onChange={(e) =>
                        setFormData({ ...formData, supplierId: e.target.value })
                      }
                    >
                      <option value="">-- Chọn nhà cung cấp cấp hàng --</option>
                      {suppliers.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setIsFastSupplierModalOpen(true)}
                      style={{
                        background: "rgba(99,102,241,0.1)",
                        color: "#6366f1",
                        border: "1px solid rgba(99,102,241,0.2)",
                        whiteSpace: "nowrap",
                        padding: "0 12px",
                      }}
                    >
                      <Plus size={14} />
                      Thêm nhanh
                    </button>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="form-label">
                    <ArrowDownToLine size={12} />
                    Số lượng nhập thêm
                  </label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    required
                    value={formData.qty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        qty: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    style={{ fontFamily: "monospace", fontWeight: 600 }}
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="form-label">Ghi chú (Tùy chọn)</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Nhập lý do nhập bổ sung hàng hóa..."
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    style={{ resize: "none" }}
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
                  <span
                    style={{ color: "var(--text-secondary)", fontWeight: 600 }}
                  >
                    Người thực hiện:
                  </span>
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
                  className="btn"
                  disabled={safeProducts.length === 0 || isSubmitting}
                  style={{
                    background: "linear-gradient(135deg, #d97706, #f59e0b)",
                    color: "#fff",
                    boxShadow: "0 4px 16px rgba(245,158,11,0.3)",
                    opacity:
                      safeProducts.length === 0 || isSubmitting ? 0.5 : 1,
                  }}
                >
                  {isSubmitting ? (
                    <Loader2 size={14} className="spinner" />
                  ) : (
                    <Check size={14} />
                  )}
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận nhập kho"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL CON: THÊM NHANH NHÀ CUNG CẤP ===== */}
      {isFastSupplierModalOpen && (
        <div
          className="modal-overlay"
          style={{
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="modal-panel"
            style={{
              maxWidth: 500,
              width: "100%",
              background: "#1e2030",
              borderRadius: 16,
              padding: 24,
              border: "1px solid #334155",
            }}
          >
            <div
              className="modal-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Truck size={20} color="#818cf8" />
                <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>
                  Thêm Nhà Cung Cấp
                </span>
              </div>
              <button
                onClick={() => setIsFastSupplierModalOpen(false)}
                className="btn-ghost"
              >
                <X size={20} color="#94a3b8" />
              </button>
            </div>

            <form onSubmit={handleCreateFastSupplier}>
              <div
                className="modal-body"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                <div>
                  <label
                    className="form-label"
                    style={{
                      display: "block",
                      marginBottom: 8,
                      color: "#e2e8f0",
                      fontSize: 14,
                    }}
                  >
                    TÊN NHÀ CUNG CẤP *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: Công ty TNHH A..."
                    value={fastSupplierName}
                    onChange={(e) => setFastSupplierName(e.target.value)}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "1px solid #475569",
                      padding: "10px 16px",
                      borderRadius: 8,
                      color: "#fff",
                    }}
                    required
                  />
                </div>
                <div>
                  <label
                    className="form-label"
                    style={{
                      display: "block",
                      marginBottom: 8,
                      color: "#e2e8f0",
                      fontSize: 14,
                    }}
                  >
                    NGƯỜI LIÊN HỆ
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "1px solid #475569",
                      padding: "10px 16px",
                      borderRadius: 8,
                      color: "#fff",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label
                      className="form-label"
                      style={{
                        display: "block",
                        marginBottom: 8,
                        color: "#e2e8f0",
                        fontSize: 14,
                      }}
                    >
                      EMAIL
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: "100%",
                        background: "transparent",
                        border: "1px solid #475569",
                        padding: "10px 16px",
                        borderRadius: 8,
                        color: "#fff",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label
                      className="form-label"
                      style={{
                        display: "block",
                        marginBottom: 8,
                        color: "#e2e8f0",
                        fontSize: 14,
                      }}
                    >
                      SỐ ĐIỆN THOẠI
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="090..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        width: "100%",
                        background: "transparent",
                        border: "1px solid #475569",
                        padding: "10px 16px",
                        borderRadius: 8,
                        color: "#fff",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div
                className="modal-footer"
                style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}
              >
                <button
                  type="button"
                  className="btn"
                  onClick={() => setIsFastSupplierModalOpen(false)}
                  style={{
                    padding: "10px 24px",
                    background: "#334155",
                    color: "#fff",
                    borderRadius: 8,
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={isCreatingSupplier}
                  style={{
                    padding: "10px 24px",
                    background: "#6366f1",
                    color: "#fff",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {isCreatingSupplier ? (
                    <Loader2 size={16} className="spinner" />
                  ) : (
                    <Check size={16} />
                  )}
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        `,
        }}
      />
    </div>
  );
}
