"use client";

import React, { useEffect, useState } from "react";
import {
  Package,
  LayoutGrid,
  Trash2,
  FileSpreadsheet,
  Loader2,
  Search,
} from "lucide-react";
import ProductCard from "./ProductCard";

import AddProductModal from "@/components/AddProductModal";
import { useWarehouseStore } from "@/store/useWarehouseStore";
import { useToastStore } from "@/store/useToastStore";
import { isAdminUser } from "@/lib/authRole";
import { getFetchErrorMessage } from "@/lib/apiError";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function ProductsPage() {
  const products = useWarehouseStore((state) => state.products);
  const isLoading = useWarehouseStore((state) => state.isLoading);
  const fetchProducts = useWarehouseStore((state) => state.fetchProducts);
  const deleteProduct = useWarehouseStore((state) => state.deleteProduct);
  const toast = useToastStore((s) => s.show);

  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setIsAdmin(isAdminUser());
  }, []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteProduct(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);
    if (result.ok) {
      toast("Đã xóa sản phẩm.", "success");
    } else {
      toast(result.message, "error");
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/inventory/export-excel`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const msg = await getFetchErrorMessage(
          response,
          "Không thể xuất file Excel."
        );
        throw new Error(msg);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bao-cao-kho-hang.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast("Đã tải file Excel.", "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi xuất Excel.",
        "error"
      );
    } finally {
      setIsExporting(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.location || "").toLowerCase().includes(searchQuery.toLowerCase())
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
            Đang tải danh mục sản phẩm...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* ===== HEADER ===== */}
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
              <LayoutGrid size={18} color="#fff" />
            </div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              Danh mục sản phẩm
            </h1>
          </div>
          <p
            style={{ fontSize: 13, color: "var(--text-muted)", paddingLeft: 2 }}
          >
            {isAdmin
              ? "Quyền Admin: có thể xóa sản phẩm và xuất Excel."
              : "Tài khoản thường: chỉ xem và thêm sản phẩm."}{" "}
            ·{" "}
            <strong style={{ color: "var(--text-secondary)" }}>
              {products.length} sản phẩm
            </strong>
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isAdmin && (
            <button
              className="btn btn-emerald"
              onClick={handleExportExcel}
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
          <AddProductModal onSuccess={fetchProducts} />
        </div>
      </div>

      {/* ===== SEARCH BAR ===== */}
      <div className="search-bar" style={{ marginBottom: 24, maxWidth: 400 }}>
        <Search size={15} className="search-icon" />
        <input
          className="form-input search-bar"
          style={{ paddingLeft: 38 }}
          type="text"
          placeholder="Tìm theo tên, SKU, vị trí..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ===== PRODUCT CARDS ===== */}
      {filteredProducts.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <Package size={48} style={{ opacity: 0.2 }} />
          <p style={{ fontSize: 14, fontWeight: 500 }}>
            {searchQuery
              ? "Không tìm thấy sản phẩm nào."
              : "Chưa có sản phẩm nào."}
          </p>
        </div>
      ) : (
        <div
          className="stagger-children"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {filteredProducts.map((product, idx) => (
            <ProductCard
              key={product._id}
              product={product}
              isAdmin={isAdmin}
              index={idx}
              onRequestDelete={(id, name) => setDeleteTarget({ id, name })}
            />
          ))}
        </div>
      )}

      {/* ===== DELETE CONFIRM MODAL ===== */}
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
                  Xóa sản phẩm?
                </span>
              </div>
              <button
                className="btn btn-icon btn-ghost"
                style={{ width: 32, height: 32 }}
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                ✕
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
                Bạn có chắc muốn xóa{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  "{deleteTarget.name}"
                </strong>{" "}
                khỏi danh mục? Thao tác này chỉ dành cho Admin và không thể hoàn
                tác.
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
                onClick={confirmDelete}
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
