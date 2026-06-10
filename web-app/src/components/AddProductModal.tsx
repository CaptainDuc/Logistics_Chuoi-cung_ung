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

// Danh sách các vị trí kệ kho mẫu cố định để chọn lựa
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

  // ✅ ĐÚNG: Tính toán danh sách vị trí đã bận dựa trên dữ liệu state mới nhất của store
  const busyLocations = products
    .filter((p) => (Number(p.quantity) || 0) > 0)
    .map((p) => p.location?.trim());

  // Lọc ra các vị trí còn trống để hiển thị lên thẻ <select>
  const availableLocations = STORAGE_LOCATIONS.filter(
    (loc) => !busyLocations.includes(loc.trim())
  );

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  // Mặc định chọn vị trí trống đầu tiên nếu có, nếu không thì lấy giá trị mặc định hệ thống
  const [location, setLocation] = useState(
    availableLocations[0] || STORAGE_LOCATIONS[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [minQuantity, setMinQuantity] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      setName("");
      // Cập nhật lại vị trí mặc định sau khi reset form
      setLocation(availableLocations[0] || STORAGE_LOCATIONS[0]);
      setQuantity(1);
      setMinQuantity(5);
      setIsOpen(false);

      if (onSuccess) onSuccess();

      toast("Đã thêm sản phẩm thành công.", "success");
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
        onClick={() => {
          setIsOpen(true);
          handleGenerateSKU();
          // Cập nhật lại vị trí hợp lệ khi mở modal lên
          if (availableLocations.length > 0) {
            setLocation(availableLocations[0]);
          }
        }}
        className="flex items-center gap-2 bg-slate-900 text-white font-medium px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-all active:scale-95 text-sm shadow-sm"
      >
        <Plus className="w-4 h-4" /> Thêm sản phẩm
      </button>

      {isOpen && (
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
                  <Package size={16} color="#6366f1" />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    Thêm sản phẩm mới
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Vật tư mới sẽ được cấp mã định danh QR tự động ngay sau khi
                    tạo.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-icon btn-ghost"
                style={{ width: 32, height: 32 }}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div
                className="modal-body"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {/* Tên sản phẩm */}
                <div>
                  <label className="form-label">
                    <Package size={12} /> Tên sản phẩm / Vật tư
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên sản phẩm..."
                    className="form-input"
                  />
                </div>

                {/* Mã SKU (Tự động sinh) */}
                <div>
                  <label className="form-label">
                    <Hash size={12} /> Mã định danh SKU (Hệ thống tự tạo)
                  </label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input
                      type="text"
                      readOnly
                      value={sku}
                      className="form-input"
                      style={{ fontFamily: "monospace", fontWeight: 600 }}
                    />
                    <button
                      type="button"
                      onClick={handleGenerateSKU}
                      className="btn btn-ghost"
                      style={{ whiteSpace: "nowrap" }}
                      disabled={isSubmitting}
                    >
                      Đổi mã
                    </button>
                  </div>
                </div>

                {/* Vị trí kệ kho */}
                <div>
                  <label className="form-label">
                    <MapPin size={12} /> Vị trí xếp kệ
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="form-input"
                  >
                    {availableLocations.length > 0 ? (
                      availableLocations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))
                    ) : (
                      <option disabled value="">
                        Kho đã hết vị trí trống
                      </option>
                    )}
                  </select>
                </div>

                {/* Số lượng nhập kho ban đầu */}
                <div>
                  <label className="form-label">
                    <Layers size={12} /> Số lượng nhập kho ban đầu
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    className="form-input"
                    style={{ fontFamily: "monospace", fontWeight: 600 }}
                  />
                </div>

                {/* Ngưỡng tồn tối thiểu */}
                <div>
                  <label className="form-label">
                    <AlertCircle size={12} /> Ngưỡng cảnh báo hết hàng (Min Qty)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={minQuantity}
                    onChange={(e) =>
                      setMinQuantity(parseInt(e.target.value) || 1)
                    }
                    className="form-input"
                    style={{ fontFamily: "monospace", fontWeight: 600 }}
                  />
                </div>
              </div>

              {/* Nhóm nút hành động */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || availableLocations.length === 0}
                  className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {isSubmitting ? "Đang lưu..." : "Xác nhận tạo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
