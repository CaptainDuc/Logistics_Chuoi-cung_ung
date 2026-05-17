"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// 1. ĐỊNH NGHĨA VALIDATION BẰNG ZOD CHO PHIẾU NHẬP
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

  // MOCK DATA DANH SÁCH SẢN PHẨM HIỆN CÓ TRONG KHO (Để nhân viên chọn khi nhập)
  const [availableProducts, setAvailableProducts] = useState([
    {
      sku: "SKU-A1-1024",
      name: "Tai nghe Sony WH-CH720N (Black)",
      location: "Khu A - Kệ 1",
      currentQty: 2,
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

  // MOCK DATA LỊCH SỬ PHIẾU NHẬP KHO
  const [inboundTickets, setInboundTickets] = useState([
    {
      id: "IP-2026-001",
      sku: "SKU-B3-8842",
      name: "iPhone 17 Pro Max 256GB",
      qty: 20,
      date: "2026-05-15 09:30",
      handler: "Trần Minh Đức",
      note: "Nhập hàng bổ sung đợt 1",
    },
    {
      id: "IP-2026-002",
      sku: "SKU-A1-1024",
      name: "Tai nghe Sony WH-CH720N (Black)",
      qty: 5,
      date: "2026-05-16 14:15",
      handler: "Trần Minh Đức",
      note: "Hàng bảo hành trả về",
    },
  ]);

  // KHỞI TẠO FORM
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

  // Theo dõi SKU được chọn để hiển thị thông tin đi kèm (Vị trí, Số lượng hiện tại)
  const watchedSku = watch("productSku");
  const selectedProductInfo = availableProducts.find(
    (p) => p.sku === watchedSku
  );

  // Xử lý lưu phiếu nhập kho
  const onSubmit = (data: InboundFormValues) => {
    const targetProduct = availableProducts.find(
      (p) => p.sku === data.productSku
    );
    if (!targetProduct) return;

    const numQtyToAdd = Number(data.qtyToAdd);

    // 1. Tạo phiếu nhập mới lưu vào lịch sử
    const newTicket = {
      id: `IP-2026-00${inboundTickets.length + 1}`,
      sku: data.productSku,
      name: targetProduct.name,
      qty: numQtyToAdd,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      handler: "Trần Minh Đức",
      note: data.note || "Không có ghi chú",
    };

    // 2. Cập nhật cộng dồn số lượng vào danh sách sản phẩm (Logic thực tế của kho)
    setAvailableProducts((prev) =>
      prev.map((p) =>
        p.sku === data.productSku
          ? { ...p, currentQty: p.currentQty + numQtyToAdd }
          : p
      )
    );

    setInboundTickets([newTicket, ...inboundTickets]);
    reset();
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* TIÊU ĐỀ & NÚT TẠO PHIẾU */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý nhập kho
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

      {/* LỊCH SỬ NHẬP KHO */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Nhật ký nhập kho gần đây
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-xs font-bold uppercase bg-slate-50">
                <th className="py-3 px-6">Mã Phiếu</th>
                <th className="py-3 px-6">Sản phẩm</th>
                <th className="py-3 px-6">Số lượng nhập</th>
                <th className="py-3 px-6">Thời gian</th>
                <th className="py-3 px-6">Người thực hiện</th>
                <th className="py-3 px-6">Ghi chú</th>
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
                      {ticket.sku}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-bold text-blue-600">
                    +{ticket.qty} cái
                  </td>
                  <td className="py-4 px-6 text-slate-500">{ticket.date}</td>
                  <td className="py-4 px-6 text-slate-700 font-medium">
                    {ticket.handler}
                  </td>
                  <td className="py-4 px-6 text-slate-400 text-xs max-w-xs truncate">
                    {ticket.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TẠO PHIẾU NHẬP KHO */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Lập phiếu nhập kho mới
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* CHỌN SẢN PHẨM CÓ SẴN */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Chọn sản phẩm nhập bổ sung
                </label>
                <select
                  {...register("productSku")}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                >
                  <option value="">-- Chọn mặt hàng cần nhập --</option>
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
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs animate-in slide-in-from-top-2 duration-150">
                  <div className="flex justify-between text-slate-500">
                    <span>Vị trí lưu trữ hiện tại:</span>
                    <span className="font-bold text-slate-700">
                      {selectedProductInfo.location}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Số lượng hiện có trong kho:</span>
                    <span className="font-bold text-slate-700">
                      {selectedProductInfo.currentQty} cái
                    </span>
                  </div>
                </div>
              )}

              {/* SỐ LƯỢNG NHẬP THÊM */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Số lượng thực nhập
                </label>
                <input
                  type="text"
                  placeholder="Nhập số lượng bổ sung..."
                  {...register("qtyToAdd")}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
                {errors.qtyToAdd && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.qtyToAdd.message}
                  </p>
                )}
              </div>

              {/* GHI CHÚ PHIẾU NHẬP */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Ghi chú lý do nhập
                </label>
                <textarea
                  rows={2}
                  placeholder="..."
                  {...register("note")}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 resize-none"
                />
              </div>

              {/* NÚT ĐIỀU KHIỂN */}
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
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                >
                  Xác nhận nhập kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
