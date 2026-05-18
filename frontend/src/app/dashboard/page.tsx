"use client";

import React, { useEffect } from "react";
import { useWarehouseStore } from "@/store/useWarehouseStore";
import { Download } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Hàm giả định để lấy thông tin handler (Người thực hiện)
const useAdminStore = () => ({ adminName: "Trần Minh Đức" });

export default function DashboardPage() {
  // Gọi các dữ liệu từ Zustand store đã xử lý xong id (string | number)
  const {
    products,
    inboundTickets,
    outboundTickets,
    isLoading,
    initializeData,
  } = useWarehouseStore();

  const { adminName } = useAdminStore();

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // --- LOGIC TÍNH TOÁN SỐ LIỆU THỐNG KÊ ---
  const totalProductTypes = products.length;
  const totalItemsInStock = products.reduce(
    (sum, p) => sum + (Number(p.qty) || 0),
    0
  );
  const totalInboundTransactions = inboundTickets.length;
  const totalOutboundTransactions = outboundTickets.length;
  const lowStockProducts = products.filter((p) => (Number(p.qty) || 0) < 15);

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
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  // --- HÀM XUẤT PHIẾU KHO HÀNG: ẨN GRIDLINES - ĐÚNG TIÊU ĐỀ YÊU CẦU ---
  const exportToWarehouseExcel = async (dataListInput: any[]) => {
    const workbook = new ExcelJS.Workbook();
    // Đổi tên Sheet thành Phieu_Kho_Hang
    const worksheet = workbook.addWorksheet("Phieu_Kho_Hang");

    // Ẩn toàn bộ sọc lưới sọc dọc ngang mặc định xung quanh bảng Excel
    worksheet.views = [{ showGridLines: false }];

    // Cấu hình độ rộng cột chống lỗi tràn ô kỹ thuật (####)
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

    // 1. Khối thông tin hành chính
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

    // 2. Tiêu đề trung tâm đã sửa thành: PHIẾU KHO HÀNG
    worksheet.getCell("D5").value = "PHIẾU KHO HÀNG";
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

    // 3. Thông tin người vận hành lệnh bãi kho
    worksheet.getCell(
      "A9"
    ).value = `– Họ và tên người nhận hàng: ....................................................................................................`;
    worksheet.getCell("A9").font = fontMain;
    worksheet.getCell(
      "A10"
    ).value = `– Lý do xuất kho hàng: .................................................................................................................................`;
    worksheet.getCell("A10").font = fontMain;
    worksheet.getCell(
      "A11"
    ).value = `– Xuất tại kho (ngăn lô): ............................................................. Địa điểm: ..........................................`;
    worksheet.getCell("A11").font = fontMain;

    // 4. Tiêu đề cấu trúc bảng (Hàng 13 & 14)
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

    const subHeaders = ["A", "B", "C", "D", "1", "2", "3", "4"];
    subHeaders.forEach((val, idx) => {
      const cell = worksheet.getCell(15, idx + 1);
      cell.value = val;
      cell.font = fontItalic;
      cell.alignment = { horizontal: "center" };
      cell.border = borderThin;
    });

    // 5. Vòng lặp đổ dữ liệu vật tư thực tế
    let currentRow = 16;
    let totalQtyReq = 0;
    let totalQtyAct = 0;
    let totalAmount = 0;

    const dataList = dataListInput.length > 0 ? dataListInput : products;

    dataList.forEach((item, index) => {
      const qty = Number(item.qty) || 0;
      const price = Number(item.price) || 150000;
      const amount = qty * price;

      totalQtyReq += qty;
      totalQtyAct += qty;
      totalAmount += amount;

      worksheet.getCell(`A${currentRow}`).value = index + 1;
      worksheet.getCell(`B${currentRow}`).value =
        item.name || "Sản phẩm chưa rõ tên";
      worksheet.getCell(`C${currentRow}`).value =
        (item.sku || item.productSku || item.id || "").toString() || "—";
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

    // 6. Dòng tổng kết bảng
    worksheet.getCell(`B${currentRow}`).value = "Cộng";
    worksheet.getCell(`C${currentRow}`).value = "x";
    worksheet.getCell(`D${currentRow}`).value = "x";
    worksheet.getCell(`E${currentRow}`).value = totalQtyReq;
    worksheet.getCell(`F${currentRow}`).value = totalQtyAct;
    worksheet.getCell(`G${currentRow}`).value = "x";
    worksheet.getCell(`H${currentRow}`).value = totalAmount;

    for (let c = 1; c <= 8; c++) {
      const cell = worksheet.getCell(currentRow, c);
      cell.font = fontBold;
      cell.border = borderThin;
      if (c === 2 || c === 3 || c === 4 || c === 7)
        cell.alignment = { horizontal: "center" };
      if (c === 5 || c === 6 || c === 8) {
        cell.alignment = { horizontal: "right" };
        if (c === 8) cell.numFmt = "#,##0";
      }
    }

    // 7. Ghi chú và khối chữ ký cuối văn bản (Không có khung viền ô)
    currentRow += 2;
    worksheet.getCell(`A${currentRow}`).value =
      "– Tổng số tiền (viết bằng chữ): ......................................................................................................................................";
    worksheet.getCell(`A${currentRow}`).font = fontItalic;

    currentRow++;
    worksheet.getCell(`A${currentRow}`).value =
      "– Số chứng từ gốc kèm theo: ........................................................................................................................................";
    worksheet.getCell(`A${currentRow}`).font = fontMain;

    currentRow += 3;
    worksheet.getCell(`G${currentRow}`).value =
      "Ngày ..... tháng ..... năm ......";
    worksheet.getCell(`G${currentRow}`).font = fontItalic;
    worksheet.getCell(`G${currentRow}`).alignment = { horizontal: "center" };

    currentRow++;
    const roles = [
      { title: "Người lập phiếu", sub: "(Ký, họ tên)", col: 1 },
      { title: "Người nhận hàng", sub: "(Ký, họ tên)", col: 2 },
      { title: "Thủ kho", sub: "(Ký, họ tên)", col: 4 },
      { title: "Kế toán trưởng", sub: "(Ký, họ tên)", col: 6 },
      { title: "Giám đốc", sub: "(Ký, họ tên)", col: 8 },
    ];

    roles.forEach((role) => {
      const titleCell = worksheet.getCell(currentRow, role.col);
      titleCell.value = role.title;
      titleCell.font = fontBold;
      titleCell.alignment = { horizontal: "center" };

      const subCell = worksheet.getCell(currentRow + 1, role.col);
      subCell.value = role.sub;
      subCell.font = fontItalic;
      subCell.alignment = { horizontal: "center" };
    });

    // Xuất buffer và đặt tên file tải về chuẩn chỉnh: Phieu_Kho_Hang_yyyy-mm-dd.xlsx
    const buffer = await workbook.xlsx.writeBuffer();
    const fileBlob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(fileBlob, `Phieu_Kho_Hang_${today.toISOString().slice(0, 10)}.xlsx`);
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
      {/* KHỐI TIÊU ĐỀ DASHBOARD VÀ CÁC NÚT TẢI CHỨNG TỪ */}
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
          {/* Nút bấm giao diện đã được đổi tên thành Xuất phiếu kho hàng */}
          <button
            onClick={() => exportToWarehouseExcel(products)}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Xuất phiếu kho
            hàng
          </button>
          <button
            onClick={() => exportToWarehouseExcel(inboundTickets)}
            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" /> Xuất phiếu nhập
            kho
          </button>
          <button
            onClick={() => exportToWarehouseExcel(outboundTickets)}
            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-rose-600" /> Xuất phiếu xuất
            kho
          </button>
        </div>
      </div>

      {/* THẺ THỐNG KÊ TRÊN DASHBOARD */}
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

      {/* BẢNG CẢNH BÁO VÀ NHẬT KÝ */}
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
                  key={p.id}
                  className="p-3 bg-rose-50/40 rounded-xl border border-rose-100 flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {p.name}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      {p.sku || p.id}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-700">
                    Còn {p.qty} cái
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 flex flex-col h-[400px]">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">
              ⏱️ Nhật ký hoạt động gần đây
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3">
            {recentActivities.map((act) => (
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
                      {act.name || "Chứng từ bãi kho"}
                    </p>
                    <p className="text-xs text-slate-400">
                      Mã phiếu: {act.id} • Người thực hiện: {adminName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${
                      act.type === "INBOUND" ? "text-blue-600" : "text-rose-600"
                    }`}
                  >
                    {act.type === "INBOUND" ? "+" : "-"}
                    {act.qty || 0} cái
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {act.date || "Vừa xong"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
