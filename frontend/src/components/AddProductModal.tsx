"use client";

import { useWarehouseStore } from "@/store/useWarehouseStore";
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
  const { products } = useWarehouseStore();
  const busyLocations = (products as any[])
    .filter((p) => (Number(p.quantity) || 0) > 0 && p.location)
    .map((p) => String(p.location).trim());
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [location, setLocation] = useState(""); // Mặc định chọn vị trí đầu tiên
  const [quantity, setQuantity] = useState(1); // 🔥 ĐỒNG BỘ: Tạo thêm state quản lý số lượng nhập ban đầu
  const [minQuantity, setMinQuantity] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy hành động addProduct từ Zustand Store ra để sử dụng
  const addProduct = useWarehouseStore((state) => state.addProduct);

  const handleGenerateSKU = () => {
    const prefix = "SKU";
    const timestamp = Date.now().toString().slice(-8);
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    setSku(`${prefix}-${timestamp}-${randomStr}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (!location || location === "") {
      alert("Đức ơi, vui lòng click chọn một vị trí kho còn trống nha!");
      return;
    }
    e.preventDefault();
    if (!name || !sku || !location) {
      alert("Đức vui lòng điền đầy đủ thông tin nha!");
      return;
    }

    setIsSubmitting(true);
    try {
      // 🚀 GỌI THẲNG API QUA STORE - Truyền đúng giá trị biến quantity thực tế Đức nhập
      await addProduct({
        sku,
        name,
        location,
        quantity: Number(quantity), // 🔥 ĐỒNG BỘ: Đổi từ số 0 cứng sang biến state quantity nha
        minQuantity,
        supplierId: null, // Để tạm null nếu Đức chưa chọn Nhà cung cấp trong form
      });

      // Reset các trường dữ liệu trong form về trạng thái trống
      setName("");
      setLocation(STORAGE_LOCATIONS[0]);
      setQuantity(1); // Reset số lượng về 1
      setMinQuantity(5);
      setIsOpen(false);

      // Nếu trang cha có truyền hàm callback hành động thì kích hoạt
      if (onSuccess) onSuccess();

      alert(
        "Khởi tạo đầu mục sản phẩm thành công trên hệ thống MongoDB Atlas!"
      );
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      alert("Đã xảy ra lỗi khi lưu sản phẩm!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableLocations = STORAGE_LOCATIONS.filter(
    (loc) => !busyLocations.includes(loc.trim())
  );

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          handleGenerateSKU();
        }}
        className="flex items-center gap-2 bg-slate-900 text-white font-medium px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-all active:scale-95 text-sm shadow-sm"
      >
        <Plus className="w-4 h-4" /> Thêm sản phẩm
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[4px]">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6 relative animate-in fade-in zoom-in-95 duration-150 text-slate-800">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Thêm sản phẩm mới
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Vật tư mới sẽ được cấp mã định danh QR tự động ngay sau khi tạo.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tên sản phẩm */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" /> Tên sản phẩm / Vật tư
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên sản phẩm..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-slate-50/50"
                />
              </div>

              {/* Mã SKU (Tự động sinh) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5" /> Mã định danh SKU (Hệ thống tự
                  tạo)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={sku}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-slate-100 text-slate-600 cursor-not-allowed font-mono font-medium focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateSKU}
                    className="px-3 text-xs font-medium border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Đổi mã
                  </button>
                </div>
              </div>

              {/* Vị trí kệ kho */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Vị trí xếp kệ
                </label>
                <select
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-slate-50/50 cursor-pointer text-slate-700"
                >
                  {/* Dòng nhắc nhở bắt buộc click chọn */}
                  <option value="">-- Vui lòng chọn một kệ kho trống --</option>

                  {/* Chỉ hiển thị các vị trí kho chưa có ai ngồi */}
                  {availableLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* 🔥 ĐỒNG BỘ: Chèn thêm trường nhập Số lượng ban đầu */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Số lượng nhập kho ban đầu
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder="Nhập số lượng ban đầu..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-slate-50/50 font-mono"
                />
              </div>

              {/* Ngưỡng tồn tối thiểu */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Ngưỡng cảnh báo hết
                  hàng (Min Qty)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={minQuantity}
                  onChange={(e) => setMinQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-slate-50/50 font-mono"
                />
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
                  disabled={isSubmitting}
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
