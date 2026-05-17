"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface ProductFormValues {
  sku: string;
  name: string;
  qty: string;
  location: string;
}

export default function ProductsPage() {
  // Trạng thái ẩn/hiện Modal Thêm Sản Phẩm
  const [isOpen, setIsOpen] = useState(false);

  // DANH SÁCH VỊ TRÍ KHO MỞ RỘNG (TỪ KHU A ĐẾN KHU E)
  const allLocations = [
    "Khu A - Kệ 1",
    "Khu A - Kệ 2",
    "Khu A - Kệ 3",
    "Khu A - Kệ 4",
    "Khu A - Kệ 5",
    "Khu B - Kệ 1",
    "Khu B - Kệ 2",
    "Khu B - Kệ 3",
    "Khu B - Kệ 4",
    "Khu B - Kệ 5",
    "Khu C - Kệ 1",
    "Khu C - Kệ 2",
    "Khu C - Kệ 3",
    "Khu C - Kệ 4",
    "Khu C - Kệ 5",
    "Khu D - Kệ 1",
    "Khu D - Kệ 2",
    "Khu D - Kệ 3",
    "Khu D - Kệ 4",
    "Khu D - Kệ 5",
    "Khu E - Kệ 1",
    "Khu E - Kệ 2",
    "Khu E - Kệ 3",
    "Khu E - Kệ 4",
    "Khu E - Kệ 5",
  ];

  // Mock data danh sách sản phẩm mẫu hiển thị trên bảng
  const [products, setProducts] = useState([
    {
      id: 1,
      sku: "SKU-A1-1024",
      name: "Tai nghe Sony WH-CH720N (Black)",
      qty: 2,
      location: "Khu A - Kệ 1",
      status: "Cạn kiệt",
    },
    {
      id: 2,
      sku: "SKU-B3-8842",
      name: "iPhone 17 Pro Max 256GB",
      qty: 45,
      location: "Khu B - Kệ 3",
      status: "An toàn",
    },
    {
      id: 3,
      sku: "SKU-C2-4915",
      name: "Hộp carton đóng gói size M",
      qty: 12,
      location: "Khu C - Kệ 2",
      status: "Dưới hạn mức",
    },
  ]);

  // ĐỊNH NGHĨA KHUÔN MẪU VALIDATION BẰNG ZOD
  const productSchema = z.object({
    sku: z
      .string()
      .min(1, { message: "Mã SKU sẽ được hệ thống tự động sinh ra" }),
    name: z
      .string()
      .min(5, { message: "Tên sản phẩm phải có ít nhất 5 ký tự" }),
    qty: z
      .string()
      .min(1, { message: "Số lượng không được để trống" })
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Số lượng tồn phải là số và lớn hơn 0",
      }),
    location: z
      .string()
      .min(1, { message: "Vui lòng chọn vị trí kho còn trống" }),
  });

  // LOGIC LỌC VỊ TRÍ TRỐNG
  const availableLocations = allLocations.filter(
    (loc) => !products.some((product) => product.location === loc)
  );

  // KHỞI TẠO REACT HOOK FORM
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: "",
      name: "",
      qty: "",
      location: "",
    },
  });

  // Theo dõi giá trị ô "location" xem người dùng đang chọn khu nào
  const selectedLocation = watch("location");

  // EFFECT TỰ ĐỘNG SINH MÃ SKU KHI VỊ TRÍ THAY ĐỔI
  useEffect(() => {
    if (selectedLocation) {
      // Tách chuỗi lấy chữ cái Khu và Số Kệ (Ví dụ: "Khu A - Kệ 2" -> "A" và "2")
      const matches = selectedLocation.match(/Khu\s([A-E])\s-\sKệ\s([1-5])/);
      if (matches) {
        const khu = matches[1]; // A, B, C, D, E
        const ke = matches[2]; // 1, 2, 3, 4, 5

        // Tạo 4 số ngẫu nhiên ngẫu nhiên để tránh trùng mã
        const randomNum = Math.floor(1000 + Math.random() * 9000);

        // Định dạng SKU: SKU-[Khu][Kệ]-[Số ngẫu nhiên] -> SKU-A2-4912
        const generatedSku = `SKU-${khu}${ke}-${randomNum}`;

        // Tự động điền vào ô SKU trong form
        setValue("sku", generatedSku, { shouldValidate: true });
      }
    } else {
      setValue("sku", ""); // Nếu chưa chọn vị trí thì để trống SKU
    }
  }, [selectedLocation, setValue]);

  // Hàm xử lý khi form hợp lệ và được submit
  const onSubmit = (data: ProductFormValues) => {
    const numericQty = Number(data.qty);

    let status = "An toàn";
    if (numericQty <= 5) status = "Cạn kiệt";
    else if (numericQty <= 15) status = "Dưới hạn mức";

    const newProduct = {
      id: Date.now(),
      sku: data.sku, // Lấy mã SKU tự động sinh ra
      name: data.name,
      qty: numericQty,
      location: data.location,
      status,
    };

    setProducts([newProduct, ...products]);
    reset({ sku: "", name: "", qty: "", location: "" }); // Reset sạch form cho lần sau
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* THANH TIÊU ĐỀ & NÚT MỞ MODAL */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý sản phẩm
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Danh mục quản lý mã SKU tự động, số lượng tồn và vị trí lưu trữ thực
            tế.
          </p>
        </div>
        <button
          onClick={() => {
            reset({ sku: "", name: "", qty: "", location: "" });
            setIsOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2"
        >
          <span>➕</span>
          <span>Thêm sản phẩm mới</span>
        </button>
      </div>

      {/* THANH TÌM KIẾM SƠ BỘ */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm bằng tên hoặc mã SKU..."
          className="w-full max-w-md px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-slate-800"
        />
      </div>

      {/* BẢNG HIỂN THỊ DANH SÁCH SẢN PHẨM */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-xs font-bold uppercase bg-slate-50">
                <th className="py-3 px-6">Mã SKU Hệ thống</th>
                <th className="py-3 px-6">Tên sản phẩm</th>
                <th className="py-3 px-6">Số lượng tồn</th>
                <th className="py-3 px-6">Vị trí lưu trữ</th>
                <th className="py-3 px-6">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {products.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-4 px-6 font-mono text-xs text-emerald-600 font-bold bg-slate-50/50">
                    {item.sku}
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-900">
                    {item.name}
                  </td>
                  <td
                    className={`py-4 px-6 font-bold ${
                      item.status === "Cạn kiệt"
                        ? "text-red-600"
                        : item.status === "Dưới hạn mức"
                        ? "text-amber-600"
                        : "text-slate-700"
                    }`}
                  >
                    {item.qty} cái
                  </td>
                  <td className="py-4 px-6 text-slate-500 font-medium">
                    {item.location}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-1 text-xs rounded-md font-semibold ${
                        item.status === "Cạn kiệt"
                          ? "bg-red-100 text-red-700"
                          : item.status === "Dưới hạn mức"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. GIAO DIỆN MODAL HỘP THOẠI (CHỈ XUẤT HIỆN KHI ISOPEN = TRUE) */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Khai báo sản phẩm mới
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Ô CHỌN VỊ TRÍ KHO (ĐƯA LÊN TRƯỚC ĐỂ SINH SKU) */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Vị trí lưu trữ thực tế
                </label>
                <select
                  {...register("location")}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                >
                  <option value="">-- Chọn vị trí kho còn trống --</option>
                  {availableLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc} (Sẵn sàng)
                    </option>
                  ))}
                </select>
                {availableLocations.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ Toàn bộ các kệ kho hiện tại đã đầy!
                  </p>
                )}
                {errors.location && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.location.message}
                  </p>
                )}
              </div>

              {/* Ô MÃ SKU (BỊ KHÓA - HỆ THỐNG TỰ ĐIỀN) */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Mã SKU Hệ thống (Tự động)
                </label>
                <input
                  type="text"
                  placeholder="Hãy chọn vị trí kho để sinh mã..."
                  {...register("sku")}
                  readOnly
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-100 text-emerald-600 font-mono font-bold cursor-not-allowed focus:outline-none shadow-inner"
                />
                {errors.sku && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.sku.message}
                  </p>
                )}
              </div>

              {/* Ô nhập Tên Sản Phẩm */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên sản phẩm"
                  {...register("name")}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Ô nhập Số Lượng */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Số lượng tồn kho
                </label>
                <input
                  type="text"
                  placeholder="0"
                  {...register("qty")}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                />
                {errors.qty && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.qty.message}
                  </p>
                )}
              </div>

              {/* CÁC NÚT ĐIỀU KHIỂN */}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    reset();
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={availableLocations.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  Lưu sản phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
