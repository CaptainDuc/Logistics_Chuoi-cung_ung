"use client";

import { useEffect, useRef } from "react";

export default function QRScanner({
  onResult,
}: {
  onResult: (text: string) => void;
}) {
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    let scanner: any;

    const init = async () => {
      const { Html5QrcodeScanner } = await import("html5-qrcode");

      scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: 250,
        },
        false
      );

      scannerRef.current = scanner;

      scanner.render(
        async (text: string) => {
          onResult(text);

          await fetch("/api/inventory/scan", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ qrData: text }),
          });

          // stop scanner sau khi quét
          scanner.clear();
          scannerRef.current = null;
        },
        () => {}
      );
    };

    init();

    return () => {
      scannerRef.current?.clear?.().catch(() => {});
    };
  }, [onResult]);

  return (
    <div>
      <div id="qr-reader" className="w-full" />

      {/* không cần bấm nút nữa, auto mở camera */}
      <p className="text-sm text-gray-400 mt-2 text-center">
        Đang khởi động camera...
      </p>
    </div>
  );
}