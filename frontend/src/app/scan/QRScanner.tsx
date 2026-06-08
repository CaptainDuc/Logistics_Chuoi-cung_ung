"use client";

import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

type Props = {
  onScan?: (value: string) => void;
};

export default function QRScanner({ onScan }: Props) {
  const lastScan = useRef("");

  useEffect(() => {
    // 1. Kiểm tra phần tử DOM
    const element = document.getElementById("reader");
    if (!element) return;

    // 2. Khởi tạo scanner với cấu hình an toàn, không bị crash lỗi text
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 20, 
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        // Ép điện thoại chọn camera sau (environment) làm mặc định
        videoConstraints: {
          facingMode: "environment"
        }
      },
      /* verbose= */ false
    );

    // Thêm mẹo chống crash bằng cách override (ghi đè) trực tiếp hàm lỗi của thư viện
    // Khi thư viện định viết chữ gây lỗi, dòng này sẽ bắt nó "im lặng" hoàn toàn
    (scanner as any).setHeaderMessage = () => {};

    const delayTimer = setTimeout(() => {
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
          // Tắt log lỗi vặt
        }
      );
    }, 150);

    // Hàm dọn dẹp bộ nhớ
    return () => {
      clearTimeout(delayTimer);
      // Ghi đè hàm đóng để tránh lỗi bất đồng bộ của Next.js
      try {
        scanner.clear().catch((err) => console.log("Đã đóng camera thành công."));
      } catch (e) {}
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

      {/* THẺ HIỂN THỊ CAMERA - Đã bổ sung CSS ẩn sạch chữ thừa của thư viện */}
      <div 
        id="reader" 
        className="w-full z-0 [&_video]:object-cover [&_video]:min-h-[300px] [&_video]:w-full [&_video]:rounded-2xl [&_button]:bg-cyan-500 [&_button]:text-black [&_button]:px-4 [&_button]:py-2 [&_button]:rounded-lg [&_button]:text-xs [&_button]:font-bold [&_a]:hidden [&_span]:hidden [&_div]:border-none" 
      />

      <style jsx global>{`
        @keyframes laserMove {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        /* Ép ẩn các ID sinh lỗi chữ */
        #reader__header_message, #reader__status_span {
          display: none !important;
        }
      `}</style>
    </div>
  );
}