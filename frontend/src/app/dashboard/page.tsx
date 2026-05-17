import React from "react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Tổng quan hệ thống
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Giám sát số liệu vận hành kho hàng thời gian thực.
        </p>
      </div>

      {/* KHU VỰC CÁC THẺ THÔNG SỐ SỐ LIỆU THỐNG KÊ (KPI CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Tổng số sản phẩm */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-2xl">
            📦
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Tổng mã sản phẩm SKU
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">152</p>
          </div>
        </div>

        {/* Card 2: Số lượt nhập kho */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-2xl">
            📥
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Nhập kho hôm nay
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">+32 lượt</p>
          </div>
        </div>

        {/* Card 3: Số lượt xuất kho */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center text-2xl">
            📤
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Xuất kho hôm nay
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">-18 lượt</p>
          </div>
        </div>

        {/* Card 4: CẢNH BÁO NGUY HIỂM TỒN KHO THẤP */}
        <div className="bg-red-50 p-5 rounded-xl border border-red-200 shadow-sm flex items-center space-x-4 animate-pulse">
          <div className="w-12 h-12 bg-red-500 text-white rounded-lg flex items-center justify-center text-xl shadow-md">
            ⚠️
          </div>
          <div>
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wider">
              Tồn kho nguy hiểm
            </p>
            <p className="text-2xl font-bold text-red-700 mt-0.5">2 mặt hàng</p>
          </div>
        </div>
      </div>

      {/* DANH SÁCH CẢNH BÁO TỒN KHO THẤP BẰNG MÀU SẮC TRỰC QUAN */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Cảnh báo hàng hóa chạm ngưỡng nguy hiểm
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-xs font-bold uppercase bg-slate-50">
                <th className="py-3 px-4">Mã SKU</th>
                <th className="py-3 px-4">Tên hàng hóa</th>
                <th className="py-3 px-4">Số lượng tồn</th>
                <th className="py-3 px-4">Ngưỡng tối thiểu</th>
                <th className="py-3 px-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              <tr>
                <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                  QR-SAMP-001
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-900">
                  Tai nghe Sony WH-CH720N (Black)
                </td>
                <td className="py-3.5 px-4 text-red-600 font-bold">2 cái</td>
                <td className="py-3.5 px-4 text-slate-500">10 cái</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-md font-semibold">
                    Cạn kiệt
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                  QR-SAMP-045
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-900">
                  Hộp carton đóng gói size M
                </td>
                <td className="py-3.5 px-4 text-amber-600 font-bold">12 cái</td>
                <td className="py-3.5 px-4 text-slate-500">30 cái</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-md font-semibold">
                    Dưới hạn mức
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
