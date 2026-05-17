export default function ScanPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4">

      <h1 className="text-2xl font-bold mb-6">
        Quét mã QR
      </h1>

      <div className="border-2 border-dashed rounded-xl h-80 flex items-center justify-center">
        Camera QR ở đây
      </div>

      <button className="w-full bg-green-500 py-4 rounded-xl mt-6 text-lg font-bold">
        Bắt đầu quét
      </button>

    </div>
  );
}