"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onResult: (text: string) => void;
}

export default function QRScanner({ onResult }: QRScannerProps) {
  const [status, setStatus] = useState("Khởi tạo camera...");
  const [cameraError, setCameraError] = useState("");
  const scannerId = "html5qr-scanner";
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let active = true;

    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (!active) return;

        if (!cameras || cameras.length === 0) {
          setCameraError("Không tìm thấy camera. Kiểm tra quyền hoặc thiết bị.");
          setStatus("Camera không khả dụng");
          return;
        }

        const cameraId = cameras[0].id;
        html5QrcodeRef.current = new Html5Qrcode(scannerId);

        await html5QrcodeRef.current.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 280, height: 280 },
          },
          (decodedText) => {
            if (!active) return;
            setStatus(`Đã quét: ${decodedText}`);
            setCameraError("");
            onResult(decodedText);
          },
          () => {
            if (!active) return;
            setStatus("Đang tìm mã QR...");
          },
        );

        setStatus("Camera sẵn sàng. Hướng về mã QR.");
      } catch (err) {
        setCameraError("Không thể truy cập camera. Vui lòng cho phép quyền.");
        setStatus("Lỗi camera");
      }
    };

    startScanner();

    return () => {
      active = false;
      if (html5QrcodeRef.current) {
        html5QrcodeRef.current.stop().catch(() => null);
        html5QrcodeRef.current.clear();
      }
    };
  }, [onResult]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[24px] bg-slate-100">
      <div id={scannerId} className="h-full w-full bg-black" />
      <div className="pointer-events-none absolute inset-0 rounded-[24px] border border-orange-300/40" />
      <div className="absolute bottom-4 left-4 right-4 rounded-[24px] border border-slate-200 bg-white/95 px-4 py-3 text-sm text-slate-900 shadow-xl shadow-slate-200/60">
        <div className="flex items-center justify-between gap-4">
          <span>{cameraError || status}</span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cameraError ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {cameraError ? 'Lỗi' : 'Hoạt động'}
          </span>
        </div>
      </div>
    </div>
  );
}
