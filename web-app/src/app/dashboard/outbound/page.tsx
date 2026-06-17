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
  Clock,
  ArrowUpRight,
  User,
  Users,
} from "lucide-react";
import { useWarehouseStore } from "@/store/useWarehouseStore";
import { useToastStore } from "@/store/useToastStore";
import { getFetchErrorMessage } from "@/lib/apiError";
import { isAdminUser } from "@/lib/authRole";
import { useAdminStore } from "@/store/useAdminStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Customer {
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

interface OutboundLog {
  _id: string;
  quantity: number;
  createdAt: string;
  customerName: string;
  executor: {
    username: string;
    role: string;
  };
}

export default function OutboundPage() {
  const { adminName } = useAdminStore();
  const { products, isLoading, fetchProducts, addInventoryTransaction } =
    useWarehouseStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State lịch sử xuất kho của sản phẩm
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<OutboundLog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Quản lý khách hàng
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isFastCustomerModalOpen, setIsFastCustomerModalOpen] = useState(false);
  const [fastCustomerName, setFastCustomerName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  const [formData, setFormData] = useState({
    productSku: "",
    qty: 1,
    customerId: "",
    note: "",
  });

  const toast = useToastStore((s) => s.show);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (fetchProducts) fetchProducts();
    fetchCustomers();
  }, [fetchProducts]);

  useEffect(() => {
    setIsAdmin(isAdminUser());
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/customers`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const resData = await response.json();
        if (resData.success) {
          setCustomers(resData.data || []);
        }
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách khách hàng:", err);
    }
  };

  // Fetch lịch sử xuất kho theo productId
  const handleOpenHistory = async (product: Product) => {
    setSelectedProduct(product);
    setIsHistoryModalOpen(true);
    setIsLoadingHistory(true);
    setHistoryLogs([]);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/inventory/logs?productId=${product._id}&type=Export`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const resData = await response.json();
      if (resData.success) {
        const mapped = (resData.data || []).map((t: any) => ({
          _id: t._id,
          quantity: t.quantity,
          createdAt: t.createdAt,
          customerName:
            t.customerName || t.productId?.customerId?.name || "Không xác định",
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

  const handleCreateFastCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fastCustomerName.trim()) {
      toast("Vui lòng nhập tên khách hàng.", "error");
      return;
    }
    setIsCreatingCustomer(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: fastCustomerName.trim(),
          contactName: contactName.trim(),
          phone: phone.trim(),
        }),
      });
      const resData = await response.json();
      if (!response.ok)
        throw new Error(resData.message || "Tạo khách hàng nhanh thất bại.");
      toast("Đã thêm nhanh khách hàng mới!", "success");
      const newCustomer = resData.data;
      setCustomers((prev) => [...prev, newCustomer]);
      setFormData((prev) => ({ ...prev, customerId: newCustomer._id }));
      setFastCustomerName("");
      setContactName("");
      setPhone("");
      setIsFastCustomerModalOpen(false);
    } catch (err: any) {
      toast(err.message || "Không thể tạo nhanh khách hàng", "error");
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const handleExportOutboundExcel = async () => {
    if (!isAdmin) {
      toast("Chỉ tài khoản Admin mới được xuất Excel.", "error");
      return;
    }
    setIsExporting(true);
    let url = "";
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
      url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bao-cao-xuat-kho.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast("Đã tải file Excel xuất kho.", "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Xuất Excel xuất kho thất bại!",
        "error",
      );
    } finally {
      if (url) window.URL.revokeObjectURL(url);
      setIsExporting(false);
    }
  };

  const handleOpenModal = (sku?: string) => {
    const safeProducts = products || [];
    setFormData({
      productSku:
        sku || (safeProducts.length > 0 ? safeProducts[0].sku || "" : ""),
      qty: 1,
      customerId: "",
      note: "",
    });
    setIsModalOpen(true);
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productSku) {
      toast("Vui lòng chọn một sản phẩm để xuất kho.", "error");
      return;
    }
    if (!formData.customerId) {
      toast("Vui lòng lựa chọn hoặc tạo nhanh một khách hàng.", "error");
      return;
    }
    setIsSubmitting(true);
    const result = await addInventoryTransaction({
      sku: formData.productSku,
      type: "Export",
      quantity: formData.qty,
      customerName:
        customers.find((c) => c._id === formData.customerId)?.name || "",
      note: formData.note,
    });
    setIsSubmitting(false);
    if (result.ok) {
      toast("Xuất kho thành công.", "success");
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
          <button
            className="btn btn-primary"
            style={{
              background: "linear-gradient(135deg, #e11d48, #f43f5e)",
              boxShadow: "0 4px 16px rgba(244,63,94,0.3)",
            }}
            onClick={() => handleOpenModal()}
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

      {/* ===== MODAL LỊCH SỬ XUẤT KHO ===== */}
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
                  "linear-gradient(to right, rgba(244,63,94,0.05), transparent)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "rgba(244,63,94,0.15)",
                    border: "1px solid rgba(244,63,94,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Clock size={15} color="#f43f5e" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
                    Lịch Sử Xuất Kho
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                    {selectedProduct.name} —{" "}
                    <span style={{ color: "#f43f5e", fontFamily: "monospace" }}>
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
                      border: "3px solid rgba(244,63,94,0.2)",
                      borderTopColor: "#f43f5e",
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
                  <ArrowUpRight
                    size={36}
                    style={{ opacity: 0.2, color: "#f43f5e" }}
                  />
                  <span style={{ fontSize: 13, color: "#9ca3af" }}>
                    Chưa có phiếu xuất kho nào cho sản phẩm này.
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
                        background: "rgba(244,63,94,0.12)",
                        border: "1px solid rgba(244,63,94,0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ArrowUpRight size={16} color="#f43f5e" />
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
                      {/* Người thực hiện + khách hàng */}
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
                          <Users size={11} />
                          {log.customerName}
                        </span>
                      </div>
                    </div>

                    {/* Số lượng + thời gian */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#f43f5e",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        -{log.quantity} cái
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
                {historyLogs.length} phiếu xuất
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
                    background: "linear-gradient(135deg, #e11d48, #f43f5e)",
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
                  <ArrowUpToLine size={14} />
                  Tạo phiếu xuất kho
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL CHÍNH: LẬP PHIẾU XUẤT KHO ===== */}
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
                    background: "rgba(244,63,94,0.12)",
                    border: "1px solid rgba(244,63,94,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileText size={16} color="#f43f5e" />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    Lập Phiếu Xuất Kho
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Giao hàng cho khách hàng / đại lý
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
                    <PackageMinus size={12} />
                    Chọn vật tư / Sản phẩm xuất
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

                {/* Khách hàng */}
                <div>
                  <label
                    className="form-label"
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <Users size={12} />
                    Đối tác / Khách hàng
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <select
                      className="form-input"
                      style={{ flex: 1 }}
                      value={formData.customerId}
                      required
                      onChange={(e) =>
                        setFormData({ ...formData, customerId: e.target.value })
                      }
                    >
                      <option value="">-- Chọn khách hàng nhận hàng --</option>
                      {customers.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setIsFastCustomerModalOpen(true)}
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
                    <ArrowUpToLine size={12} />
                    Số lượng xuất kho
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
                    placeholder="Nhập lý do xuất kho / giao hàng..."
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
                    background: "linear-gradient(135deg, #e11d48, #f43f5e)",
                    color: "#fff",
                    boxShadow: "0 4px 16px rgba(244,63,94,0.3)",
                    opacity:
                      safeProducts.length === 0 || isSubmitting ? 0.5 : 1,
                  }}
                >
                  {isSubmitting ? (
                    <Loader2 size={14} className="spinner" />
                  ) : (
                    <Check size={14} />
                  )}
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận xuất kho"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL CON: THÊM NHANH KHÁCH HÀNG ===== */}
      {isFastCustomerModalOpen && (
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
                <Users size={20} color="#818cf8" />
                <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>
                  Thêm Khách Hàng
                </span>
              </div>
              <button
                onClick={() => setIsFastCustomerModalOpen(false)}
                className="btn-ghost"
              >
                <X size={20} color="#94a3b8" />
              </button>
            </div>

            <form onSubmit={handleCreateFastCustomer}>
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
                    TÊN KHÁCH HÀNG *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: Công ty TNHH A..."
                    value={fastCustomerName}
                    onChange={(e) => setFastCustomerName(e.target.value)}
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

              <div
                className="modal-footer"
                style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}
              >
                <button
                  type="button"
                  className="btn"
                  onClick={() => setIsFastCustomerModalOpen(false)}
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
                  disabled={isCreatingCustomer}
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
                  {isCreatingCustomer ? (
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
