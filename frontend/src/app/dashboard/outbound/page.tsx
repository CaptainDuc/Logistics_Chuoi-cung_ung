"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useWarehouseStore } from "@/store/useWarehouseStore";

interface OutboundFormValues {
  productSku: string;
  qtyToSub: string;
  customerName: string;
  note?: string;
}

export default function OutboundPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. KẾT NỐI VÀ LẤY DỮ LIỆU TỪ ZUSTAND STORE TẬP TRUNG
  const {
    products: availableProducts,
    outboundTickets,
    isLoading,
    initializeData,
    addOutboundTicket,
  } = useWarehouseStore();

  // 2. TỰ ĐỘNG KHỞI TẠO DỮ LIỆU KHI VÀO TRANG
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // 3. ĐỊNH NGHĨA VALIDATION SCHEMA VỚI LOGIC CHẶN XUẤT ÂM KHO
  const outboundSchema = z
    .object({
      productSku: z
        .string()
        .min(1, { message: "Vui lòng chọn sản phẩm cần xuất kho" }),
      qtyToSub: z
        .string()
        .min(1, { message: "Số lượng xuất không được để trống" })
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
          message: "Số lượng xuất phải là số dương lớn hơn 0",
        }),
      customerName: z
        .string()
        .min(3, { message: "Tên đối tác/Đại lý nhận phải từ 3 ký tự" }),
      note: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const targetProduct = availableProducts.find(
        (p) => p.sku === data.productSku
      );
      if (targetProduct && Number(data.qtyToSub) > targetProduct.qty) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["qtyToSub"],
          message: `Vượt quá giới hạn! Trong kho hiện tại chỉ còn lại tối đa ${targetProduct.qty} cái.`,
        });
      }
    });

  // KHỞI TẠO HOOK FORM
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<OutboundFormValues>({
    resolver: zodResolver(outboundSchema),
    defaultValues: { productSku: "", qtyToSub: "", customerName: "", note: "" },
  });

  // THEO DÕI SẢN PHẨM ĐANG ĐƯỢC CHỌN ĐỂ HIỂN THỊ THÔNG TIN TRỰC QUAN
  const watchedSku = watch("productSku");
  const selectedProductInfo = availableProducts.find(
    (p) => p.sku === watchedSku
  );

  // XỬ LÝ LẬP PHIẾU XUẤT KHO (Giả lập độ trễ mạng 1 giây)
  const onSubmit = (data: OutboundFormValues) => {
    setIsSubmitting(true);

    setTimeout(() => {
      // Gọi Action của Zustand để tự động trừ bớt số lượng tồn trong kho dữ liệu chung
      addOutboundTicket({
        productSku: data.productSku,
        qty: Number(data.qtyToSub),
        customerName: data.customerName,
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
            Quản lý xuất kho
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Lập phiếu xuất hàng, kiểm tra giới hạn tồn và lưu nhật ký đơn xuất.
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2"
        >
          <span>📤</span>
          <span>Tạo phiếu xuất kho</span>
        </button>
      </div>

      {/* HIỂN THỊ TRẠNG THÁI LOADING HOẶC BẢNG NHẬT KÝ */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 flex flex-col items-center justify-center space-y-3 shadow-sm">
          <div className="w-10 h-10 border-4 border-rose-600/20 border-t-rose-600 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium animate-pulse">
            Đang tải nhật ký xuất kho...
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
                  <th className="py-3 px-6">Số lượng xuất</th>
                  <th className="py-3 px-6">Đối tác / Đại lý nhận</th>
                  <th className="py-3 px-6">Thời gian</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {outboundTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 px-6 font-mono text-xs text-rose-600 font-bold">
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
                    <td className="py-4 px-6 font-bold text-rose-600">
                      -{ticket.qty} cái
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-medium">
                      {ticket.customerName}
                    </td>
                    <td className="py-4 px-6 text-slate-500">{ticket.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL LẬP PHIẾU XUẤT KHO */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Lập phiếu xuất hàng khỏi kho
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* DROPDOWN CHỌN SẢN PHẨM TỪ STORE TẬP TRUNG */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Chọn sản phẩm xuất
                </label>
                <select
                  {...register("productSku")}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-800"
                >
                  <option value="">-- Chọn mặt hàng --</option>
                  {availableProducts.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} (Còn tồn: {p.qty} cái)
                    </option>
                  ))}
                </select>
                {errors.productSku && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.productSku.message}
                  </p>
                )}
              </div>

              {/* KHU VỰC THÔNG BÁO VỊ TRÍ VÀ SỐ LƯỢNG KHẢ DỤNG */}
              {selectedProductInfo && (
                <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 space-y-1 text-xs animate-in fade-in duration-200">
                  <div className="flex justify-between text-slate-600">
                    <span>Vị trí kệ lấy hàng:</span>
                    <span className="font-bold text-rose-700">
                      📍 {selectedProductInfo.location}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Số lượng khả dụng trong kho:</span>
                    <span className="font-bold text-rose-700">
                      {selectedProductInfo.qty} cái
                    </span>
                  </div>
                </div>
              )}

              {/* TÊN KHÁCH HÀNG / ĐẠI LÝ NHẬN HÀNG */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Khách hàng / Đại lý nhận
                </label>
                <input
                  type="text"
                  placeholder="Vui lòng nhập tên khách hàng/Đại lý"
                  {...register("customerName")}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-800"
                />
                {errors.customerName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.customerName.message}
                  </p>
                )}
              </div>

              {/* SỐ LƯỢNG XUẤT KHO */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Số lượng xuất
                </label>
                <input
                  type="text"
                  placeholder="Vui lòng nhập số lượng xuất"
                  {...register("qtyToSub")}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-800"
                />
                {errors.qtyToSub && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.qtyToSub.message}
                  </p>
                )}
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
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors flex items-center space-x-2 disabled:bg-rose-400"
                >
                  {isSubmitting && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  <span>
                    {isSubmitting ? "Đang xuất kho..." : "Xác nhận xuất"}
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
