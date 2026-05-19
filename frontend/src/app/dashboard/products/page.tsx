"use client"; // Chuyển sang Client Component để dùng được Hooks và Store

import React, { useEffect } from "react";
import ProductQR from "@/components/productQR";
import {
  Package,
  AlertTriangle,
  LayoutGrid,
  MapPin,
  Trash2,
  FileSpreadsheet,
} from "lucide-react";
import AddProductModal from "@/components/AddProductModal";
import { useWarehouseStore } from "@/store/useWarehouseStore"; // Import Store của Đức

export default function ProductsPage() {
  // Lấy dữ liệu, trạng thái và hàm fetch mới từ Zustand Store kết nối Backend thật
  const products = useWarehouseStore((state) => state.products);
  const isLoading = useWarehouseStore((state) => state.isLoading);
  const fetchProducts = useWarehouseStore((state) => state.fetchProducts);
  // @ts-ignore
  const deleteProduct = useWarehouseStore((state) => state.deleteProduct); // 🔥 ĐỒNG BỘ: Lấy hàm xóa từ Store

  // Tự động kích hoạt gọi API lấy dữ liệu thật từ MongoDB Atlas về khi Đức vào trang
  useEffect(() => {
    const loadWarehouseData = async () => {
      try {
        await fetchProducts();
      } catch (err) {
        console.error("Không thể load danh mục vật tư từ MongoDB:", err);
      }
    };

    loadWarehouseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔥 ĐỒNG BỘ: Hàm xử lý khi người dùng click nút xóa
  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = window.confirm(
      `Đức có chắc chắn muốn xóa sản phẩm "${name}" khỏi kho không?`
    );
    if (confirmDelete && deleteProduct) {
      try {
        await deleteProduct(id);
        alert("Xóa sản phẩm thành công!");
      } catch (err) {
        alert("Có lỗi xảy ra khi xóa sản phẩm!");
      }
    }
  };

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/inventory/export-excel",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể xuất file Excel");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;

      a.download = "bao-cao-kho-hang.xlsx";

      document.body.appendChild(a);

      a.click();

      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);

      alert("Có lỗi xảy ra khi xuất Excel!");
    }
  };
  // Nếu Store đang gọi API thì hiển thị hiệu ứng Loading quét xung
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50/40">
        <div className="text-sm font-medium text-slate-500 animate-pulse">
          Đang tải danh mục kho hàng từ hệ thống Atlas...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto min-h-screen bg-slate-50/40">
      {/* THANH TIÊU ĐỀ TRANG CẤU HÌNH */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-slate-700" /> Danh mục sản phẩm
            kho hàng
          </h1>
          <p className="text-sm text-slate-500">
            Hệ thống tự động tích hợp mã QR động theo từng sản phẩm phục vụ công
            tác máy quét hoặc ứng dụng di động kiểm kho.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Xuất Excel Kho Hàng
          </button>

          <AddProductModal onSuccess={fetchProducts} />
        </div>
      </div>

      {/* KHỐI HIỂN THỊ DANH SÁCH DẠNG THẺ (CARD) GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {products.map((product) => {
          // Check ngưỡng cảnh báo hết hàng dựa theo cấu hình minQuantity thật của sản phẩm
          const isLowStock = product.quantity < product.minQuantity;

          return (
            <div
              key={product._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all p-5 flex flex-col justify-between space-y-4 animate-in fade-in duration-200 relative group"
            >
              {/* Phần thông tin phía trên của Thẻ vật tư */}
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 block shadow-inner">
                    <Package className="w-5 h-5 text-slate-500" />
                  </span>

                  {/* Khối chứa badge cảnh báo và nút xóa */}
                  <div className="flex items-center gap-1.5">
                    {isLowStock && (
                      <span className="flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-bold px-2 py-1 rounded-lg">
                        <AlertTriangle className="w-3 h-3" /> Cần nhập thêm
                      </span>
                    )}

                    {/* 🔥 ĐỒNG BỘ: Nút xóa sản phẩm xuất hiện khi hover vào card hoặc luôn hiển thị trên mobile */}
                    <button
                      onClick={() => {
                        if (product._id) {
                          handleDelete(product._id, product.name);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base line-clamp-2 h-12 leading-snug tracking-tight">
                    {product.name}
                  </h3>

                  {/* Hiển thị vị trí kệ kho lấy từ Store */}
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">
                      Vị trí:{" "}
                      <span className="text-slate-600 font-medium">
                        {product.location || "Chưa xếp kệ"}
                      </span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-medium mt-1">
                    Mã định danh:{" "}
                    <span className="text-slate-600 font-mono font-semibold">
                      {product.sku}
                    </span>
                  </p>
                </div>
              </div>

              {/* Phần số lượng tồn kho và tích hợp Mã QR động ở dưới */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Số lượng tồn
                  </p>
                  <p
                    className={`text-2xl font-black font-mono tracking-tight ${
                      isLowStock ? "text-rose-600" : "text-slate-800"
                    }`}
                  >
                    {product.quantity}
                  </p>
                </div>

                {/* GỌI ĐẾN COMPONENT HIỂN THỊ MÃ QR TỪ MÃ SKU AN TOÀN */}
                <ProductQR sku={product.sku} name={product.name} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Hiển thị giao diện thông báo trống nếu mảng products rỗng */}
      {products.length === 0 && (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl shadow-sm">
          <p className="text-sm text-slate-400 font-medium">
            Không tìm thấy bất kỳ dữ liệu sản phẩm nào trong hệ thống kho.
          </p>
        </div>
      )}
    </div>
  );
}
