// src/app/dashboard/products/low-stock/page.tsx
"use client";

import React from "react";
import { useWarehouseStore } from "@/store/useWarehouseStore";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, PackageOpen } from "lucide-react";

export default function LowStockPage() {
  // Lấy dữ liệu sản phẩm và trạng thái loading từ Store giống hệt trang Dashboard
  const { products, isLoading } = useWarehouseStore();

  // Lọc ra danh sách các sản phẩm thực sự sắp hết hàng (quantity < minQuantity)
  const lowStockProducts = products.filter(
    (p) => (Number(p.quantity) || 0) < (Number(p.minQuantity) || 0),
  );

  return (
    <div
      className="page-container"
      style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}
    >
      {/* ===== HEADER VÀ ĐIỀU HƯỚNG ===== */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "28px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              color: "var(--text-muted)",
              textDecoration: "none",
              marginBottom: "8px",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-muted)")
            }
          >
            <ArrowLeft size={14} /> Quay lại Tổng quan
          </Link>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertTriangle size={24} color="#f43f5e" />
            Sản Phẩm Sắp Hết Hàng
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
              marginTop: "4px",
            }}
          >
            Danh sách các mặt hàng có số lượng tồn kho thấp hơn mức tối thiểu
            định sẵn.
          </p>
        </div>

        {/* Thống kê nhanh số lượng */}
        <div
          style={{
            padding: "10px 16px",
            background: "rgba(244,63,94,0.08)",
            border: "1px solid rgba(244,63,94,0.15)",
            borderRadius: "10px",
            fontSize: "14px",
            color: "#fb7185",
            fontWeight: 600,
          }}
        >
          Cần bổ sung: {lowStockProducts.length} mặt hàng
        </div>
      </div>

      {/* ===== DANH SÁCH SẢN PHẨM ===== */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-default)",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {isLoading ? (
          // Trạng thái chờ dữ liệu tải từ Store
          <div
            style={{
              padding: "64px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                border: "3px solid rgba(99,102,241,0.2)",
                borderTopColor: "#6366f1",
                borderRadius: "50%",
              }}
              className="spinner"
            />
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Đang đồng bộ dữ liệu kho...
            </span>
          </div>
        ) : lowStockProducts.length === 0 ? (
          // Trạng thái trống (Không có hàng sắp hết)
          <div
            style={{
              padding: "64px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              color: "var(--text-muted)",
            }}
          >
            <PackageOpen size={44} style={{ opacity: 0.4, color: "#10b981" }} />
            <span
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "var(--text-primary)",
              }}
            >
              Kho hàng an toàn!
            </span>
            <span style={{ fontSize: "13px" }}>
              Hiện tại không có sản phẩm nào ở mức báo động tồn kho.
            </span>
          </div>
        ) : (
          // Hiển thị bảng chi tiết
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "13.5px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  <th
                    style={{
                      padding: "14px 20px",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      width: "60px",
                    }}
                  >
                    STT
                  </th>
                  <th
                    style={{
                      padding: "14px 20px",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                    }}
                  >
                    Mã SKU
                  </th>
                  <th
                    style={{
                      padding: "14px 20px",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                    }}
                  >
                    Tên Sản Phẩm
                  </th>
                  <th
                    style={{
                      padding: "14px 20px",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      textAlign: "center",
                    }}
                  >
                    Tồn Hiện Tại
                  </th>
                  <th
                    style={{
                      padding: "14px 20px",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      textAlign: "center",
                    }}
                  >
                    Mức Tối Thiểu
                  </th>
                  <th
                    style={{
                      padding: "14px 20px",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                    }}
                  >
                    Vị Trí Kho
                  </th>
                </tr>
              </thead>
              <tbody style={{ color: "var(--text-primary)" }}>
                {lowStockProducts.map((product, idx) => (
                  <tr
                    key={product.sku || idx}
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.01)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td
                      style={{
                        padding: "14px 20px",
                        color: "var(--text-muted)",
                      }}
                    >
                      {idx + 1}
                    </td>
                    <td
                      style={{
                        padding: "14px 20px",
                        fontFamily: "monospace",
                        color: "#f59e0b",
                        fontWeight: 600,
                      }}
                    >
                      {product.sku}
                    </td>
                    <td style={{ padding: "14px 20px", fontWeight: 600 }}>
                      {product.name}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "center" }}>
                      <span
                        style={{
                          background: "rgba(244,63,94,0.12)",
                          color: "#f43f5e",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontWeight: 700,
                          fontSize: "13px",
                        }}
                      >
                        {product.quantity}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "14px 20px",
                        textAlign: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      {product.minQuantity}
                    </td>
                    <td
                      style={{
                        padding: "14px 20px",
                        color: "var(--text-muted)",
                      }}
                    >
                      {product.location || "---"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
