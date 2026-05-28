import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "LogiChain - Quản lý kho và quét QR",
  description: "Giao diện quản lý kho và quét QR chuyên nghiệp dành cho nhân viên logistics.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
