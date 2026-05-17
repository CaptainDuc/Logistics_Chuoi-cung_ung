"use client";

import { useState } from "react";
import QRScanner from "./QRScanner";

export default function ScanPage() {
  const [result, setResult] = useState("");

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-6">Quét mã QR</h1>

      {/* CAMERA AREA */}
      <div className="border-2 border-dashed rounded-xl h-80 flex items-center justify-center overflow-hidden">
        <QRScanner onResult={setResult} />
      </div>

      {/* KẾT QUẢ */}
      {result && (
        <div className="mt-4 p-3 bg-green-600 rounded">
          QR: {result}
        </div>
      )}
    </div>
  );
}