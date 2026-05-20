"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Check,
  X,
  ClipboardX,
  FileText,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import { useWarehouseStore } from "@/store/useWarehouseStore";
import { useToastStore } from "@/store/useToastStore";
import { getFetchErrorMessage } from "@/lib/apiError";
import { isAdminUser } from "@/lib/authRole";
import { useAdminStore } from "@/store/useAdminStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function OutboundPage() {
  const { adminName } = useAdminStore();

  // 🔥 ĐỒNG BỘ HOÀN TOÀN: Gọi đúng các state và hàm từ file useWarehouseStore của Đức
  const {
    products,
    isLoading,
    fetchProducts,
    addInventoryTransaction, // Sử dụng hàm transaction chung của Backend
  } = useWarehouseStore();

  // Gọi API lấy danh sách sản phẩm mới nhất từ MongoDB khi load trang
  useEffect(() => {
    if (fetchProducts) {
      fetchProducts();
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productSku: "",
    qty: 1,
    customerName: "",
  });

  const toast = useToastStore((s) => s.show);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(isAdminUser());
  }, []);

  // Tự động chọn sản phẩm đầu tiên khi mở modal xuất kho
  const handleOpenModal = () => {
    if (products && products.length > 0) {
      const firstProduct = products[0];

      if (firstProduct) {
        setFormData({
          productSku: firstProduct.sku || "",
          qty: 1,
          customerName: "",
        });
      }
    } else {
      setFormData({ productSku: "", qty: 1, customerName: "" });
    }
    setIsModalOpen(true);
  };

  // Xử lý khi bấm xác nhận xuất kho bổ sung
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productSku) {
      toast("Vui lòng chọn một sản phẩm để xuất kho.", "error");
      return;
    }

    // Tìm sản phẩm khớp để kiểm tra tồn kho thực tế trước khi bấm xuất
    const selectedProduct = products.find((p) => p.sku === formData.productSku);

    // Sửa lỗi gạch đỏ: So sánh với p.quantity thay vì p.qty cũ
    if (selectedProduct && formData.qty > (selectedProduct.quantity || 0)) {
      toast(
        `Số lượng xuất (${formData.qty}) vượt quá tồn kho hiện có (${
          selectedProduct.quantity || 0
        }).`,
        "error"
      );
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

      const response = await fetch(
        `${API_URL}/inventory/export-excel?type=Export`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const msg = await getFetchErrorMessage(
          response,
          "Không thể xuất Excel xuất kho."
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
      console.error(err);

      toast(
        err instanceof Error ? err.message : "Xuất Excel xuất kho thất bại!",
        "error"
      );
    } finally {
      setIsExporting(false);
    }
  };
  // Lọc an toàn danh sách sản phẩm hiển thị trên bảng
  const safeProducts = products || [];
  const filteredProducts = safeProducts.filter(
    (product) =>
      (product.sku || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.location || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sử dụng biến trạng thái isLoading đồng bộ từ Store của Đức
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm font-medium animate-pulse">
            Đang tải dữ liệu bãi kho thực tế từ MongoDB...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto font-['Poppins',_sans-serif] text-slate-800 bg-white min-h-screen">
      {/* Tiêu đề trang Outbound */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-900">
            <ClipboardX className="w-6 h-6 text-rose-600" /> Quản Lý Xuất Kho
            (Outbound)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Lập phiếu xuất kho giao hàng cho đối tác và quản lý cập nhật số
            lượng tồn kho thực tế.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <button
              type="button"
              onClick={handleExportOutboundExcel}
              disabled={isExporting}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:pointer-events-none text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-md active:scale-95 text-sm"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              {isExporting ? "Đang xuất..." : "Xuất Excel Xuất Kho"}
            </button>
          ) : (
            <span
              className="text-xs text-slate-400 max-w-[180px] leading-snug"
              title="Chỉ Admin mới xuất Excel."
            >
              Xuất Excel: cần quyền Admin
            </span>
          )}

          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-md active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4" />
            Tạo phiếu xuất kho
          </button>
        </div>
      </div>

      {/* Tìm kiếm */}
      <div className="mb-6 relative max-w-md">
        <input
          type="text"
          placeholder="Tìm sản phẩm theo mã SKU hoặc tên hàng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-rose-500 focus:bg-white transition-all"
        />
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
      </div>

      {/* Bảng Danh Sách Sản Phẩm Theo Dõi Xuất */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4">Mã Vật Tư (SKU)</th>
                <th className="px-6 py-4">Tên Sản Phẩm</th>
                <th className="px-6 py-4">Vị Trí Kệ</th>
                <th className="px-6 py-4 text-right">Số Lượng Tồn Thực Tế</th>
                <th className="px-6 py-4">Trạng Thái Kho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-slate-50/60 transition-all"
                  >
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-rose-600">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {product.location || "Chưa xếp kệ"}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                      {Number(product.quantity || 0).toLocaleString()} cái
                    </td>
                    <td className="px-6 py-4">
                      {product.quantity <= product.minQuantity ? (
                        <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[11px] font-bold px-2 py-0.5 rounded-lg">
                          Chạm mức tối thiểu
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-bold px-2 py-0.5 rounded-lg">
                          Đủ điều kiện xuất
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-slate-400"
                  >
                    Không tìm thấy hàng hóa nào phù hợp với từ khóa kiếm tìm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL LẬP PHIẾU XUẤT KHO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-600" /> Lập Phiếu Xuất
                Kho
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTicket} className="p-6 space-y-4">
              {/* Chọn vật tư / Sản phẩm xuất */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Chọn vật tư / Sản phẩm xuất
                </label>
                {safeProducts.length > 0 ? (
                  <select
                    value={formData.productSku}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        productSku: e.target.value,
                      });
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:border-rose-500 outline-none transition-all cursor-pointer text-slate-700"
                  >
                    {safeProducts.map((p) => (
                      /* Sửa triệt để lỗi TypeScript: p._id làm key và p.quantity lấy số lượng tồn thực tế từ database Atlas */
                      <option key={p._id} value={p.sku}>
                        {p.name} ({p.sku}) — Tồn thực tế: {p.quantity ?? 0}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm text-rose-500 bg-rose-50 border border-rose-100 p-3 rounded-xl">
                    Hiện tại chưa có sản phẩm nào trong bãi kho để xuất hàng.
                  </div>
                )}
              </div>

              {/* Số lượng xuất */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Số lượng xuất
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.qty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      qty: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:border-rose-500 outline-none transition-all font-mono"
                />
              </div>

              {/* Tên Đại lý / Khách hàng nhận */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Tên Đại lý / Khách hàng nhận
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên đơn vị hoặc đại lý đối tác..."
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:border-rose-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-600 font-medium">
                Người tạo phiếu xuất: {adminName}
              </div>

              {/* Footer hành động */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 mt-6">
                <button
                  type="button"
                  onClick={() => !isSubmitting && setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all disabled:opacity-50"
                >
                  <X className="w-4 h-4" /> Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={safeProducts.length === 0 || isSubmitting}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all shadow-md ${
                    safeProducts.length === 0 || isSubmitting
                      ? "bg-slate-300 cursor-not-allowed shadow-none"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>
                    {isSubmitting ? "Đang xử lý..." : "Xác nhận xuất kho"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
