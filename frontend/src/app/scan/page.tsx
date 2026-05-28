import QRScanner from "./QRScanner";

export default function ScanPage() {
  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-20">
        <h1 className="mb-4 text-5xl font-black">
          Quét QR Sản Phẩm
        </h1>

        <p className="mb-12 text-slate-400">
          Đưa mã QR vào camera để quét.
        </p>

        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <QRScanner />
        </div>
      </div>
    </main>
  );
}