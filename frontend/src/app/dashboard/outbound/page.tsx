"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface OutboundFormValues {
  productSku: string;
  qtyToSub: string;
  customerName: string;
  note?: string;
}

export default function OutboundPage() {
  const [isOpen, setIsOpen] = useState(false);

  // MOCK DATA SẢN PHẨM HIỆN CÓ TRONG KHO (Dùng để đối chiếu số lượng tồn)
  const [availableProducts, setAvailableProducts] = useState([
    {
      sku: "SKU-A1-1024",
      name: "Tai nghe Sony WH-CH720N (Black)",
      location: "Khu A - Kệ 1",
      currentQty: 15,
    },
    {
      sku: "SKU-B3-8842",
      name: "iPhone 17 Pro Max 256GB",
      location: "Khu B - Kệ 3",
      currentQty: 45,
    },
    {
      sku: "SKU-C2-4915",
      name: "Hộp carton đóng gói size M",
      location: "Khu C - Kệ 2",
      currentQty: 12,
    },
  ]);

  // MOCK DATA LỊCH SỬ PHIẾU XUẤT KHO
  const [outboundTickets, setOutboundTickets] = useState([
    {
      id: "OP-2026-001",
      sku: "SKU-C2-4915",
      name: "Hộp carton đóng gói size M",
      qty: 5,
      date: "2026-05-17 10:15",
      handler: "Trần Minh Đức",
      customer: "Cửa hàng Đại lý Quận 9",
      note: "Xuất kho đóng gói đơn hàng",
    },
  ]);

  // DỰNG DYNAMIC VALIDATION BẰNG ZOD: Bắt lỗi số lượng xuất vượt giới hạn tồn kho
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
        .min(3, { message: "Tên khách hàng/đại lý nhận phải từ 3 ký tự" }),
      note: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      // Tìm sản phẩm trong kho để kiểm tra số lượng tồn
      const targetProduct = availableProducts.find(
        (p) => p.sku === data.productSku
      );
      if (targetProduct && Number(data.qtyToSub) > targetProduct.currentQty) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["qtyToSub"], // Chỉ định vị trí báo lỗi đỏ tại ô nhập số lượng
          message: `Vượt quá giới hạn! Kho chỉ còn lại tối đa ${targetProduct.currentQty} cái.`,
        });
      }
    });

  // KHỞI TẠO FORM KÈM THEO BỘ GIẢI QUYẾT LỖI SUPERREFINE
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

  // Theo dõi SKU được chọn để hiển thị thông tin tồn kho thời gian thực trên giao diện Form
  const watchedSku = watch("productSku");
  const selectedProductInfo = availableProducts.find(
    (p) => p.sku === watchedSku
  );

  // Xử lý tạo lệnh xuất kho
  const onSubmit = (data: OutboundFormValues) => {
    const targetProduct = availableProducts.find(
      (p) => p.sku === data.productSku
    );
    if (!targetProduct) return;

    const numQtyToSub = Number(data.qtyToSub);

    // 1. Tạo bản ghi lịch sử phiếu xuất kho mới
    const newTicket = {
      id: `OP-2026-00${outboundTickets.length + 1}`,
      sku: data.productSku,
      name: targetProduct.name,
      qty: numQtyToSub,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      handler: "Trần Minh Đức",
      customer: data.customerName,
      note: data.note || "Không có ghi chú",
    };

    // 2. Trừ bớt số lượng sản phẩm trong kho
    setAvailableProducts((prev) =>
      prev.map((p) =>
        p.sku === data.productSku
          ? { ...p, currentQty: p.currentQty - numQtyToSub }
          : p
      )
    );

    setOutboundTickets([newTicket, ...outboundTickets]);
    reset();
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* TIÊU ĐỀ & NÚT MỞ MODAL */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý Xuất kho (Outbound)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Lập phiếu xuất hàng, kiểm tra giới hạn tồn kho và lưu nhật ký đơn
            xuất.
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

      {/* DANH SÁCH LỊCH SỬ XUẤT KHO */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Nhật ký xuất hàng gần đây
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-xs font-bold uppercase bg-slate-50">
                <th className="py-3 px-6">Mã Phiếu</th>
                <th className="py-3 px-6">Sản phẩm</th>
                <th className="py-3 px-6">Số lượng xuất</th>
                <th className="py-3 px-6">Khách nhận / Đối tác</th>
                <th className="py-3 px-6">Thời gian xuất</th>
                <th className="py-3 px-6">Ghi chú lý do</th>
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
                      {ticket.sku}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-bold text-rose-600">
                    -{ticket.qty} cái
                  </td>
                  <td className="py-4 px-6 text-slate-700 font-medium">
                    {ticket.customer}
                  </td>
                  <td className="py-4 px-6 text-slate-500">{ticket.date}</td>
                  <td className="py-4 px-6 text-slate-400 text-xs max-w-xs truncate">
                    {ticket.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TẠO PHIẾU XUẤT KHO */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Lập phiếu xuất kho
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* CHỌN SẢN PHẨM XUẤT KHO */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Chọn sản phẩm cần xuất
                </label>
                <select
                  {...register("productSku")}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-800"
                >
                  <option value="">-- Chọn mặt hàng trong kho --</option>
                  {availableProducts.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} (Còn {p.currentQty} cái)
                    </option>
                  ))}
                </select>
                {errors.productSku && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.productSku.message}
                  </p>
                )}
              </div>

              {/* HIỂN THỊ VỊ TRÍ KHO KHẢ DỤNG */}
              {selectedProductInfo && (
                <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 space-y-1 text-xs animate-in slide-in-from-top-2 duration-150">
                  <div className="flex justify-between text-slate-600">
                    <span>Vị trí kệ lấy hàng:</span>
                    <span className="font-bold text-rose-700">
                      {selectedProductInfo.location}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Số lượng khả dụng tối đa:</span>
                    <span className="font-bold text-rose-700">
                      {selectedProductInfo.currentQty} cái
                    </span>
                  </div>
                </div>
              )}

              {/* TÊN ĐẠI LÝ / KHÁCH HÀNG NHẬN HÀNG */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Khách hàng / Đại lý nhận hàng
                </label>
                <input
                  type="text"
                  placeholder="..."
                  {...register("customerName")}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-800"
                />
                {errors.customerName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.customerName.message}
                  </p>
                )}
              </div>

              {/* SỐ LƯỢNG THỰC XUẤT */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Số lượng xuất bốc hàng
                </label>
                <input
                  type="text"
                  placeholder="0"
                  {...register("qtyToSub")}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-800"
                />
                {errors.qtyToSub && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.qtyToSub.message}
                  </p>
                )}
              </div>

              {/* GHI CHÚ PHIẾU XUẤT */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Ghi chú mục đích xuất
                </label>
                <textarea
                  rows={2}
                  placeholder="..."
                  {...register("note")}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-800 resize-none"
                />
              </div>

              {/* CÁC NÚT ĐIỀU KHIỂN */}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
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
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
                >
                  Xác nhận xuất kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
