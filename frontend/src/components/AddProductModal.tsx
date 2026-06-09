"use client";

import { useWarehouseStore } from "@/store/useWarehouseStore";
import { useToastStore } from "@/store/useToastStore";
import React, { useState } from "react";
import {
  Plus,
  X,
  Package,
  Hash,
  MapPin,
  AlertCircle,
  Layers,
} from "lucide-react";

interface AddProductModalProps {
  onSuccess?: () => void;
}

const STORAGE_LOCATIONS = [
  "Kệ A1 - Tầng 1",
  "Kệ A2 - Tầng 2",
  "Kệ B1 - Tầng 1",
  "Kệ B2 - Tầng 2",
  "Kệ B3 - Tầng 1",
  "Kệ C1 - Tầng 1",
  "Kệ C2 - Tầng 2",
];

export default function AddProductModal({ onSuccess }: AddProductModalProps) {
  const { products, addProduct } = useWarehouseStore();
  const toast = useToastStore((s) => s.show);

  const busyLocations = products
    .filter((p) => (Number(p.quantity) || 0) > 0)
    .map((p) => p.location?.trim());

  const availableLocations = STORAGE_LOCATIONS.filter(
    (loc) => !busyLocations.includes(loc.trim())
  );

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [location, setLocation] = useState(
    availableLocations[0] || STORAGE_LOCATIONS[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [minQuantity, setMinQuantity] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = () => {
    const defaultLoc = availableLocations[0] || STORAGE_LOCATIONS[0];
    setLocation(defaultLoc);
    setName("");
    setQuantity(1);
    setMinQuantity(5);
    const prefix = "SKU";
    const timestamp = Date.now().toString().slice(-6);
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
    setSku(`${prefix}-${timestamp}-${randomStr}`);
    setIsOpen(true);
  };

  const handleGenerateSKU = () => {
    const prefix = "SKU";
    const timestamp = Date.now().toString().slice(-6);
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
    setSku(`${prefix}-${timestamp}-${randomStr}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !location) {
      toast("Vui lòng điền đầy đủ thông tin.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addProduct({
        sku,
        name,
        location,
        quantity: Number(quantity),
        minQuantity,
        supplierId: null,
      });

      if (!result.ok) {
        toast(result.message, "error");
        return;
      }

      toast("Đã thêm sản phẩm thành công.", "success");
      setIsOpen(false);

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      toast("Không thể lưu sản phẩm. Vui lòng thử lại.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="btn btn-primary"
      >
        <Plus size={15} /> Thêm sản phẩm
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}>
          <div className="modal-panel">
            {/* Header */}
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
                    flexShrink: 0,
                  }}
                >
                  <Package size={16} color="#fff" />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: "var(--text-primary)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Thêm sản phẩm mới
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Vật tư được cấp mã QR tự động ngay sau khi tạo
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  fontSize: 13,
                }}
                onMouseEnter={(e) => {
                  const t = e.currentTarget;
                  t.style.background = "rgba(255,255,255,0.1)";
                  t.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  const t = e.currentTarget;
                  t.style.background = "rgba(255,255,255,0.05)";
                  t.style.color = "var(--text-muted)";
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="modal-body" style={{ padding: "20px 24px" }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Tên sản phẩm */}
                <div>
                  <label
                    className="form-label"
                    style={{ marginBottom: 6 }}
                  >
                    <Package size={11} />
                    Tên sản phẩm / Vật tư
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên sản phẩm..."
                    className="form-input"
                    autoFocus
                  />
                </div>

                {/* Mã SKU */}
                <div>
                  <label className="form-label" style={{ marginBottom: 6 }}>
                    <Hash size={11} />
                    Mã định danh SKU
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      readOnly
                      value={sku}
                      className="form-input"
                      style={{
                        fontFamily: "monospace",
                        fontSize: 13,
                        letterSpacing: "0.02em",
                        flex: 1,
                        cursor: "not-allowed",
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleGenerateSKU}
                      style={{
                        padding: "0 14px",
                        borderRadius: 10,
                        background: "rgba(99,102,241,0.1)",
                        border: "1px solid rgba(99,102,241,0.25)",
                        color: "#818cf8",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        const t = e.currentTarget;
                        t.style.background = "rgba(99,102,241,0.2)";
                        t.style.borderColor = "rgba(99,102,241,0.4)";
                      }}
                      onMouseLeave={(e) => {
                        const t = e.currentTarget;
                        t.style.background = "rgba(99,102,241,0.1)";
                        t.style.borderColor = "rgba(99,102,241,0.25)";
                      }}
                    >
                      Đổi mã
                    </button>
                  </div>
                </div>

                {/* Vị trí kệ */}
                <div>
                  <label className="form-label" style={{ marginBottom: 6 }}>
                    <MapPin size={11} />
                    Vị trí xếp kệ
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="form-input"
                    style={{ cursor: "pointer" }}
                  >
                    {availableLocations.length > 0 ? (
                      availableLocations.map((loc) => (
                        <option key={loc} value={loc} style={{ background: "#111827" }}>
                          {loc}
                        </option>
                      ))
                    ) : (
                      <option disabled value="" style={{ background: "#111827" }}>
                        Kho đã hết vị trí trống
                      </option>
                    )}
                  </select>
                </div>

                {/* Số lượng + Ngưỡng */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="form-label" style={{ marginBottom: 6 }}>
                      <Layers size={11} />
                      Số lượng nhập
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="form-input"
                      style={{ fontFamily: "monospace", textAlign: "center" }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ marginBottom: 6 }}>
                      <AlertCircle size={11} />
                      Ngưỡng cảnh báo
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={minQuantity}
                      onChange={(e) => setMinQuantity(Number(e.target.value))}
                      className="form-input"
                      style={{ fontFamily: "monospace", textAlign: "center" }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                    paddingTop: 4,
                    borderTop: "1px solid var(--border-subtle)",
                    marginTop: 4,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                    className="btn btn-ghost"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || availableLocations.length === 0}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          style={{
                            width: 13,
                            height: 13,
                            border: "2px solid rgba(255,255,255,0.3)",
                            borderTopColor: "#fff",
                            borderRadius: "50%",
                            display: "inline-block",
                            animation: "spin-smooth 0.7s linear infinite",
                          }}
                        />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        Xác nhận tạo
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
