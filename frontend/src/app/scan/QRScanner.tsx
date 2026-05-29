"use client";

import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

type Props = {
  onScan?: (value: string) => void;
};

export default function QRScanner({ onScan }: Props) {
  const lastScan = useRef("");

  useEffect(() => {
    // 🔥 BƯỚC KIỂM TRA CHỐNG LỖI NULL: 
    // Nếu chưa tìm thấy thẻ html có id="reader" trên màn hình thì dừng lại ngay, không cho khởi tạo camera.
    const element = document.getElementById("reader");
    if (!element) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 20, 
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [0] // Chỉ quét qua camera stream trực tiếp
      },
      false
    );

    // Thêm một chút độ trễ nhỏ (Timeout) để đảm bảo DOM của Next.js hoàn toàn sẵn sàng
    const delayTimer = setTimeout(() => {
      // Kiểm tra lại một lần nữa trước khi render thực tế
      if (!document.getElementById("reader")) return;

      scanner.render(
        (decodedText: string) => {
          if (decodedText === lastScan.current) return;
          lastScan.current = decodedText;
          onScan?.(decodedText);

          setTimeout(() => {
            if (lastScan.current === decodedText) lastScan.current = "";
          }, 3000);
        },
        (errorMessage) => {
          // Tắt log lỗi vặt để tránh thắt nút cổ chai hiệu năng
        }
      );
    }, 100);

    // Hàm dọn dẹp bộ nhớ khi tắt trang
    return () => {
      clearTimeout(delayTimer);
      scanner.clear().catch((err) => console.error("Lỗi đóng camera:", err));
    };
  }, [onScan]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-slate-950/90 border border-cyan-500/20 min-h-[300px] flex flex-col justify-center">
      
      {/* HUD Giao diện chỉ báo quét */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center bg-[linear-gradient(rgba(18,24,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.1)_1px,transparent_1px)] bg-[size:20px_20px]">
        <div className="relative w-[250px] h-[250px]">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-lg"></div>
          <div className="w-full h-1 bg-cyan-400/50 shadow-[0_0_15px_#22d3ee] absolute top-0 animate-[laserMove_2s_linear_infinite]"></div>
        </div>
      </div>

      {/* 🔥 THẺ THẦN THÁNH: Id="reader" bắt buộc phải nằm ở đây */}
      <div id="reader" className="w-full z-0 [&_video]:object-cover [&_video]:min-h-[300px] [&_video]:w-full [&_video]:rounded-2xl [&_button]:bg-cyan-500 [&_button]:text-black [&_button]:px-4 [&_button]:py-2 [&_button]:rounded-lg [&_button]:text-xs [&_button]:font-bold [&_a]:hidden" />

      <style jsx global>{`
        @keyframes laserMove {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );
}