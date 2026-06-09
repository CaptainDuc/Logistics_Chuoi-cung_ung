"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

interface ProductQRProps {
  sku: string;
  name: string;
}

export default function ProductQR({ sku, name }: ProductQRProps) {
  const [qrSrc, setQrSrc] = useState<string>("");

  useEffect(() => {
    if (!sku) return;

    // Chuyển đổi mã SKU thành chuỗi ảnh Base64 trực tiếp bằng trình duyệt
    QRCode.toDataURL(
      sku,
      {
        width: 110,
        margin: 1,
        color: {
          dark: "#0F172A", // Màu các khối mã QR (Slate 900)
          light: "#FFFFFF", // Màu nền trắng
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

  // Trong lúc chờ sinh mã QR, hiển thị khung loading giả lập (Skeleton) để tránh vỡ khung
  if (!qrSrc) {
    return (
      <div className="w-[95px] h-[95px] bg-slate-100 animate-pulse rounded-xl border border-slate-200" />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center bg-white p-1.5 border border-slate-200 rounded-xl shadow-sm group relative">
      <img
        src={qrSrc}
        alt={`QR Code ${name}`}
        className="w-24 h-24 object-contain"
      />
      <span className="text-[10px] font-mono font-semibold text-slate-500 mt-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 select-all">
        {sku}
      </span>

      {/* Hiệu ứng hiển thị nhẹ chữ "Mã SKU" khi thủ kho rê chuột vào vùng mã QR */}
      <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[0.5px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <span className="bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow">
          QUÉT MÃ
        </span>
      </div>
    </div>
  );
}
