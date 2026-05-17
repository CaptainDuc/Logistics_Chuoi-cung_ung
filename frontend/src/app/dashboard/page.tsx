"use client";

import React, { useEffect } from "react";
import { useWarehouseStore } from "@/store/useWarehouseStore";

export default function DashboardPage() {
  const {
    products,
    inboundTickets,
    outboundTickets,
    isLoading,
    initializeData,
  } = useWarehouseStore();

  // Tự động load dữ liệu từ Store chung khi vào trang
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // LOGIC TỰ ĐỘNG TÍNH TOÁN SỐ LIỆU TỪ ZUSTAND STORE
  const totalProductTypes = products.length;
  const totalItemsInStock = products.reduce((sum, p) => sum + p.qty, 0);
  const totalInboundTransactions = inboundTickets.length;
  const totalOutboundTransactions = outboundTickets.length;

  // LỌC CÁC SẢN PHẨM SẮP HẾT HÀNG (Ví dụ: Số lượng tồn dưới 15 cái)
  const lowStockProducts = products.filter((p) => p.qty < 15);

  // GỘP VÀ SẮP XẾP NHẬT KÝ HOẠT ĐỘNG MỚI NHẤT (Gồm cả Nhập và Xuất)
  const recentActivities = [
    ...inboundTickets.map((t) => ({
      ...t,
      type: "INBOUND",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    })),
    ...outboundTickets.map((t) => ({
      ...t,
      type: "OUTBOUND",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5); // Lấy 5 hoạt động gần nhất

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-16 flex flex-col items-center justify-center space-y-3 shadow-sm">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium animate-pulse">
          Đang tổng hợp số liệu kho hàng bãi...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Tổng quan Hệ thống
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Số liệu phân tích, cảnh báo tồn kho và nhật ký vận hành kho thời gian
          thực.
        </p>
      </div>

      {/* SECTION 1: CÁC THẺ THỐNG KÊ CHI TIẾT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Thẻ 1: Tổng loại sản phẩm */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Danh mục sản phẩm
            </p>
            <p className="text-3xl font-extrabold text-slate-900">
              {totalProductTypes}
            </p>
            <p className="text-xs text-slate-500">Mặt hàng trong hệ thống</p>
          </div>
          <div className="text-2xl bg-slate-50 p-3 rounded-lg border border-slate-100">
            📦
          </div>
        </div>

        {/* Thẻ 2: Tổng số lượng tồn kho */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Tổng sản phẩm tồn
            </p>
            <p className="text-3xl font-extrabold text-slate-900">
              {totalItemsInStock}
            </p>
            <p className="text-xs text-slate-500">Đơn vị sản phẩm lưu kho</p>
          </div>
          <div className="text-2xl bg-emerald-50 p-3 rounded-lg border border-emerald-100">
            📊
          </div>
        </div>

        {/* Thẻ 3: Tổng số đơn nhập */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Phiếu nhập kho
            </p>
            <p className="text-3xl font-extrabold text-blue-600">
              {totalInboundTransactions}
            </p>
            <p className="text-xs text-slate-500">
              Giao dịch nhập kho hoàn thành
            </p>
          </div>
          <div className="text-2xl bg-blue-50 p-3 rounded-lg border border-blue-100">
            📥
          </div>
        </div>

        {/* Thẻ 4: Tổng số đơn xuất */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Phiếu xuất kho
            </p>
            <p className="text-3xl font-extrabold text-rose-600">
              {totalOutboundTransactions}
            </p>
            <p className="text-xs text-slate-500">
              Giao dịch xuất kho hoàn thành
            </p>
          </div>
          <div className="text-2xl bg-rose-50 p-3 rounded-lg border border-rose-100">
            📤
          </div>
        </div>
      </div>

      {/* SECTION 2: GRID CHI TIẾT CẢNH BÁO VÀ NHẬT KÝ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BÊN TRÁI: CẢNH BÁO SẮP HẾT HÀNG (Chiếm 1 col trên màn lớn) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col h-[400px]">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="text-rose-500">⚠️</span> Cảnh báo ngưỡng tồn kho
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Danh sách các mặt hàng có số lượng tồn thấp (&lt; 15 cái).
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {lowStockProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <span className="text-2xl">✅</span>
                <p className="text-xs font-medium text-slate-600 mt-2">
                  Tuyệt vời! Không có sản phẩm nào ở ngưỡng báo động.
                </p>
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-rose-50/40 rounded-xl border border-rose-100 flex items-center justify-between transition-all hover:bg-rose-50/70"
                >
                  <div className="space-y-0.5 max-w-[70%]">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {p.name}
                    </p>
                    <p className="text-xs font-mono text-slate-400">
                      {p.sku} • {p.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                      Còn {p.qty} cái
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* BÊN PHẢI: NHẬT KÝ HOẠT ĐỘNG GẦN ĐÂY (Chiếm 2 col trên màn lớn) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col h-[400px]">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>⏱️</span> Nhật ký hoạt động gần đây
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dòng thời gian thực hiện các lệnh điều chuyển kho hàng bãi.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {recentActivities.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs font-medium text-slate-400">
                  Chưa ghi nhận hoạt động nhập xuất nào.
                </p>
              </div>
            ) : (
              recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 bg-slate-50/50 rounded-xl border border-slate-200 flex items-center justify-between transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center space-x-3 max-w-[75%]">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded border tracking-wider shrink-0 ${act.badgeColor}`}
                    >
                      {act.type === "INBOUND" ? "Nhập" : "Xuất"}
                    </span>
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {act.type === "INBOUND"
                          ? "Nhập bổ sung"
                          : "Xuất kho giao"}{" "}
                        {act.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        Mã phiếu:{" "}
                        <span className="font-mono text-slate-600 font-medium">
                          {act.id}
                        </span>{" "}
                        • Đối tác/Ghi chú:{" "}
                        <span className="italic">
                          {"customerName" in act ? act.customerName : act.note}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-bold ${
                        act.type === "INBOUND"
                          ? "text-blue-600"
                          : "text-rose-600"
                      }`}
                    >
                      {act.type === "INBOUND" ? "+" : "-"}
                      {act.qty} cái
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {act.date}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
