"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// 1. ĐỊNH NGHĨA VALIDATION SCHEMA VỚI ZOD (Đồng bộ kiểu string với Form Input để tránh lỗi TS)
const productSchema = z.object({
  sku: z
    .string()
    .min(1, { message: "Mã SKU sẽ được hệ thống tự động sinh ra" }),
  name: z.string().min(5, { message: "Tên sản phẩm phải có ít nhất 5 ký tự" }),
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

interface ProductFormValues {
  sku: string;
  name: string;
  qty: string;
  location: string;
}

export default function ProductsPage() {
  const [isOpen, setIsOpen] = useState(false);

  // CÁC STATE QUẢN LÝ DỮ LIỆU VÀ GIẢ LẬP LOADING STATE
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Loading khi vừa vào trang
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading khi bấm submit form

  // DANH SÁCH CÁC VỊ TRÍ KHO TRỐNG KHẢ DỤNG
  const availableLocations = [
    { code: "A1", name: "Khu A - Kệ 1" },
    { code: "B3", name: "Khu B - Kệ 3" },
    { code: "C2", name: "Khu C - Kệ 2" },
    { code: "D4", name: "Khu D - Kệ 4" },
  ];

  // GIẢ LẬP ĐỘ TRỄ KHI MỞ TRANG (Mô phỏng lấy dữ liệu từ Server mất 1.5 giây)
  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts([
        {
          id: 1,
          sku: "SKU-A1-1024",
          name: "Tai nghe Sony WH-CH720N (Black)",
          location: "Khu A - Kệ 1",
          qty: 15,
        },
        {
          id: 2,
          sku: "SKU-B3-8842",
          name: "iPhone 17 Pro Max 256GB",
          location: "Khu B - Kệ 3",
          qty: 45,
        },
      ]);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // KHỞI TẠO HOOK FORM
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { sku: "HỆ THỐNG TỰ SINH", name: "", qty: "", location: "" },
  });

  // LOGIC TỰ ĐỘNG SINH MÃ SKU THEO VỊ TRÍ KHO
  const watchedLocation = watch("location");

  useEffect(() => {
    if (watchedLocation && watchedLocation !== "") {
      const randomNumber = Math.floor(1000 + Math.random() * 9000);
      const autoSku = `SKU-${watchedLocation}-${randomNumber}`;
      setValue("sku", autoSku, { shouldValidate: true });
    } else {
      setValue("sku", "HỆ THỐNG TỰ SINH");
    }
  }, [watchedLocation, setValue]);

  const generatedSku = watch("sku");

  // GIẢ LẬP LƯU DỮ LIỆU LÊN SERVER KHI SUBMIT (Mất 1 giây xử lý)
  const onSubmit = (data: ProductFormValues) => {
    setIsSubmitting(true);

    setTimeout(() => {
      const newProduct = {
        id: products.length + 1,
        sku: generatedSku,
        name: data.name,
        location:
          availableLocations.find((l) => l.code === data.location)?.name ||
          data.location,
        qty: Number(data.qty),
      };

      setProducts([newProduct, ...products]);
      setIsSubmitting(false);
      setIsOpen(false);
      reset();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & NÚT THÊM SẢN PHẨM */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý sản phẩm
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Danh mục hàng hóa tổng thể và vị trí lưu trữ trong kho bãi.
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2"
        >
          <span>➕</span>
          <span>Thêm sản phẩm mới</span>
        </button>
      </div>

      {/* HIỂN THỊ LOADING HOẶC BẢNG DỮ LIỆU */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 flex flex-col items-center justify-center space-y-3 shadow-sm">
          <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium animate-pulse">
            Đang tải danh sách kho hàng...
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs font-bold uppercase bg-slate-50">
                  <th className="py-3 px-6">Mã SKU</th>
                  <th className="py-3 px-6">Tên mặt hàng</th>
                  <th className="py-3 px-6">Vị trí kệ hàng</th>
                  <th className="py-3 px-6">Số lượng tồn</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 px-6 font-mono text-xs text-blue-600 font-bold">
                      {product.sku}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-900">
                      {product.name}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        📍 {product.location}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-700">
                      {product.qty} cái
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL THÊM SẢN PHẨM MỚI */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Khai báo thông tin hàng hóa
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* CHỌN VỊ TRÍ KHO */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Vị trí kệ xếp hàng
                </label>
                <select
                  {...register("location")}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                >
                  <option value="">-- Chọn vị trí trống --</option>
                  {availableLocations.map((loc) => (
                    <option key={loc.code} value={loc.code}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                {errors.location && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.location.message}
                  </p>
                )}
              </div>

              {/* MÃ SKU (BỊ KHÓA INPUT - CHỈ ĐỂ XEM) */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Mã SKU Hệ Thống
                </label>
                <input
                  type="text"
                  disabled
                  {...register("sku")}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-500 font-bold cursor-not-allowed"
                />
              </div>

              {/* TÊN SẢN PHẨM */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  placeholder="..."
                  {...register("name")}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* SỐ LƯỢNG BAN ĐẦU */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Số lượng nhập kho ban đầu
                </label>
                <input
                  type="text"
                  placeholder="0"
                  {...register("qty")}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
                {errors.qty && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.qty.message}
                  </p>
                )}
              </div>

              {/* NÚT ĐIỀU KHIỂN */}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsOpen(false);
                    reset();
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center space-x-2 disabled:bg-blue-400"
                >
                  {isSubmitting && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  <span>
                    {isSubmitting ? "Đang lưu kho..." : "Xác nhận thêm"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
