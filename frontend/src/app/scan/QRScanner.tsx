"use client";

import { useEffect, useRef, useState } from "react";

export default function QRScanner({
  onResult,
}: {
  onResult: (text: string) => void;
}) {
  const scannerRef = useRef<any>(null);
  const [status, setStatus] = useState("Đang khởi động camera...");

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { Html5QrcodeScanner } = await import("html5-qrcode");
      if (!mounted) return;

      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
        },
        false
      );

      scannerRef.current = scanner;

      scanner.render(
        (decodedText: string) => {
          onResult(decodedText);
          scanner.clear().catch(() => {});
          scannerRef.current = null;
        },
        () => {
          setStatus("Đang tìm mã... Giữ camera ổn định.");
        }
      );

      setStatus("Camera đã sẵn sàng. Quét mã QR ngay.");
    };

    init();

    return () => {
      mounted = false;
      scannerRef.current?.clear?.().catch(() => {});
    };
  }, [onResult]);

  return (
    <div className="h-full">
      <div id="qr-reader" className="h-full min-h-[320px] w-full" />
      <p className="mt-3 text-center text-sm text-slate-300">{status}</p>
    </div>
  );
}