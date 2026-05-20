"use client";

import React, { useEffect, useState } from "react";
import ProductQR from "@/components/productQR";
import {
  Package,
  AlertTriangle,
  LayoutGrid,
  MapPin,
  Trash2,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import AddProductModal from "@/components/AddProductModal";
import { useWarehouseStore } from "@/store/useWarehouseStore";
import { useToastStore } from "@/store/useToastStore";
import { isAdminUser } from "@/lib/authRole";
import { getFetchErrorMessage } from "@/lib/apiError";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function ProductsPage() {
  const products = useWarehouseStore((state) => state.products);
  const isLoading = useWarehouseStore((state) => state.isLoading);
  const fetchProducts = useWarehouseStore((state) => state.fetchProducts);
  const deleteProduct = useWarehouseStore((state) => state.deleteProduct);
  const toast = useToastStore((s) => s.show);

  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setIsAdmin(isAdminUser());
  }, []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteProduct(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);
    if (result.ok) {
      toast("Đã xóa sản phẩm.", "success");
    } else {
      toast(result.message, "error");
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/inventory/export-excel`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const msg = await getFetchErrorMessage(
          response,
          "Không thể xuất file Excel."
        );
        throw new Error(msg);
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
      toast("Đã tải file Excel.", "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi xuất Excel.",
        "error"
      );
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-slate-50/40">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          Đang tải danh mục sản phẩm...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto min-h-screen bg-slate-50/40">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-slate-700" /> Danh mục sản phẩm
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin
              ? "Bạn đang dùng quyền Admin: có thể xóa sản phẩm và xuất Excel."
              : "Tài khoản thường: chỉ xem và thêm sản phẩm; xóa / xuất Excel cần Admin."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={isExporting}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:pointer-events-none text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              {isExporting ? "Đang xuất..." : "Xuất Excel Kho Hàng"}
            </button>
          ) : (
            <span
              className="text-xs text-slate-400 max-w-[200px] leading-snug"
              title="Chỉ Admin mới xuất Excel theo cấu hình API."
            >
              Xuất Excel: cần quyền Admin
            </span>
          )}
          <AddProductModal onSuccess={fetchProducts} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {products.map((product) => {
          const isLowStock = product.quantity < product.minQuantity;
          return (
            <div
              key={product._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 block shadow-inner">
                    <Package className="w-5 h-5 text-slate-500" />
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isLowStock && (
                      <span className="flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-bold px-2 py-1 rounded-lg">
                        <AlertTriangle className="w-3 h-3" /> Cần nhập thêm
                      </span>
                    )}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            id: product._id,
                            name: product.name,
                          })
                        }
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span>
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

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
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
                <ProductQR sku={product.sku} name={product.name} />
              </div>
            </div>
          );
        })}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <h2
              id="confirm-delete-title"
              className="text-lg font-semibold text-slate-900"
            >
              Xóa sản phẩm?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Bạn có chắc muốn xóa{" "}
              <span className="font-semibold text-slate-900">
                “{deleteTarget.name}”
              </span>{" "}
              khỏi danh mục? Thao tác này chỉ dành cho Admin.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {isDeleting && (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                )}
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
