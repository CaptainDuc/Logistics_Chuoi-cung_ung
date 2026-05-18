import React from "react";
import ProductQR from "@/components/productQR";
import { Package, AlertTriangle, LayoutGrid, MapPin } from "lucide-react";

// KÍCH HOẠT CƠ CHẾ ISR: Tự động làm mới ngầm file HTML tĩnh sau mỗi 30 giây
export const revalidate = 30;

// Đã nâng cấp Interface trùng khớp cấu trúc thực thể MongoDB của bạn Backend
interface Product {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
  minQuantity: number;
  supplierId: string;
  location: string;
  price?: number; // Giữ lại trường price phục vụ giao diện cũ
  unit?: string; // Giữ lại trường unit phục vụ giao diện cũ
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

    // Mảng dữ liệu giả định CHUẨN ĐỒNG BỘ 100% với file seed.js của Backend
    return [
      {
        _id: "prod-001",
        name: "Máy tính xách tay Dell XPS 13",
        sku: "LAP-DELL-XPS13-001",
        quantity: 20,
        minQuantity: 5,
        supplierId: "sup-abc",
        location: "Kệ A1 - Tầng 1",
        unit: "Cái",
        price: 35000000,
      },
      {
        _id: "prod-002",
        name: "Chuột không dây Logitech MX Master 3S",
        sku: "MOU-LOGI-MX3S-002",
        quantity: 50,
        minQuantity: 20,
        supplierId: "sup-abc",
        location: "Kệ B3 - Tầng 1",
        unit: "Cái",
        price: 2500000,
      },
      {
        _id: "prod-003",
        name: "Bàn phím cơ Keychron K8 Pro",
        sku: "KEY-KEYC-K8P-003",
        quantity: 0, // Bằng 0 theo đúng file seed để test trạng thái hết hàng
        minQuantity: 10,
        supplierId: "sup-xyz",
        location: "Kệ C2 - Tầng 2",
        unit: "Cái",
        price: 1950000,
      },
    ];
  }
}

export default async function ProductsPage() {
  const products = await getProductsISR();

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
      </div>

      {/* KHỐI HIỂN THỊ DANH SÁCH DẠNG THẺ (CARD) GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {products.map((product) => {
          // THAY ĐỔI: So sánh động số lượng tồn với ngưỡng minQuantity của chính sản phẩm đó
          const isLowStock =
            (Number(product.quantity) || 0) < (product.minQuantity || 0);

          return (
            <div
              key={product._id}
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

                  {/* Hiển thị vị trí kệ kho lấy từ dữ liệu của Backend */}
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
                    {product.quantity}
                  </p>
                  <p className="text-xs font-bold text-blue-600 font-mono pt-1">
                    {product.price
                      ? `${product.price.toLocaleString("vi-VN")} đ`
                      : "—"}
                  </p>
                </div>

                {/* GỌI ĐẾN COMPONENT HIỂN THỊ MÃ QR TỪ MÃ SKU AN TOÀN */}
                <ProductQR
                  sku={product.sku || product._id}
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
