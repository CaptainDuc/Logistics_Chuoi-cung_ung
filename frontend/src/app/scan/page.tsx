"use client";

import QRScanner from "./QRScanner";
import { exportToExcel } from "@/utils/exportExcel";
import { backendFetch } from "@/lib/api";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanData, setScanData] = useState<any[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  // 1. Load data lịch sử từ localStorage khi vào trang
  useEffect(() => {
    const saved = localStorage.getItem("scanData");
    if (saved) setScanData(JSON.parse(saved));
  }, []);

  // 2. Tự động lưu lịch sử vào localStorage khi có thay đổi
  useEffect(() => {
    localStorage.setItem("scanData", JSON.stringify(scanData));
  }, [scanData]);

  // 3. Khởi tạo âm thanh bíp khi quét
  useEffect(() => {
    audioRef.current = new Audio(
      "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"
    );
  }, []);

  // 4. 🌟 ĐÂY CHÍNH LÀ ĐOẠN USEEFFECT KẾT NỐI API BACKEND CỔNG 4000
  useEffect(() => {
    if (!scanResult) return;

    const verifyProductWithBackend = async () => {
      try {
        // Gọi API đến Backend để kiểm tra mã SKU vừa quét được
        const response = await backendFetch(`api/products/${scanResult}`);
        
        if (!response.ok) {
          throw new Error("Không tìm thấy sản phẩm trong hệ thống");
        }

        const productData = await response.json();

        // Nếu Backend trả về dữ liệu thành công, thêm vào danh sách hiển thị
        setScanData((prev) => {
          const isDuplicate = prev[0]?.sku === scanResult;
          if (isDuplicate) return prev; // Tránh quét trùng liên tiếp

          audioRef.current?.play(); // Phát tiếng bíp

          return [
            {
              product: productData.name || "Sản phẩm không tên", // Tên thật từ Database backend
              sku: scanResult,
              quantity: 1,
              status: "SUCCESS",
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            },
            ...prev,
          ];
        });

      } catch (error) {
        console.error("Lỗi kết nối API:", error);
        // Báo lỗi nếu quét phải mã không có trong seed.js hoặc backend chưa viết Route này
        alert(`Mã SKU [${scanResult}] không tồn tại trên hệ thống dữ liệu backend hoặc lỗi kết nối!`);
      }
    };

    verifyProductWithBackend();
  }, [scanResult]);

  const clearHistory = () => {
    if (window.confirm("Hủy toàn bộ dữ liệu phiên quét và làm mới Terminal?")) {
      setScanData([]);
      setScanResult(null);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#060910] text-slate-100 overflow-x-hidden font-sans selection:bg-cyan-500/20">
      
      {/* BACKGROUND ANIMATION */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-700/10 blur-[150px] animate-[pulse_10s_infinite_alternate]" />
        <div className="absolute bottom-[10%] right-[-15%] w-[50%] h-[50%] rounded-full bg-indigo-700/10 blur-[120px] animate-[pulse_8s_infinite_alternate_3s]" />
      </div>

      {/* TOP BAR */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#080c1e]/70 backdrop-blur-2xl shadow-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 h-24">
          <div className="flex items-center gap-5">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-300 transition-all"
            >
              <ArrowLeft size={15} />
              Quay về Dashboard
            </button>
            <div className="h-6 w-px bg-white/10" />
            <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-black">
              ⚡
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300">
                WHFlow Nexus Pro
              </h1>
              <p className="text-[11px] text-cyan-400 font-mono tracking-wider uppercase">Global Terminal Matrix v2.1</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {scanData.length > 0 && (
              <button onClick={clearHistory} className="rounded-xl px-5 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-all">
                Clear Terminal
              </button>
            )}
            <button
              onClick={() => exportToExcel(scanData, "scan-history")}
              disabled={scanData.length === 0}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-20 disabled:pointer-events-none"
            >
              Export Analytics (.xlsx)
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT GRID */}
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-12 gap-8 px-8 py-12">
        
        {/* LEFT COLUMN: SCANNER */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
          <div className="rounded-3xl border border-white/5 bg-[#0d1326]/50 backdrop-blur-xl p-8 space-y-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#22d3ee]" />
                <div>
                  <h2 className="text-[12px] font-bold text-cyan-400 uppercase tracking-widest font-mono">Capture.Matrix</h2>
                  <p className="text-sm font-semibold text-slate-200 mt-1">Live Subsystem Receiver</p>
                </div>
              </div>
            </div>

            <div className="p-1.5 bg-black/40 rounded-3xl border border-white/5 shadow-inner">
              <QRScanner onScan={setScanResult} />
            </div>

            <AnimatePresence mode="wait">
              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  className="relative overflow-hidden rounded-xl bg-cyan-950/20 border border-cyan-500/20 p-5"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-bold text-cyan-400 tracking-widest font-mono uppercase">Interception Successful</span>
                    <span className="text-[9px] text-cyan-700 font-mono">RAW_SKU</span>
                  </div>
                  <p className="font-mono text-xs text-cyan-100 break-all bg-black/60 p-4 rounded-xl border border-white/5 shadow-inner">
                    {scanResult}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* TERMINAL STATUS LOGS */}
          <div className="rounded-3xl border border-white/5 bg-[#0d1326]/50 backdrop-blur-xl p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h2 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest font-mono">Nexus Terminal</h2>
                <p className="text-sm font-semibold text-slate-200 mt-1">Status Logs & Alerts</p>
              </div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>ONLINE // Port: 4000</span>
              </div>
            </div>
            <div className="font-mono text-[11px] text-slate-400 space-y-2.5 h-[100px] overflow-y-auto custom-scrollbar pr-2 bg-black/40 p-5 rounded-2xl border border-white/5 shadow-inner">
              <p>[INFO] Scanner Node connected to HTTP://LOCALHOST:4000...</p>
              <p>[DB] Database status verified: Atlas Cluster Node Active.</p>
              <p className="text-cyan-400">[READY] Đang đợi bạn quét các mã SKU mẫu từ file seed...</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: HISTORY LIST */}
        <div className="col-span-12 lg:col-span-7">
          <div className="rounded-3xl border border-white/5 bg-[#0d1326]/50 backdrop-blur-xl p-8 flex flex-col h-full min-h-[600px] shadow-2xl">
            
            <div className="flex justify-between items-center pb-5 border-b border-white/5">
              <div>
                <h2 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest font-mono">Live Subsystem Registry</h2>
                <p className="text-sm font-semibold text-slate-200 mt-1">Dữ liệu thực tế từ MongoDB Backend</p>
              </div>
              <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-mono text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>{scanData.length} ITEMS SCANNED</span>
              </div>
            </div>

            {/* ANALYTICS CARD */}
            <div className="grid grid-cols-3 gap-5 mt-6 mb-7 p-6 bg-black/30 rounded-2xl border border-white/5 shadow-inner">
              <div className="text-center">
                <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Total Scans</p>
                <p className="text-2xl font-black text-cyan-400 mt-1.5">{scanData.length}</p>
              </div>
              <div className="text-center border-x border-white/5">
                <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Server Node</p>
                <p className="text-xl font-extrabold text-emerald-400 mt-1.5">CONNECTED</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Target DB</p>
                <p className="text-base font-bold text-slate-200 mt-2 truncate">quan_ly_kho</p>
              </div>
            </div>

            {/* DATA LIST BUILDER */}
            <div className="flex-1 overflow-y-auto pr-1.5 max-h-[480px] space-y-4 custom-scrollbar">
              <AnimatePresence initial={false}>
                {scanData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 text-center bg-black/20 rounded-2xl border border-dashed border-white/10">
                    <p className="text-sm font-mono text-slate-300 tracking-wider">Màn hình đang đợi quét sản phẩm...</p>
                    <p className="text-xs font-mono text-slate-500 mt-2 max-w-[340px]">
                      Hãy thử quét các mã SKU đã nạp: LAP-DELL-XPS13-001, MOU-LOGI-MX3S-002, hoặc KEY-KEYC-K8P-003.
                    </p>
                  </div>
                ) : (
                  scanData.map((item, i) => (
                    <motion.div
                      key={item.sku + item.time}
                      initial={{ opacity: 0, x: -35, backgroundColor: "rgba(34, 211, 238, 0.2)" }}
                      animate={{ opacity: 1, x: 0, backgroundColor: "rgba(18, 24, 38, 0.2)" }}
                      exit={{ opacity: 0, x: 35 }}
                      transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    >
                      <div className="flex justify-between items-center rounded-2xl border border-white/5 p-5 group shadow-lg">
                        <div className="flex items-center gap-5 min-w-0">
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-cyan-400 font-black">
                            #{scanData.length - i}
                          </div>
                          <div className="min-w-0">
                            <p className="font-mono text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors truncate max-w-[320px] sm:max-w-xl">
                              {item.product} {/* Hiển thị tên sản phẩm lấy từ MongoDB */}
                            </p>
                            <p className="text-[10px] font-mono text-slate-500 mt-1.5">
                              SKU: {item.sku} // VERIFIED AT {item.time} // NODE_4000
                            </p>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1.5 text-[9px] font-bold font-mono px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                          {item.status}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}