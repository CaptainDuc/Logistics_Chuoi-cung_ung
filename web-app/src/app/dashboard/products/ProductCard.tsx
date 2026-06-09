"use client";

import React from "react";
import {
  AlertTriangle,
  CheckCircle,
  Hash,
  MapPin,
  Package,
  Trash2,
} from "lucide-react";
import ProductQR from "@/components/productQR";

export type ProductCardProps = {
  product: {
    _id: string;
    name: string;
    sku: string;
    location?: string;
    quantity: number;
    minQuantity: number;
  };
  isAdmin: boolean;
  onRequestDelete: (id: string, name: string) => void;
  index?: number;
};

export default function ProductCard({
  product,
  isAdmin,
  onRequestDelete,
  index = 0,
}: ProductCardProps) {
  const isLowStock = product.quantity < product.minQuantity;

  const stockRatio =
    product.minQuantity > 0
      ? Math.min(product.quantity / (product.minQuantity * 3), 1)
      : 1;

  const barColor = isLowStock
    ? "linear-gradient(90deg, #f43f5e, #fb7185)"
    : stockRatio > 0.6
    ? "linear-gradient(90deg, #059669, #10b981)"
    : "linear-gradient(90deg, #d97706, #f59e0b)";

  return (
    <div
      className={`product-card animate-fade-up ${
        isLowStock ? "low-stock" : ""
      }`}
      style={{ animationDelay: `${(index % 12) * 40}ms` }}
    >
      {/* Background glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -1,
          pointerEvents: "none",
          background: isLowStock
            ? "radial-gradient(600px 120px at 18% 0%, rgba(244,63,94,0.22), transparent 55%), radial-gradient(400px 140px at 100% 18%, rgba(99,102,241,0.12), transparent 60%)"
            : "radial-gradient(600px 120px at 18% 0%, rgba(99,102,241,0.20), transparent 55%), radial-gradient(400px 140px at 100% 18%, rgba(16,185,129,0.10), transparent 60%)",
          opacity: 0.9,
        }}
      />

      {/* Card header */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 11,
            background: isLowStock
              ? "rgba(244,63,94,0.12)"
              : "rgba(99,102,241,0.12)",
            border: isLowStock
              ? "1px solid rgba(244,63,94,0.2)"
              : "1px solid rgba(99,102,241,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Package size={18} color={isLowStock ? "#fb7185" : "#818cf8"} />
        </div>

        {/* Badges + Delete */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {isLowStock ? (
            <span className="badge badge-danger">
              <AlertTriangle size={9} />
              Cần nhập
            </span>
          ) : (
            <span className="badge badge-success">
              <CheckCircle size={9} />
              Đủ hàng
            </span>
          )}

          {isAdmin && (
            <button
              className="btn btn-icon btn-ghost"
              style={{
                color: "var(--text-muted)",
                width: 30,
                height: 30,
                borderRadius: 7,
              }}
              onClick={() => onRequestDelete(product._id, product.name)}
              title="Xóa sản phẩm"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <h3
          style={{
            fontSize: 14.5,
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: 10,
            lineHeight: 1.35,
          }}
        >
          {product.name}
        </h3>

        <div style={{ display: "grid", gap: 8 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            <MapPin size={11} />
            <span>
              {product.location || (
                <span style={{ fontStyle: "italic" }}>Chưa xếp kệ</span>
              )}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            <Hash size={11} />
            <span
              style={{
                fontFamily: "monospace",
                color: "var(--text-secondary)",
                fontSize: 11.5,
                background: "rgba(255,255,255,0.04)",
                padding: "1px 6px",
                borderRadius: 4,
                border: "1px solid var(--border-subtle)",
                maxWidth: 170,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {product.sku}
            </span>
          </div>
        </div>

        {/* Stock */}
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
              }}
            >
              Tồn kho
            </span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Min: {product.minQuantity}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 6,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.04em",
                color: isLowStock ? "#fb7185" : "var(--text-primary)",
                lineHeight: 1,
              }}
            >
              {product.quantity.toLocaleString()}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-muted)",
              }}
            >
              cái
            </div>
          </div>

          <div className="stock-bar-track">
            <div
              className="stock-bar-fill"
              style={{
                width: `${stockRatio * 100}%`,
                background: barColor,
              }}
            />
          </div>
        </div>

        <div
          style={{
            paddingTop: 14,
            marginTop: 16,
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <ProductQR sku={product.sku} name={product.name} />
        </div>
      </div>
    </div>
  );
}
