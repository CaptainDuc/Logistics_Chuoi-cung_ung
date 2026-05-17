"use client";

import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRScanner({
  onResult,
}: {
  onResult: (text: string) => void;
}) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    return () => {
      scannerRef.current?.clear().catch(() => {});
    };
  }, []);

  const startScanner = () => {
    if (scannerRef.current) return;

    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: 250,
      },
      false
    );

    scannerRef.current.render(
      async (text) => {
        onResult(text);

        await fetch("/api/inventory/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrData: text }),
        });

        // stop sau khi quét
        scannerRef.current?.clear().catch(() => {});
        scannerRef.current = null;
      },
      () => {}
    );
  };

  return (
    <div>
      <div id="qr-reader" className="w-full" />
      <button
        onClick={startScanner}
        className="w-full bg-blue-500 py-2 rounded mt-4"
      >
        Mở camera
      </button>
    </div>
  );
}