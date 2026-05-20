// src/app/dashboard/page.tsx
"use client";

import React, { useEffect } from "react";
import { useWarehouseStore } from "@/store/useWarehouseStore";
import { useAdminStore } from "@/store/useAdminStore";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function DashboardPage() {
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
    fetchTransactions();
  }, [fetchProducts, fetchTransactions]);

  const totalProductTypes = products.length;
  const totalItemsInStock = products.reduce(
    (sum, p) => sum + (Number(p.quantity) || 0),
    0
  );

  const inboundTickets = transactions.filter((t) => t.type === "Import");
  const outboundTickets = transactions.filter((t) => t.type === "Export");

  const totalInboundItems = inboundTickets.reduce(
    (sum, t) => sum + (Number(t.quantity) || 0),
    0
  );
  const totalOutboundItems = outboundTickets.reduce(
    (sum, t) => sum + (Number(t.quantity) || 0),
    0
  );

  const handleExportExcel = async () => {
    if (products.length === 0) {
      alert("Không có dữ liệu sản phẩm để xuất báo cáo!");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Báo Cáo Kho Hàng");

    worksheet.mergeCells("A1:G1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "BÁO CÁO THỐNG KÊ KHO HÀNG ĐỊNH KỲ";
    titleCell.font = {
      name: "Arial",
      size: 16,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E3A8A" },
    };
    worksheet.getRow(1).height = 40;

    worksheet.mergeCells("A2:G2");
    const subTitleCell = worksheet.getCell("A2");
    subTitleCell.value = `Người lập báo cáo: ${adminName}  |  Ngày xuất bản: ${new Date().toLocaleDateString(
      "vi-VN"
    )}`;
    subTitleCell.font = { name: "Arial", size: 11, italic: true };
    subTitleCell.alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getRow(2).height = 25;

    worksheet.addRow([]);

    const headerRow = worksheet.addRow([
      "STT",
      "Mã SKU",
      "Tên Sản Phẩm",
      "Số Lượng",
      "Tồn Tối Thiểu",
      "Vị Trí",
      "Trạng Thái Tồn Kho",
    ]);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF3B82F6" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "medium" },
        right: { style: "thin" },
      };
    });

    products.forEach((product, index) => {
      const row = worksheet.addRow([
        index + 1,
        product.sku,
        product.name,
        Number(product.quantity),
        Number(product.minQuantity),
        product.location || "---",
        product.trangThaiTonKho || "Không xác định",
      ]);

      row.height = 22;
      row.getCell(1).alignment = { horizontal: "center" };
      row.getCell(2).alignment = { horizontal: "center" };
      row.getCell(4).alignment = { horizontal: "center" };
      row.getCell(5).alignment = { horizontal: "center" };
      row.getCell(5).numFmt = "#,##0"; // ✨ ĐÃ SỬA: Dùng numFmt thay cho numberFormat cũ bị lỗi
      row.getCell(6).alignment = { horizontal: "center" };
      row.getCell(6).numFmt = "#,##0"; // ✨ ĐÃ SỬA: Dùng numFmt thay cho numberFormat cũ bị lỗi
      row.getCell(7).alignment = { horizontal: "center" };

      row.eachCell((cell) => {
        cell.font = { name: "Arial", size: 10 };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
      });
    });

    worksheet.addRow([]);
    const totalRow = worksheet.addRow([
      "TỔNG CỘNG",
      "",
      "",
      "",
      totalItemsInStock,
      "",
      "",
    ]);
    worksheet.mergeCells(`A${totalRow.number}:D${totalRow.number}`);
    totalRow.getCell(1).font = { name: "Arial", size: 11, bold: true };
    totalRow.getCell(5).font = { name: "Arial", size: 11, bold: true };
    totalRow.getCell(5).numFmt = "#,##0"; // ✨ ĐÃ SỬA: Dùng numFmt chuẩn cấu trúc thư viện

    worksheet.columns.forEach((column) => {
      let maxLength = 10;
      column.eachCell?.({ includeEmpty: false }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 0;
        if (columnLength > maxLength) maxLength = columnLength;
      });
      column.width = maxLength < 12 ? 12 : maxLength + 4;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(
      blob,
      `Bao_Cao_Kho_Hang_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Hệ Thống Quản Lý Kho Hàng
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Xin chào thủ kho:{" "}
              <span className="font-semibold text-blue-600">{adminName}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Danh mục sản phẩm
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {isLoading ? "..." : `${totalProductTypes} loại`}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng Sản Phẩm Tồn Kho
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {isLoading ? "..." : `${totalItemsInStock} cái`}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng Sản Phẩm Đã Nhập
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {isLoading ? "..." : `+ ${totalInboundItems} cái`}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng Sản Phẩm Đã Xuất
            </p>
            <p className="text-2xl font-bold text-rose-600 mt-1">
              {isLoading ? "..." : `- ${totalOutboundItems} cái`}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Lịch Sử Biến Động Kho Hàng Gần Recent
            </h2>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
            {isLoading ? (
              <div className="text-center py-8 text-sm text-slate-400">
                Đang tải dữ liệu...
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400 italic">
                Chưa có giao dịch nào.
              </div>
            ) : (
              transactions.map((act) => (
                <div
                  key={act._id}
                  className="p-3 bg-slate-50/50 rounded-xl border border-slate-200 flex justify-between items-center"
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded border ${act.badgeColor}`}
                    >
                      {act.type === "Import" ? "Nhập" : "Xuất"}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {act.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        Mã phiếu: {act._id} • Thủ kho: {adminName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        act.type === "Import"
                          ? "text-blue-600"
                          : "text-rose-600"
                      }`}
                    >
                      {act.type === "Import" ? "+" : "-"} {act.quantity} cái
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
