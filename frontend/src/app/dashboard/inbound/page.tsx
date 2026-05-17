"use client";

import { useAdminStore } from "@/store/useAdminStore";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Check,
  X,
  ClipboardCheck,
  User,
  Calendar,
  FileText,
} from "lucide-react";
import { useWarehouseStore } from "@/store/useWarehouseStore";

export default function InboundPage() {
  const { adminName } = useAdminStore();
  // Lấy dữ liệu sản phẩm, phiếu nhập và hàm xử lý từ Store của Đức
  const {
    products,
    inboundTickets,
    isLoading,
    initializeData,
    addInboundTicket,
  } = useWarehouseStore();

  // Khởi tạo dữ liệu khi load trang
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // State quản lý tìm kiếm phiếu nhập
  const [searchTerm, setSearchTerm] = useState("");

  // State quản lý Đóng/Mở Modal và Form lập phiếu
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productSku: "",
    qty: 1,
    note: "",
  });

  // Khi mở modal, tự động chọn sản phẩm đầu tiên trong danh sách (nếu có)
  const handleOpenModal = () => {
    if (products.length > 0) {
      setFormData({ productSku: products[0].sku, qty: 1, note: "" });
    } else {
      setFormData({ productSku: "", qty: 1, note: "" });
    }
    setIsModalOpen(true);
  };

  // Hàm helper sinh chuỗi thời gian thực hiện tại theo định dạng: DD/MM/YYYY - HH:mm
  const getRealTimeInbound = (): string => {
    const now = new Date();
    const date = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${date}/${month}/${year} - ${hours}:${minutes}`;
  };

  // Xử lý tạo phiếu nhập kho
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productSku) {
      alert("Vui lòng chọn một sản phẩm để nhập kho!");
      return;
    }

    // Gọi hàm và dùng "as any" để truyền tên Admin động mà không lo trùng/lệch vị trí interface trong Store
    (addInboundTicket as any)({
      productSku: formData.productSku,
      qty: formData.qty,
      note: formData.note,
      handler: adminName, // Tên admin động lấy từ useAdminStore
    });

    alert("Lập phiếu nhập kho thành công!");
    setIsModalOpen(false);
  };

  // Lọc lịch sử phiếu nhập theo Mã sản phẩm hoặc Tên sản phẩm hoặc Người xử lý
  const filteredTickets = inboundTickets.filter(
    (ticket) =>
      ticket.productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.handler.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm font-medium">
            Đang tải lịch sử nhập kho...
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
            <ClipboardCheck className="w-6 h-6 text-indigo-600" /> Quản Lý Nhập
            Kho (Inbound)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Lập phiếu nhập kho bổ sung và theo dõi lịch sử luồng hàng vào.
          </p>
        </div>

        {/* Nút Tạo phiếu nhập */}
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-md active:scale-95 text-sm"
        >
          <Plus className="w-4 h-4" /> Tạo phiếu nhập kho
        </button>
      </div>

      {/* Thanh Tìm Kiếm phiếu nhập */}
      <div className="mb-6 relative max-w-md">
        <input
          type="text"
          placeholder="Tìm theo mã SKU, tên hàng hoặc người lập..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all"
        />
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
      </div>

      {/* Bảng Danh Sách Lịch Sử Nhập Kho */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4">Mã Phiếu</th>
                <th className="px-6 py-4">Sản Phẩm Nhập</th>
                <th className="px-6 py-4 text-right">Số Lượng Nhập</th>
                <th className="px-6 py-4">Thời Gian</th>
                <th className="px-6 py-4">Người Xử Lý</th>
                <th className="px-6 py-4">Ghi Chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-slate-50/60 transition-all"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {ticket.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">
                        {ticket.name}
                      </div>
                      <div className="text-xs font-mono text-indigo-600 mt-0.5">
                        {ticket.productSku}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">
                      +{ticket.qty.toLocaleString()} cái
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />{" "}
                        {ticket.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />{" "}
                        {ticket.handler}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 text-slate-400 text-xs max-w-xs truncate"
                      title={ticket.note}
                    >
                      {ticket.note || "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-slate-400"
                  >
                    Chưa có lịch sử phiếu nhập kho nào được lập.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: FORM LẬP PHIẾU NHẬP KHO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> Lập Phiếu Nhập
                Kho
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Nội dung */}
            <form onSubmit={handleSubmitTicket} className="p-6 space-y-4">
              {/* Chọn sản phẩm từ danh sách */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Chọn vật tư / Sản phẩm nhập
                </label>
                {products.length > 0 ? (
                  <select
                    value={formData.productSku}
                    onChange={(e) =>
                      setFormData({ ...formData, productSku: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.sku}>
                        {p.name} ({p.sku}) — Tồn: {p.qty}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm text-rose-500 bg-rose-50 border border-rose-100 p-3 rounded-xl">
                    Hiện tại chưa có sản phẩm nào. Đức hãy qua trang Sản Phẩm để
                    thêm mặt hàng trước nhé!
                  </div>
                )}
              </div>

              {/* Số lượng nhập thêm */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Số lượng nhập thêm
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
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Lý do / Ghi chú nhập hàng */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Ghi chú phiếu nhập
                </label>
                <textarea
                  rows={3}
                  placeholder="..."
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-slate-400"
                />
              </div>

              {/* Đã cập nhật lấy adminName động từ Admin Store */}
              <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl text-xs text-slate-600 font-medium">
                Người tạo phiếu: {adminName}
              </div>

              {/* Footer Modal Actions */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 mt-6">
                {/* Đã thêm icon X đồng bộ vào nút Hủy bỏ */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
                >
                  <X className="w-4 h-4" /> Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={products.length === 0}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all shadow-md ${
                    products.length === 0
                      ? "bg-slate-300 cursor-not-allowed shadow-none"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>Xác nhận nhập kho</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
