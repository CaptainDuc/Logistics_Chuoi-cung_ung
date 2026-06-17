// src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useWarehouseStore } from "@/store/useWarehouseStore";
import { useAdminStore } from "@/store/useAdminStore";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Link from "next/link";

import {
  Package,
  PackageCheck,
  PackageMinus,
  Layers,
  TrendingUp,
  TrendingDown,
  FileBarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  X,
  User,
  MapPin,
  QrCode,
  FileText,
  Building2,
} from "lucide-react";

export default function DashboardPage() {
  const {
    products,
    transactions,
    fetchProducts,
    fetchTransactions,
    isLoading,
  } = useWarehouseStore();
  const { adminName } = useAdminStore();

  // State quản lý đóng/mở và lưu trữ thông tin log đang chọn xem chi tiết
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  // SỬA TẠI ĐÂY: Thay đổi mảng phụ thuộc thành [] để chặn vòng lặp vô hạn gây log liên tục
  useEffect(() => {
    fetchProducts();
    fetchTransactions();
  }, []);

  const totalProductTypes = products.length;
  const totalItemsInStock = products.reduce(
    (sum, p) => sum + (Number(p.quantity) || 0),
    0,
  );

  const inboundTickets = transactions.filter((t) => t.type === "Import");
  const outboundTickets = transactions.filter((t) => t.type === "Export");

  const totalInboundItems = inboundTickets.reduce(
    (sum, t) => sum + (Number(t.quantity) || 0),
    0,
  );
  const totalOutboundItems = outboundTickets.reduce(
    (sum, t) => sum + (Number(t.quantity) || 0),
    0,
  );

  const lowStockCount = products.filter(
    (p) => p.quantity < p.minQuantity,
  ).length;

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
    subTitleCell.value = `Người lập báo cáo: ${adminName}  |  Ngày xuất bản: ${new Date().toLocaleDateString("vi-VN")}`;
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
      row.getCell(5).numFmt = "#,##0";
      row.getCell(6).alignment = { horizontal: "center" };
      row.getCell(6).numFmt = "#,##0";
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
    totalRow.getCell(5).numFmt = "#,##0";

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
      `Bao_Cao_Kho_Hang_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const statCards = [
    {
      label: "Danh mục sản phẩm",
      value: isLoading ? "—" : `${totalProductTypes}`,
      unit: "loại",
      icon: Package,
      color: "indigo",
      iconBg: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      change: null,
    },
    {
      label: "Tổng tồn kho",
      value: isLoading ? "—" : `${totalItemsInStock.toLocaleString()}`,
      unit: "cái",
      icon: Layers,
      color: "emerald",
      iconBg: "linear-gradient(135deg, #059669, #10b981)",
      change: null,
    },
    {
      label: "Tổng đã nhập",
      value: isLoading ? "—" : `${totalInboundItems.toLocaleString()}`,
      unit: "cái",
      icon: PackageCheck,
      color: "amber",
      iconBg: "linear-gradient(135deg, #d97706, #f59e0b)",
      change: (
        <>
          <TrendingUp size={12} /> Nhập kho
        </>
      ),
    },
    {
      label: "Tổng đã xuất",
      value: isLoading ? "—" : `${totalOutboundItems.toLocaleString()}`,
      unit: "cái",
      icon: PackageMinus,
      color: "rose",
      iconBg: "linear-gradient(135deg, #e11d48, #f43f5e)",
      change: (
        <>
          <TrendingDown size={12} /> Xuất kho
        </>
      ),
    },
  ];

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="page-container" style={{ position: "relative" }}>
      {/* ===== PAGE HEADER ===== */}
      <div
        style={{
          marginBottom: 28,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.25)",
                borderRadius: 999,
                fontSize: 12,
                color: "#818cf8",
                fontWeight: 600,
              }}
            >
              <Sparkles size={12} />
              Xin chào, {adminName || "Thủ kho"}!
            </div>
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
            }}
          >
            Bảng Điều Khiển Kho Hàng
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              marginTop: 6,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Clock size={13} />
            {today}
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleExportExcel}
          disabled={isLoading || products.length === 0}
        >
          <FileBarChart2 size={15} /> Xuất Báo Cáo Excel
        </button>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div
        className="stagger-children"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`stat-card ${card.color} animate-fade-up`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: card.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                  }}
                >
                  <Icon size={20} color="#fff" />
                </div>
                {card.change && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      padding: "3px 8px",
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: 999,
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {card.change}
                  </div>
                )}
              </div>

              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    marginBottom: 6,
                  }}
                >
                  {card.label}
                </div>
                <div
                  style={{ display: "flex", alignItems: "baseline", gap: 6 }}
                >
                  <span
                    style={{
                      fontSize: 32,
                      fontWeight: 800,
                      color: "var(--text-primary)",
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                    }}
                  >
                    {card.value}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--text-muted)",
                    }}
                  >
                    {card.unit}
                  </span>
                </div>
              </div>

              {card.color === "emerald" && lowStockCount > 0 && (
                <Link
                  href="/dashboard/products/low-stock"
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <div
                    style={{
                      marginTop: 14,
                      padding: "6px 10px",
                      background: "rgba(244,63,94,0.1)",
                      border: "1px solid rgba(244,63,94,0.2)",
                      borderRadius: 8,
                      fontSize: 11.5,
                      color: "#fb7185",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(244,63,94,0.18)";
                      e.currentTarget.style.borderColor =
                        "rgba(244,63,94,0.35)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(244,63,94,0.1)";
                      e.currentTarget.style.borderColor = "rgba(244,63,94,0.2)";
                    }}
                  >
                    ⚠️ {lowStockCount} sản phẩm sắp hết hàng
                  </div>
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* ===== ACTIVITY FEED ===== */}
      <div
        className="animate-fade-up"
        style={{
          animationDelay: "280ms",
          background: "var(--bg-card)",
          border: "1px solid var(--border-default)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock size={15} color="#818cf8" />
            </div>
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                Lịch sử biến động kho
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {transactions.length} giao dịch gần nhất
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        <div
          style={{
            padding: "16px",
            maxHeight: 460,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {isLoading ? (
            <div className="empty-state" style={{ padding: 48 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  border: "3px solid rgba(99,102,241,0.2)",
                  borderTopColor: "#6366f1",
                  borderRadius: "50%",
                }}
                className="spinner"
              />
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Đang tải dữ liệu...
              </span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <Package size={40} style={{ opacity: 0.3 }} />
              <span style={{ fontSize: 13 }}>Chưa có giao dịch nào.</span>
            </div>
          ) : (
            transactions.map((act, idx) => {
              const isImport = act.type === "Import";
              return (
                <div
                  key={act._id}
                  className="activity-item animate-fade-up"
                  style={{
                    animationDelay: `${idx * 30}ms`,
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onClick={() => setSelectedTx(act)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.02)";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.transform = "translateX(0px)";
                  }}
                >
                  {/* Type icon */}
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: isImport
                        ? "rgba(245,158,11,0.12)"
                        : "rgba(244,63,94,0.12)",
                      border: isImport
                        ? "1px solid rgba(245,158,11,0.25)"
                        : "1px solid rgba(244,63,94,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {isImport ? (
                      <ArrowDownRight size={16} color="#f59e0b" />
                    ) : (
                      <ArrowUpRight size={16} color="#f43f5e" />
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {act.name}
                      </span>
                      <span
                        className={`badge ${isImport ? "badge-warning" : "badge-danger"}`}
                      >
                        {isImport ? "Nhập" : "Xuất"}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "var(--text-muted)",
                        marginTop: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Mã phiếu: {act._id}
                    </div>
                  </div>

                  {/* Amount + date */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: isImport ? "#f59e0b" : "#f43f5e",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {isImport ? "+" : "-"} {act.quantity} cái
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        marginTop: 2,
                      }}
                    >
                      {act.date.split(" ")[1] || act.date}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ===== POP-UP MODAL XEM CHI TIẾT ===== */}
      {selectedTx && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
            animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setSelectedTx(null)}
        >
          <div
            style={{
              backgroundColor: "#11131e",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 20,
              width: "100%",
              maxWidth: 500,
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              overflow: "hidden",
              animation: "scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background:
                  selectedTx.type === "Import"
                    ? "linear-gradient(to right, rgba(245,158,11,0.05), transparent)"
                    : "linear-gradient(to right, rgba(244,63,94,0.05), transparent)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flex: 1,
                }}
              >
                <FileText
                  size={18}
                  color={selectedTx.type === "Import" ? "#f59e0b" : "#f43f5e"}
                />
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#fff",
                    margin: 0,
                  }}
                >
                  Chi Tiết Phiếu{" "}
                  {selectedTx.type === "Import" ? "Nhập Kho" : "Xuất Kho"}
                </h3>
              </div>
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  padding: 4,
                }}
                onClick={() => setSelectedTx(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  paddingBottom: 14,
                  borderBottom: "1px dashed rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 6,
                  }}
                >
                  {selectedTx.name}
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: selectedTx.type === "Import" ? "#f59e0b" : "#f43f5e",
                  }}
                >
                  {selectedTx.type === "Import" ? "+" : "-"}{" "}
                  {selectedTx.quantity}{" "}
                  <span
                    style={{ fontSize: 14, fontWeight: 400, color: "#9ca3af" }}
                  >
                    sản phẩm
                  </span>
                </div>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 13, color: "#9ca3af" }}>
                    Mã chứng từ:
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#e5e7eb",
                      fontFamily: "monospace",
                    }}
                  >
                    {selectedTx._id}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: "#9ca3af",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <QrCode size={14} /> Mã SKU:
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#818cf8",
                      background: "rgba(99,102,241,0.1)",
                      padding: "2px 8px",
                      borderRadius: 4,
                    }}
                  >
                    {selectedTx.sku}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: "#9ca3af",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <MapPin size={14} /> Vị trí lưu kho:
                  </span>
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: "#e5e7eb" }}
                  >
                    {selectedTx.location}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: "#9ca3af",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Clock size={14} /> Thời gian thực hiện:
                  </span>
                  <span style={{ fontSize: 13, color: "#e5e7eb" }}>
                    {selectedTx.date}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: "#9ca3af",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Building2 size={14} /> Nhà cung cấp:
                  </span>
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: "#e5e7eb" }}
                  >
                    {/* Truy cập qua đường dẫn đã populate */}
                    {selectedTx.supplierName}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 6,
                    paddingTop: 12,
                    borderTop: "1px dashed rgba(255,255,255,0.06)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: "#9ca3af",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <User size={14} /> Người xử lý:
                  </span>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}
                    >
                      {selectedTx.executor?.username || "Ẩn danh"}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#818cf8",
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      {selectedTx.executor?.role || "User"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                display: "flex",
                justifyContent: "flex-end",
                backgroundColor: "rgba(0,0,0,0.15)",
              }}
            >
              <button
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.1)",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onClick={() => setSelectedTx(null)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.03)")
                }
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thẻ CSS an toàn không lỗi render */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `,
        }}
      />
    </div>
  );
}
