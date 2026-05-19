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
  // --- HÀM XUẤT PHIẾU KHO HÀNG CHUẨN MẪU C30 - HD (THÔNG TƯ 107) ---
  const exportToWarehouseExcel = async (
    dataListInput: any[],
    titleFile: string = "Phieu_Nhap_Kho"
  ) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Phieu_Kho");
    worksheet.views = [{ showGridLines: true }]; // Bật gridlines hiển thị cho chuẩn khung

    // Định nghĩa độ rộng các cột (A đến H)
    worksheet.columns = [
      { key: "stt", width: 8 },
      { key: "name", width: 40 },
      { key: "sku", width: 16 },
      { key: "unit", width: 12 },
      { key: "qty_req", width: 14 },
      { key: "qty_act", width: 14 },
      { key: "price", width: 14 },
      { key: "amount", width: 16 },
    ];

    // Cấu hình Font chữ chuẩn Times New Roman
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

    // --- 1. PHẦN TIÊU ĐỀ HÀNH CHÍNH PHÍA TRÊN (Dòng 1 - Dòng 11) ---
    // Góc trái: Đơn vị & Mã QHNS
    worksheet.getCell("A1").value =
      "Đơn vị:...............................................";
    worksheet.getCell("A1").font = fontMain;
    worksheet.getCell("A2").value =
      "Mã QHNS:..........................................";
    worksheet.getCell("A2").font = fontMain;

    // Góc phải: Mẫu số C30 - HD theo Thông tư 107
    worksheet.mergeCells("F1:H1");
    worksheet.getCell("F1").value = "Mẫu số C30 - HD";
    worksheet.getCell("F1").font = fontBold;
    worksheet.getCell("F1").alignment = { horizontal: "right" };

    worksheet.mergeCells("F2:H2");
    worksheet.getCell("F2").value =
      "(Ban hành kèm theo Thông tư số 107/2017/TT-BTC";
    worksheet.getCell("F2").font = fontItalic;
    worksheet.getCell("F2").alignment = { horizontal: "right" };

    worksheet.mergeCells("F3:H3");
    worksheet.getCell("F3").value = "ngày 24/11/2017)";
    worksheet.getCell("F3").font = fontItalic;
    worksheet.getCell("F3").alignment = { horizontal: "right" };

    let displayTitle = "PHIẾU TỔNG KHO"; // Mặc định nếu không rơi vào 2 trường hợp dưới
    const lowerTitle = titleFile.toLowerCase();

    if (lowerTitle.includes("nhap") || lowerTitle.includes("inbound")) {
      displayTitle = "PHIẾU NHẬP KHO";
    } else if (lowerTitle.includes("xuat") || lowerTitle.includes("outbound")) {
      displayTitle = "PHIẾU XUẤT KHO";
    }
    // Tiêu đề chính của Phiếu (Dòng 5 -> 7)
    worksheet.mergeCells("A5:H5");
    worksheet.getCell("A5").value = displayTitle;
    worksheet.getCell("A5").font = {
      name: "Times New Roman",
      size: 16,
      bold: true,
    };
    worksheet.getCell("A5").alignment = { horizontal: "center" };

    const today = new Date();
    worksheet.mergeCells("A6:H6");
    worksheet.getCell("A6").value = `Ngày ${today.getDate()} tháng ${
      today.getMonth() + 1
    } năm ${today.getFullYear()}`;
    worksheet.getCell("A6").font = fontItalic;
    worksheet.getCell("A6").alignment = { horizontal: "center" };

    worksheet.mergeCells("A7:H7");
    worksheet.getCell("A7").value = "Số: .........................";
    worksheet.getCell("A7").font = fontMain;
    worksheet.getCell("A7").alignment = { horizontal: "center" };

    // Thông tin người giao, chứng từ kèm theo (Dòng 8 -> 10)
    worksheet.mergeCells("A8:H8");
    worksheet.getCell("A8").value =
      "- Họ tên người giao:....................................................................................................................................";
    worksheet.getCell("A8").font = fontMain;

    worksheet.mergeCells("A9:H9");
    worksheet.getCell("A9").value =
      "- Theo.......................................... số........................... ngày........... tháng.......... năm........... của.....................................";
    worksheet.getCell("A9").font = fontMain;

    worksheet.mergeCells("A10:H10");
    worksheet.getCell("A10").value =
      "- Nhập tại kho:........................................................................ địa điểm......................................................................";
    worksheet.getCell("A10").font = fontMain;

    // --- 2. PHẦN ĐỊNH NGHĨA TIÊU ĐỀ BẢNG (Dòng 12 - Dòng 14) ---
    // Hàng 12 & 13: Gộp ô tạo tiêu đề cột phức tạp
    worksheet.mergeCells("A12:A13");
    worksheet.getCell("A12").value = "Số\nTT";

    worksheet.mergeCells("B12:B13");
    worksheet.getCell("B12").value = "Tên, nhãn hiệu, quy cách,\nphẩm chất";

    worksheet.mergeCells("C12:C13");
    worksheet.getCell("C12").value = "Mã\nsố";

    worksheet.mergeCells("D12:D13");
    worksheet.getCell("D12").value = "Đơn\nvị\ntính";

    worksheet.mergeCells("E12:F12");
    worksheet.getCell("E12").value = "Số lượng";
    worksheet.getCell("E13").value = "Theo\nchứng từ";
    worksheet.getCell("F13").value = "Thực\nnhập";

    worksheet.mergeCells("G12:G13");
    worksheet.getCell("G12").value = "Đơn\ngiá";

    worksheet.mergeCells("H12:H13");
    worksheet.getCell("H12").value = "Thành\ntiền";

    // Kẻ bảng border và định dạng cho tiêu đề từ hàng 12 đến 13
    for (let r = 12; r <= 13; r++) {
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

    // Hàng 14: Ký hiệu số thứ tự các cột (A, B, C, D, 1, 2, 3, 4) theo mẫu
    const headersLetters = ["A", "B", "C", "D", "1", "2", "3", "4"];
    headersLetters.forEach((letter, i) => {
      const cell = worksheet.getCell(14, i + 1);
      cell.value = letter;
      cell.font = fontMain;
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = borderThin;
    });

    // --- 3. ĐỔ DỮ LIỆU SẢN PHẨM (Bắt đầu từ Dòng 15) ---
    let currentRow = 15;
    let totalAmount = 0;

    dataListInput.forEach((item, index) => {
      const qty = Number(item.quantity || item.qty) || 0;
      const price = Number(item.price) || 150000;
      const amount = qty * price;

      totalAmount += amount;

      worksheet.getCell(`A${currentRow}`).value = index + 1;
      worksheet.getCell(`B${currentRow}`).value =
        item.name || item.productId?.name || "Sản phẩm";
      worksheet.getCell(`C${currentRow}`).value =
        item.sku || item.productId?.sku || "—";
      worksheet.getCell(`D${currentRow}`).value = item.unit || "Cái";
      worksheet.getCell(`E${currentRow}`).value = qty; // Số lượng theo chứng từ
      worksheet.getCell(`F${currentRow}`).value = qty; // Số lượng thực nhập
      worksheet.getCell(`G${currentRow}`).value = price;
      worksheet.getCell(`H${currentRow}`).value = amount;

      // Định dạng hiển thị dữ liệu từng dòng
      for (let c = 1; c <= 8; c++) {
        const cell = worksheet.getCell(currentRow, c);
        cell.font = fontMain;
        cell.border = borderThin;
        if (c === 1 || c === 3 || c === 4) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        }
        if (c === 2) {
          cell.alignment = { horizontal: "left", vertical: "middle" };
        }
        if (c >= 5) {
          cell.alignment = { horizontal: "right", vertical: "middle" };
          if (c >= 7) cell.numFmt = "#,##0"; // Format phân tách phần ngàn tiền tệ
        }
      }
      currentRow++;
    });

    // --- 4. HÀNG TỔNG CỘNG VÀ CHỮ KÝ CHÂN TRANG ---
    // Dòng tổng cộng x hàng
    worksheet.getCell(`B${currentRow}`).value = "Cộng";
    worksheet.getCell(`B${currentRow}`).font = fontBold;
    worksheet.getCell(`B${currentRow}`).alignment = { horizontal: "center" };

    // Kẻ ô gạch x chéo cho các ô mã số, đơn vị ở hàng tổng cộng
    ["C", "D", "E", "F", "G"].forEach((col) => {
      worksheet.getCell(`${col}${currentRow}`).value = "x";
      worksheet.getCell(`${col}${currentRow}`).font = fontMain;
      worksheet.getCell(`${col}${currentRow}`).alignment = {
        horizontal: "center",
      };
    });

    worksheet.getCell(`H${currentRow}`).value = totalAmount;
    worksheet.getCell(`H${currentRow}`).font = fontBold;
    worksheet.getCell(`H${currentRow}`).numFmt = "#,##0";

    // Áp border cho toàn bộ dòng Cộng
    for (let c = 1; c <= 8; c++) {
      worksheet.getCell(currentRow, c).border = borderThin;
    }

    currentRow += 1;
    // Dòng viết số tiền bằng chữ
    worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value =
      "Tổng số tiền (viết bằng chữ):..................................................................................................................................";
    worksheet.getCell(`A${currentRow}`).font = fontItalic;

    currentRow += 1;
    worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value =
      "Số chứng từ kèm theo:.........................................................................................................................................";
    worksheet.getCell(`A${currentRow}`).font = fontMain;

    // Khoảng trống trước khi ký tên và dòng ngày tháng góc phải
    currentRow += 2;
    worksheet.mergeCells(`F${currentRow}:H${currentRow}`);
    worksheet.getCell(
      `F${currentRow}`
    ).value = `Ngày ...... tháng ...... năm .......`;
    worksheet.getCell(`F${currentRow}`).font = fontItalic;
    worksheet.getCell("F" + currentRow).alignment = { horizontal: "center" };

    currentRow += 1;
    // Khối các chức danh ký nhận ban ngành
    worksheet.getCell(`A${currentRow}`).value = "Người lập";
    worksheet.getCell(`B${currentRow}`).value = "Người giao hàng";
    worksheet.getCell(`D${currentRow}`).value = "Thủ kho";
    worksheet.mergeCells(`F${currentRow}:H${currentRow}`);
    worksheet.getCell(`F${currentRow}`).value =
      "Kế toán trưởng\n(Hoặc phụ trách bộ phận có nhu cầu nhập)";

    // Định dạng in đậm cho chức danh hàng đầu
    [
      `A${currentRow}`,
      `B${currentRow}`,
      `D${currentRow}`,
      `F${currentRow}`,
    ].forEach((cellKey) => {
      const cell = worksheet.getCell(cellKey);
      cell.font = fontBold;
      cell.alignment = {
        horizontal: "center",
        vertical: "top",
        wrapText: true,
      };
    });

    currentRow += 1;
    // Dòng phụ chú "(Ký, họ tên)"
    worksheet.getCell(`A${currentRow}`).value = "(Ký, họ tên)";
    worksheet.getCell(`B${currentRow}`).value = "(Ký, họ tên)";
    worksheet.getCell(`D${currentRow}`).value = "(Ký, họ tên)";
    worksheet.mergeCells(`F${currentRow}:H${currentRow}`);
    worksheet.getCell(`F${currentRow}`).value = "(Ký, họ tên)";

    [
      `A${currentRow}`,
      `B${currentRow}`,
      `D${currentRow}`,
      `F${currentRow}`,
    ].forEach((cellKey) => {
      const cell = worksheet.getCell(cellKey);
      cell.font = fontItalic;
      cell.alignment = { horizontal: "center", vertical: "top" };
    });

    // Xuất file và kích hoạt download tự động trên client browser
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
