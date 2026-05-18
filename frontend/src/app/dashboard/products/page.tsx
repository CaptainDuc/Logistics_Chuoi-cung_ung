import React from "react";
import ProductQR from "@/components/productQR";
import { Package, AlertTriangle, LayoutGrid } from "lucide-react";

// KÍCH HOẠT CƠ CHẾ ISR: Tự động làm mới ngầm file HTML tĩnh sau mỗi 30 giây
export const revalidate = 30;

interface Product {
  id: string | number;
  name: string;
  sku: string;
  qty: number;
  unit?: string;
  price?: number;
}

// Hàm fetch dữ liệu trực tiếp tại Server-side
async function getProductsISR(): Promise<Product[]> {
  try {
    // Đức cấu hình lại URL API chính thức nối xuống Backend của bạn tại đây nhé:
    const res = await fetch("http://localhost:8080/api/products", {
      next: { revalidate: 30 },
    });

    if (!res.ok) throw new Error("Mạng phản hồi từ API Backend gặp lỗi");
    return res.json();
  } catch (error) {
    console.error("Lỗi fetch dữ liệu ISR phát sinh:", error);

    // Mảng dữ liệu giả định chất lượng cao để test giao diện lập tức
    return [
      {
        id: 1,
        name: "Cáp mạng Cat6 UTP Lamit chất lượng cao",
        sku: "CAP-CAT6-001",
        qty: 45,
        unit: "Cuộn",
        price: 1250000,
      },
      {
        id: 2,
        name: "Đầu bấm mạng RJ45 AMP bọc kim chống nhiễu",
        sku: "RJ45-AMP-GOLD",
        qty: 8,
        unit: "Hộp",
        price: 350000,
      },
      {
        id: 3,
        name: "Switch Cisco 24-Port Gigabit Ethernet L2 Manage",
        sku: "SW-CISCO-24G",
        qty: 18,
        unit: "Cái",
        price: 4800000,
      },
      {
        id: 4,
        name: "Kìm bấm mạng chuyên dụng đa năng Talon",
        sku: "KIM-TALON-TLN",
        qty: 5,
        unit: "Cái",
        price: 620000,
      },
      {
        id: 5,
        name: "Bộ phát sóng không dây Băng tần kép Aruba AP",
        sku: "WIFI-ARUBA-303",
        qty: 22,
        unit: "Bộ",
        price: 3150000,
      },
    ];
  }
}

export default async function ProductsPage() {
  const products = await getProductsISR();

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto min-h-screen bg-slate-50/40">
      {/* THANH TIÊU ĐỀ TRANG CẤU HÌNH (ĐÃ BỎ BADGE ISR) */}
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
      </div>

      {/* KHỐI HIỂN THỊ DANH SÁCH DẠNG THẺ (CARD) GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {products.map((product) => {
          const isLowStock = (Number(product.qty) || 0) < 15;

          return (
            <div
              key={product.id.toString()}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all p-5 flex flex-col justify-between space-y-4"
            >
              {/* Phần thông tin phía trên của Thẻ vật tư */}
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 block shadow-inner">
                    <Package className="w-5 h-5 text-slate-500" />
                  </span>
                  {isLowStock && (
                    <span className="flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-bold px-2 py-1 rounded-lg animate-pulse">
                      <AlertTriangle className="w-3 h-3" /> Cần nhập thêm
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base line-clamp-2 h-12 leading-snug tracking-tight">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    Đơn vị tính:{" "}
                    <span className="text-slate-600 font-semibold">
                      {product.unit || "Cái"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Phần số lượng tồn kho, giá và tích hợp Mã QR động ở dưới */}
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
                    {product.qty}
                  </p>
                  <p className="text-xs font-bold text-blue-600 font-mono pt-1">
                    {product.price
                      ? `${product.price.toLocaleString("vi-VN")} đ`
                      : "—"}
                  </p>
                </div>

                {/* GỌI ĐẾN COMPONENT HIỂN THỊ MÃ QR TỪ MÃ SKU AN TOÀN */}
                <ProductQR
                  sku={product.sku || product.id.toString()}
                  name={product.name}
                />
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
