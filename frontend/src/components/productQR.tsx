"use client";

import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";

interface ProductQRProps {
  sku: string;
  name: string;
}

export default function ProductQR({ sku, name }: ProductQRProps) {
  const [qrSrc, setQrSrc] = useState<string>("");
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sku) return;

    QRCode.toDataURL(
      sku,
      {
        width: 110,
        margin: 1,
        color: {
          dark: "#0F172A",
          light: "#FFFFFF",
        },
      },
      (err, url) => {
        if (err) {
          console.error("Lỗi sinh mã QR cho sản phẩm:", err);
          return;
        }
        setQrSrc(url);
      }
    );
  }, [sku]);

  if (!qrSrc) {
    return (
      <div
        style={{
          width: 95,
          height: 95,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 12,
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        padding: 6,
        borderRadius: 12,
        border: "1px solid var(--border-subtle)",
        position: "relative",
        cursor: "default",
        transform: hovered ? "scale(1.04)" : "scale(1)",
        boxShadow: hovered
          ? "0 8px 24px rgba(0,0,0,0.4)"
          : "0 2px 8px rgba(0,0,0,0.15)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <img
        src={qrSrc}
        alt={`QR Code ${name}`}
        style={{
          width: 96,
          height: 96,
          objectFit: "contain",
          display: "block",
        }}
      />
      <span
        style={{
          fontSize: 9,
          fontFamily: "monospace",
          fontWeight: 600,
          color: "#64748b",
          marginTop: 4,
          background: "#f8fafc",
          padding: "1px 5px",
          borderRadius: 4,
          border: "1px solid #e2e8f0",
          userSelect: "all",
          letterSpacing: "0.02em",
        }}
      >
        {sku}
      </span>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(15,23,42,0.82)",
          backdropFilter: "blur(2px)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
      >
        <span
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff",
            fontSize: 9,
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: 6,
            letterSpacing: "0.05em",
            boxShadow: "0 2px 8px rgba(99,102,241,0.5)",
          }}
        >
          QUÉT MÃ
        </span>
      </div>
    </div>
  );
}
