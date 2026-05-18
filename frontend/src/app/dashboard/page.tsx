"use client";

import React, { useEffect } from "react";
import { useWarehouseStore } from "@/store/useWarehouseStore";
import { Download } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const useAdminStore = () => ({ adminName: "Trần Minh Đức" });

export default function DashboardPage() {
  // 🔥 ĐỒNG BỘ: Gọi thêm transactions và fetchTransactions trực tiếp từ Store thật
  const {
    products,
    transactions,
    fetchProducts,
    fetchTransactions,
    isLoading,
  } = useWarehouseStore();
  const { adminName } = useAdminStore();

  useEffect(() => {
    fetchProducts();
    fetchTransactions(); // 🔥 Tự động nạp dữ liệu giao dịch khi load trang
  }, [fetchProducts, fetchTransactions]);

  // --- LOGIC TÍNH TOÁN SỐ LIỆU THỐNG KÊ THỰC TẾ ---
  const totalProductTypes = products.length;
  const totalItemsInStock = products.reduce(
    (sum, p) => sum + (Number(p.quantity) || 0),
    0
  );

  // Phân loại đếm số lượng phiếu dựa trên trường type từ MongoDB ('INBOUND' hoặc 'OUTBOUND')
  const inboundTickets = transactions.filter((t) => t.type === "INBOUND");
  const outboundTickets = transactions.filter((t) => t.type === "OUTBOUND");

  const totalInboundTransactions = inboundTickets.length;
  const totalOutboundTransactions = outboundTickets.length;

  const lowStockProducts = products.filter(
    (p) => (Number(p.quantity) || 0) < 15
  );

  // Chuẩn hóa danh sách hiển thị nhật ký (Lấy tối đa 5 giao dịch mới nhất)
  const recentActivities = transactions.slice(0, 5).map((act) => ({
    id: act._id || act.id,
    name: act.name || `Giao dịch sản phẩm ${act.productId?.name || "ẩn"}`,
    qty: act.quantity || act.qty || 0,
    type: act.type, // INBOUND hoặc OUTBOUND
    date: act.createdAt
      ? new Date(act.createdAt).toLocaleDateString("vi-VN")
      : "Vừa xong",
    badgeColor:
      act.type === "INBOUND"
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : "bg-rose-50 text-rose-700 border-rose-200",
  }));

  // --- HÀM XUẤT PHIẾU KHO HÀNG ---
  const exportToWarehouseExcel = async (
    dataListInput: any[],
    titleFile: string = "Phieu_Kho_Hang"
  ) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Phieu_Kho_Hang");
    worksheet.views = [{ showGridLines: false }];

    worksheet.columns = [
      { key: "stt", width: 7 },
      { key: "name", width: 42 },
      { key: "sku", width: 16 },
      { key: "unit", width: 12 },
      { key: "qty_req", width: 14 },
      { key: "qty_act", width: 14 },
      { key: "price", width: 14 },
      { key: "amount", width: 16 },
    ];

    const fontMain = { name: "Times New Roman", size: 11 };
    const fontBold = { name: "Times New Roman", size: 11, bold: true };
    const fontItalic = { name: "Times New Roman", size: 11, italic: true };
    const borderThinSide = {
      style: "thin" as const,
      color: { argb: "000000" },
    };
    const borderThin = {
      top: borderThinSide,
      left: borderThinSide,
      bottom: borderThinSide,
      right: borderThinSide,
    };

    worksheet.getCell("A1").value = "Đơn vị: .........................";
    worksheet.getCell("A1").font = fontMain;
    worksheet.getCell("H1").value = "Mẫu số: 02 - VT";
    worksheet.getCell("H1").font = fontBold;
    worksheet.getCell("H1").alignment = { horizontal: "right" };

    worksheet.getCell("A2").value = "Bộ phận: .......................";
    worksheet.getCell("A2").font = fontMain;
    worksheet.getCell("H2").value = "(Kèm theo Thông tư số 99/2025/TT-BTC";
    worksheet.getCell("H2").font = fontItalic;
    worksheet.getCell("H2").alignment = { horizontal: "right" };
    worksheet.getCell("H3").value =
      "ngày 27 tháng 10 năm 2025 của Bộ trưởng Bộ Tài chính)";
    worksheet.getCell("H3").font = fontItalic;
    worksheet.getCell("H3").alignment = { horizontal: "right" };

    worksheet.getCell("D5").value = titleFile.toUpperCase().replace(/_/g, " ");
    worksheet.getCell("D5").font = {
      name: "Times New Roman",
      size: 16,
      bold: true,
    };
    worksheet.getCell("D5").alignment = { horizontal: "center" };

    const today = new Date();
    worksheet.getCell("D6").value = `Ngày ${today.getDate()} tháng ${
      today.getMonth() + 1
    } năm ${today.getFullYear()}`;
    worksheet.getCell("D6").font = fontItalic;
    worksheet.getCell("D6").alignment = { horizontal: "center" };

    worksheet.getCell("D7").value = "Số: .........................";
    worksheet.getCell("D7").font = fontMain;
    worksheet.getCell("D7").alignment = { horizontal: "center" };

    worksheet.mergeCells("A13:A14");
    worksheet.getCell("A13").value = "STT";
    worksheet.mergeCells("B13:B14");
    worksheet.getCell("B13").value =
      "Tên, nhãn hiệu, quy cách, phẩm chất vật tư\n(sản phẩm, hàng hóa)";
    worksheet.mergeCells("C13:C14");
    worksheet.getCell("C13").value = "Mã số\n(SKU)";
    worksheet.mergeCells("D13:D14");
    worksheet.getCell("D13").value = "Đơn vị\ntính";
    worksheet.mergeCells("E13:F13");
    worksheet.getCell("E13").value = "Số lượng";
    worksheet.getCell("E14").value = "Yêu cầu";
    worksheet.getCell("F14").value = "Thực xuất";
    worksheet.mergeCells("G13:G14");
    worksheet.getCell("G13").value = "Đơn giá";
    worksheet.mergeCells("H13:H14");
    worksheet.getCell("H13").value = "Thành tiền";

    for (let r = 13; r <= 14; r++) {
      for (let c = 1; c <= 8; c++) {
        const cell = worksheet.getCell(r, c);
        cell.font = fontBold;
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        cell.border = borderThin;
      }
    }

    let currentRow = 16;
    let totalQtyReq = 0;
    let totalAmount = 0;

    dataListInput.forEach((item, index) => {
      const qty = Number(item.quantity || item.qty) || 0;
      const price = Number(item.price) || 150000;
      const amount = qty * price;

      totalQtyReq += qty;
      totalAmount += amount;

      worksheet.getCell(`A${currentRow}`).value = index + 1;
      worksheet.getCell(`B${currentRow}`).value =
        item.name || item.productId?.name || "Sản phẩm";
      worksheet.getCell(`C${currentRow}`).value =
        item.sku || item.productId?.sku || "—";
      worksheet.getCell(`D${currentRow}`).value = item.unit || "Cái";
      worksheet.getCell(`E${currentRow}`).value = qty;
      worksheet.getCell(`F${currentRow}`).value = qty;
      worksheet.getCell(`G${currentRow}`).value = price;
      worksheet.getCell(`H${currentRow}`).value = amount;

      for (let c = 1; c <= 8; c++) {
        const cell = worksheet.getCell(currentRow, c);
        cell.font = fontMain;
        cell.border = borderThin;
        if (c === 1 || c === 3 || c === 4)
          cell.alignment = { horizontal: "center", vertical: "middle" };
        if (c === 2)
          cell.alignment = { horizontal: "left", vertical: "middle" };
        if (c >= 5) {
          cell.alignment = { horizontal: "right", vertical: "middle" };
          if (c >= 7) cell.numFmt = "#,##0";
        }
      }
      currentRow++;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const fileBlob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(fileBlob, `${titleFile}_${today.toISOString().slice(0, 10)}.xlsx`);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-16 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium animate-pulse">
          Đang đồng bộ dữ liệu hệ thống bãi kho...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tổng quan hệ thống
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý số liệu tồn kho, lịch sử giao dịch vận hành thực tế. Người
            chịu trách nhiệm: {adminName}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportToWarehouseExcel(products, "Phieu_Kho_Hang")}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            Xuất phiếu tổng kho
          </button>
          <button
            onClick={() =>
              exportToWarehouseExcel(inboundTickets, "Phieu_Nhap_Kho")
            }
            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            Xuất phiếu nhập kho
          </button>
          <button
            onClick={() =>
              exportToWarehouseExcel(outboundTickets, "Phieu_Xuat_Kho")
            }
            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            Xuất phiếu xuất kho
          </button>
        </div>
      </div>

      {/* --- THẺ THỐNG KÊ SỐ LIỆU --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Danh mục sản phẩm
            </p>
            <p className="text-3xl font-extrabold text-slate-900">
              {totalProductTypes}
            </p>
          </div>
          <div className="text-2xl bg-slate-50 p-3 rounded-lg">📦</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Tổng sản phẩm tồn
            </p>
            <p className="text-3xl font-extrabold text-slate-900">
              {totalItemsInStock}
            </p>
          </div>
          <div className="text-2xl bg-emerald-50 p-3 rounded-lg">📊</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Phiếu nhập kho
            </p>
            <p className="text-3xl font-extrabold text-blue-600">
              {totalInboundTransactions}
            </p>
          </div>
          <div className="text-2xl bg-blue-50 p-3 rounded-lg">📥</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Phiếu xuất kho
            </p>
            <p className="text-3xl font-extrabold text-rose-600">
              {totalOutboundTransactions}
            </p>
          </div>
          <div className="text-2xl bg-rose-50 p-3 rounded-lg">📤</div>
        </div>
      </div>

      {/* --- PANEL CHI TIẾT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col h-[400px]">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">
              ⚠️ Cảnh báo ngưỡng tồn kho
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sản phẩm có số lượng ít hơn 15 cái.
            </p>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                An toàn, không có hàng báo động.
              </p>
            ) : (
              lowStockProducts.map((p) => (
                <div
                  key={p._id}
                  className="p-3 bg-rose-50/40 rounded-xl border border-rose-100 flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {p.name}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">{p.sku}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-700">
                    Còn {p.quantity} cái
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 🔥 NHẬT KÝ HOẠT ĐỘNG REAL-TIME TỪ MONGODB */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 flex flex-col h-[400px]">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">
              ⏱️ Nhật ký hoạt động gần đây
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Đồng bộ trực tiếp từ các phiếu giao dịch bãi kho.
            </p>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-12">
                Chưa có hoạt động nhập xuất kho nào được thực hiện.
              </p>
            ) : (
              recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 bg-slate-50/50 rounded-xl border border-slate-200 flex justify-between items-center"
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded border ${act.badgeColor}`}
                    >
                      {act.type === "INBOUND" ? "Nhập" : "Xuất"}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {act.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        Mã phiếu: {act.id} • Thủ kho: {adminName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        act.type === "INBOUND"
                          ? "text-blue-600"
                          : "text-rose-600"
                      }`}
                    >
                      {act.type === "INBOUND" ? "+" : "-"} {act.qty} cái
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
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
