"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Package,
  Check,
  X,
  Lock,
} from "lucide-react";
import { useWarehouseStore, Product } from "@/store/useWarehouseStore";

export default function ProductsPage() {
  // Lấy dữ liệu và các hàm quản lý từ Zustand Store của Đức
  const {
    products,
    isLoading,
    initializeData,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useWarehouseStore();

  // Gọi khởi tạo dữ liệu khi trang được tải lên
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // State Quản lý Tìm kiếm & Bộ lọc
  const [searchTerm, setSearchTerm] = useState("");

  // State Quản lý Đóng/Mở Modal và Dữ liệu Form (Đồng bộ id dạng number, có location và qty)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    location: "",
    qty: 0,
  });

  // Hàm sinh mã SKU tự động ngẫu nhiên theo cấu trúc SKU-X1-XXXX
  const generateAutoSKU = (): string => {
    const zones = ["A1", "B2", "C3", "D4"];
    const randomZone = zones[Math.floor(Math.random() * zones.length)];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `SKU-${randomZone}-${randomNum}`;
  };

  // Xử lý khi mở modal Thêm mới
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      sku: generateAutoSKU(),
      location: "Khu A - Kệ 1",
      qty: 0,
    });
    setIsModalOpen(true);
  };

  // Xử lý khi mở modal Sửa
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      location: product.location,
      qty: product.qty,
    });
    setIsModalOpen(true);
  };

  // Xử lý Xóa sản phẩm sử dụng ID number của Store
  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
      deleteProduct(id);
    }
  };

  // Xử lý Lưu Form
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      // Gọi action updateProduct từ store của Đức
      updateProduct(editingProduct.id, {
        name: formData.name,
        location: formData.location,
        qty: formData.qty,
      });
    } else {
      // Gọi action addProduct từ store (Omit ID vì store tự tăng id: state.products.length + 1)
      addProduct({
        sku: formData.sku,
        name: formData.name,
        location: formData.location,
        qty: formData.qty,
      });
    }
    setIsModalOpen(false);
  };

  // Lọc sản phẩm theo từ khóa tìm kiếm (Tên hoặc mã SKU)
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm font-medium">
            Đang tải dữ liệu kho hàng...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto font-['Poppins',_sans-serif] text-slate-800 bg-white min-h-screen">
      {/* Tiêu đề trang */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-900">
            <Package className="w-6 h-6 text-indigo-600" /> Quản Lý Sản Phẩm
            Trong Kho
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Thêm, sửa, xóa và cập nhật thông tin hàng hóa vật tư.
          </p>
        </div>

        {/* Nút Thêm mới */}
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-md active:scale-95 text-sm"
        >
          <Plus className="w-4 h-4" /> Thêm sản phẩm
        </button>
      </div>

      {/* Thanh Tìm Kiếm */}
      <div className="mb-6 relative max-w-md">
        <input
          type="text"
          placeholder="Tìm theo tên hoặc mã SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all"
        />
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
      </div>

      {/* Bảng Danh Sách Sản Phẩm */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4">Mã SKU (Hệ thống)</th>
                <th className="px-6 py-4">Tên Sản Phẩm</th>
                <th className="px-6 py-4">Vị Trí Kệ</th>
                <th className="px-6 py-4 text-right">Số Lượng</th>
                <th className="px-6 py-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/60 transition-all"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-indigo-600 font-semibold">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {product.location}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs ${
                          product.qty < 15
                            ? "bg-amber-50 text-amber-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {product.qty.toLocaleString()} cái
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Nút Sửa */}
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded-lg transition-all"
                          title="Sửa sản phẩm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {/* Nút Xóa */}
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-rose-600 rounded-lg transition-all"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-slate-400"
                  >
                    Không tìm thấy sản phẩm nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: FORM THÊM / SỬA (CẬP NHẬT) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingProduct ? "Cập Nhật Sản Phẩm" : "Thêm Sản Phẩm Mới"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Nội dung */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Trường Mã SKU (Tự động tạo / Khóa khi sửa) */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  Mã SKU{" "}
                  {editingProduct && (
                    <Lock className="w-3 h-3 text-slate-400" />
                  )}
                </label>
                <input
                  type="text"
                  disabled={!!editingProduct}
                  value={formData.sku}
                  className={`w-full border border-slate-200 rounded-xl px-4 py-2 text-sm font-mono font-semibold outline-none transition-all ${
                    editingProduct
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed select-none"
                      : "bg-slate-50 text-indigo-600 focus:border-indigo-500"
                  }`}
                />
              </div>

              {/* Trường Tên sản phẩm */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Hàng chứa Vị trí kệ và Số lượng */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Vị trí kho/kệ
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Khu A - Kệ 1"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Số lượng tồn (qty)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.qty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        qty: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Footer Modal Actions */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingProduct ? "Cập nhật" : "Xác nhận"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
