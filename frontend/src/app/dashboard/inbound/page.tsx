"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useWarehouseStore } from "@/store/useWarehouseStore";

// 1. ĐỊNH NGHĨA VALIDATION SCHEMA VỚI ZOD
const inboundSchema = z.object({
  productSku: z
    .string()
    .min(1, { message: "Vui lòng chọn sản phẩm cần nhập kho" }),
  qtyToAdd: z
    .string()
    .min(1, { message: "Số lượng nhập không được để trống" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Số lượng nhập phải là số dương lớn hơn 0",
    }),
  note: z.string().optional(),
});

interface InboundFormValues {
  productSku: string;
  qtyToAdd: string;
  note?: string;
}

export default function InboundPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. KẾT NỐI VÀ LẤY DỮ LIỆU TỪ ZUSTAND STORE TẬP TRUNG
  const {
    products: availableProducts,
    inboundTickets,
    isLoading,
    initializeData,
    addInboundTicket,
  } = useWarehouseStore();

  // 3. TỰ ĐỘNG KHỞI TẠO DỮ LIỆU KHI VÀO TRANG
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // KHỞI TẠO HOOK FORM
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<InboundFormValues>({
    resolver: zodResolver(inboundSchema),
    defaultValues: { productSku: "", qtyToAdd: "", note: "" },
  });

  // THEO DÕI SẢN PHẨM ĐANG ĐƯỢC CHỌN ĐỂ HIỂN THỊ THÔNG TIN CHI TIẾT
  const watchedSku = watch("productSku");
  const selectedProductInfo = availableProducts.find(
    (p) => p.sku === watchedSku
  );

  // XỬ LÝ LẬP PHIẾU NHẬP KHO (Giả lập độ trễ mạng 1 giây)
  const onSubmit = (data: InboundFormValues) => {
    setIsSubmitting(true);

    setTimeout(() => {
      // Gọi Action của Zustand để cập nhật kho và lưu phiếu nhập
      addInboundTicket({
        productSku: data.productSku,
        qty: Number(data.qtyToAdd),
        note: data.note || "Không có ghi chú",
      });

      setIsSubmitting(false);
      setIsOpen(false);
      reset();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & NÚT TẠO PHIẾU */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý Nhập kho (Inbound)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Lập phiếu nhập kho bổ sung số lượng và theo dõi lịch sử nhập hàng.
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2"
        >
          <span>📥</span>
          <span>Tạo phiếu nhập kho</span>
        </button>
      </div>

      {/* HIỂN THỊ TRẠNG THÁI LOADING HOẶC BẢNG NHẬT KÝ */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 flex flex-col items-center justify-center space-y-3 shadow-sm">
          <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium animate-pulse">
            Đang tải nhật ký nhập kho...
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs font-bold uppercase bg-slate-50">
                  <th className="py-3 px-6">Mã Phiếu</th>
                  <th className="py-3 px-6">Sản phẩm</th>
                  <th className="py-3 px-6">Số lượng nhập</th>
                  <th className="py-3 px-6">Ghi chú</th>
                  <th className="py-3 px-6">Thời gian</th>
                  <th className="py-3 px-6">Người thực hiện</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {inboundTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 px-6 font-mono text-xs text-blue-600 font-bold">
                      {ticket.id}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-900">
                        {ticket.name}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {ticket.productSku}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-blue-600">
                      +{ticket.qty} cái
                    </td>
                    <td className="py-4 px-6 text-slate-500 italic max-w-xs truncate">
                      {ticket.note}
                    </td>
                    <td className="py-4 px-6 text-slate-500">{ticket.date}</td>
                    <td className="py-4 px-6 text-slate-700 font-medium">
                      {ticket.handler}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL LẬP PHIẾU NHẬP KHO */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Lập phiếu nhập kho mới
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* DROPDOWN CHỌN SẢN PHẨM TỪ STORE TẬP TRUNG */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Chọn sản phẩm
                </label>
                <select
                  {...register("productSku")}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                >
                  <option value="">-- Chọn mặt hàng --</option>
                  {availableProducts.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
                {errors.productSku && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.productSku.message}
                  </p>
                )}
              </div>

              {/* THÔNG TIN CHI TIẾT SẢN PHẨM KHI ĐƯỢC CHỌN */}
              {selectedProductInfo && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs animate-in fade-in duration-200">
                  <div className="flex justify-between text-slate-500">
                    <span>Vị trí kho hiện tại:</span>
                    <span className="font-bold text-slate-700">
                      📍 {selectedProductInfo.location}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Số lượng tồn hiện tại:</span>
                    <span className="font-bold text-slate-700">
                      {selectedProductInfo.qty} cái
                    </span>
                  </div>
                </div>
              )}

              {/* SỐ LƯỢNG THỰC NHẬP */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Số lượng thực nhập
                </label>
                <input
                  type="text"
                  placeholder="Nhập số lượng, ví dụ: 10"
                  {...register("qtyToAdd")}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
                {errors.qtyToAdd && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.qtyToAdd.message}
                  </p>
                )}
              </div>

              {/* GHI CHÚ NHẬP KHO */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Ghi chú
                </label>
                <textarea
                  rows={2}
                  placeholder="Lý do nhập kho, thông tin đối tác bổ sung..."
                  {...register("note")}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 resize-none"
                />
              </div>

              {/* NÚT ĐIỀU KHIỂN */}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsOpen(false);
                    reset();
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center space-x-2 disabled:bg-blue-400"
                >
                  {isSubmitting && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  <span>
                    {isSubmitting ? "Đang thực hiện..." : "Xác nhận nhập"}
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
