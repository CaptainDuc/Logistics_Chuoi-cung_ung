"use client";

import QRScanner from "../../scan/QRScanner";
import { exportToExcel } from "@/utils/exportExcel";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Trash2, FileSpreadsheet, RefreshCw } from "lucide-react";
import { backendFetch } from "@/lib/api";

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanData, setScanData] = useState<any[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("scanData");
    if (saved) setScanData(JSON.parse(saved));
    
    audioRef.current = new Audio(
      "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"
    );
  }, []);

  useEffect(() => {
    localStorage.setItem("scanData", JSON.stringify(scanData));
  }, [scanData]);

  useEffect(() => {
    if (!scanResult) return;

    const verifyProductWithBackend = async () => {
      try {
        // Vì không được sửa Backend để hỗ trợ tìm theo SKU trực tiếp,
        // Ta sẽ lấy danh sách sản phẩm và lọc ở Frontend
        const response = await backendFetch(`api/products?limit=1000`);
        if (!response.ok) throw new Error("Không thể kết nối đến hệ thống");
        
        const result = await response.json();
        const allProducts = result.data || [];
        
        // Tìm sản phẩm có SKU khớp với mã vừa quét
        const foundProduct = allProducts.find(
          (p: any) => p.sku?.trim().toUpperCase() === scanResult.trim().toUpperCase()
        );

        if (!foundProduct) {
          throw new Error(`Mã SKU [${scanResult}] không tồn tại trên hệ thống!`);
        }

        setScanData((prev) => {
          const isDuplicate = prev[0]?.sku === scanResult;
          if (isDuplicate) return prev;

          audioRef.current?.play();
          return [
            {
              product: foundProduct.name || "Sản phẩm không rõ",
              sku: scanResult,
              quantity: 1,
              status: "SUCCESS",
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            },
            ...prev,
          ];
        });
      } catch (error: any) {
        console.error("Lỗi scan:", error);
        alert(error.message || "Đã xảy ra lỗi khi kiểm tra sản phẩm");
      }
    };

    verifyProductWithBackend();
  }, [scanResult]);

  const clearHistory = () => {
    if (window.confirm("Xóa lịch sử quét?")) {
      setScanData([]);
      setScanResult(null);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="section-header" style={{ marginBottom: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
             <QrCode size={22} color="#818cf8" />
             <h1 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)" }}>
               Quét mã QR/Barcode
             </h1>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Tự động nhận diện và kiểm tra sản phẩm
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Scanner Section */}
        <div className="animate-fade-up" style={{
          background: "rgba(13, 19, 33, 0.6)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "24px",
          padding: "16px",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ 
            aspectRatio: "1/1", 
            width: "100%", 
            borderRadius: "20px", 
            overflow: "hidden",
            position: "relative",
            background: "#000"
          }}>
             <QRScanner onScan={setScanResult} />
             {/* Overlay scanning effect */}
             <div style={{
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                height: "2px",
                background: "linear-gradient(90deg, transparent, #6366f1, transparent)",
                boxShadow: "0 0 15px #6366f1",
                animation: "scanner-move 3s linear infinite",
                zIndex: 5
             }} />
          </div>

          <AnimatePresence>
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  background: "rgba(99, 102, 241, 0.1)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  borderRadius: "12px",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: "10px", fontWeight: "700", color: "#818cf8", textTransform: "uppercase", marginBottom: "4px" }}>
                  Mã SKU đã phát hiện
                </div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", wordBreak: "break-all" }}>
                  {scanResult}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
           <button 
             onClick={() => exportToExcel(scanData, "scan-history")}
             disabled={scanData.length === 0}
             className="btn btn-primary" 
             style={{ flex: 1, height: "50px" }}
           >
             <FileSpreadsheet size={16} />
             Xuất báo cáo
           </button>
           <button 
             onClick={clearHistory}
             disabled={scanData.length === 0}
             className="btn btn-ghost" 
             style={{ width: "50px", height: "50px", padding: 0 }}
           >
             <Trash2 size={18} color="#fb7185" />
           </button>
        </div>

        {/* History List */}
        <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-secondary)" }}>
              Lịch sử quét ({scanData.length})
            </h3>
            {scanData.length > 0 && <span style={{ fontSize: "11px", color: "var(--accent-emerald)" }}>Đã đồng bộ</span>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {scanData.length === 0 ? (
              <div style={{ 
                padding: "40px 20px", 
                textAlign: "center", 
                background: "rgba(255,255,255,0.01)", 
                border: "1px dashed var(--border-subtle)",
                borderRadius: "20px"
              }}>
                <RefreshCw size={32} color="var(--text-muted)" style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Đang chờ mã sản phẩm...</p>
              </div>
            ) : (
              scanData.map((item, i) => (
                <motion.div
                  key={item.sku + item.time}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    padding: "16px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.product}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                      SKU: {item.sku} • {item.time}
                    </div>
                  </div>
                  <div style={{ 
                    padding: "4px 8px", 
                    background: "rgba(16, 185, 129, 0.1)", 
                    color: "#34d399", 
                    borderRadius: "6px", 
                    fontSize: "10px", 
                    fontWeight: "800" 
                  }}>
                    OK
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scanner-move {
          0% { top: 0%; opacity: 0.4; }
          50% { top: 100%; opacity: 1; }
          100% { top: 0%; opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
