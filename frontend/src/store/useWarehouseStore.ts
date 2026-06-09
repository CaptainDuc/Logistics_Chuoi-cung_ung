// src/store/useWarehouseStore.ts
import { create } from "zustand";
import axios from "axios";
import { getApiErrorMessage } from "@/lib/apiError";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type MutationResult =
  | { ok: true }
  | { ok: false; message: string };

const getAuthHeader = () => {
  if (typeof window === "undefined") return {};
  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

const clearAuthAndRedirect = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userName");
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

export interface Product {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
  minQuantity: number;
  location?: string;
  supplierId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  trangThaiTonKho?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedProducts {
  products: Product[];
  pagination: PaginationInfo;
}

interface Transaction {
  _id: string;
  name: string;
  type: "Import" | "Export";
  quantity: number;
  date: string;
  badgeColor?: string;
}

interface WarehouseState {
  products: Product[];
  pagination: PaginationInfo | null;
  transactions: Transaction[];
  isLoading: boolean;
  addInventoryTransaction: (data: {
    sku: string;
    type: "Import" | "Export";
    quantity: number;
  }) => Promise<MutationResult>;
  fetchProducts: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => Promise<PaginatedProducts>;
  fetchTransactions: () => Promise<void>;
  addProduct: (product: Omit<Product, "_id">) => Promise<MutationResult>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<MutationResult>;
}

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
  products: [],
  pagination: null,
  transactions: [],
  isLoading: false,

  addInventoryTransaction: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/inventory/scan`, data, {
        headers: getAuthHeader(),
      });
      if (response.data?.success) {
        await get().fetchProducts();
        await get().fetchTransactions();
        return { ok: true };
      }
      const msg =
        (response.data as { message?: string })?.message ||
        "Giao dịch không thành công.";
      return { ok: false, message: msg };
    } catch (error) {
      console.error("Add inventory transaction error:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearAuthAndRedirect();
      }
      return { ok: false, message: getApiErrorMessage(error) };
    }
  },

  fetchProducts: async (params = {}) => {
    set({ isLoading: true });
    try {
      const { page = 1, limit = 20, search = "" } = params;
      const query = new URLSearchParams();
      query.append("page", String(page));
      query.append("limit", String(limit));
      if (search) query.append("search", search);

      const response = await axios.get(`${API_URL}/products?${query.toString()}`, {
        headers: getAuthHeader(),
      });

      if (response.data?.success) {
        const productsData = response.data.data || [];
        const paginationData = response.data.pagination || null;
        set({ products: productsData, pagination: paginationData });
        return { products: productsData, pagination: paginationData };
      }

      set({ products: [], pagination: null });
      return { products: [], pagination: null };
    } catch (error: any) {
      console.error("Lỗi fetchProducts:", error);
      if (error.response?.status === 401) clearAuthAndRedirect();
      set({ products: [], pagination: null });
      return { products: [], pagination: null };
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTransactions: async () => {
    try {
      const response = await axios.get(`${API_URL}/inventory/logs`, {
        headers: getAuthHeader(),
      });

      const mappedTransactions = (response.data.data || []).map((t: any) => ({
        _id: t._id,
        name: t.productId?.name || "Không rõ sản phẩm",
        type: t.type,
        quantity: t.quantity || 0,
        date: new Date(t.createdAt).toLocaleDateString("vi-VN"),
        badgeColor:
          t.type === "Import"
            ? "bg-blue-50 border-blue-200 text-blue-600"
            : "bg-rose-50 border-rose-200 text-rose-600",
      }));

      set({ transactions: mappedTransactions });
    } catch (error) {
      console.error("Fetch transactions error:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearAuthAndRedirect();
      }
    }
  },

  addProduct: async (product) => {
    try {
      const response = await axios.post(`${API_URL}/products`, product, {
        headers: getAuthHeader(),
      });
      if (response.data?.success) {
        await get().fetchProducts();
        return { ok: true };
      }
      const msg =
        (response.data as { message?: string })?.message ||
        "Thêm sản phẩm thất bại.";
      return { ok: false, message: msg };
    } catch (error) {
      console.error("Lỗi addProduct:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearAuthAndRedirect();
      }
      return { ok: false, message: getApiErrorMessage(error) };
    }
  },

  updateProduct: async (id, product) => {
    try {
      const response = await axios.put(`${API_URL}/products/${id}`, product, {
        headers: getAuthHeader(),
      });
      if (response.data?.success) {
        await get().fetchProducts();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi updateProduct:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearAuthAndRedirect();
      }
      return false;
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/products/${id}`, {
        headers: getAuthHeader(),
      });
      if (response.data?.success) {
        await get().fetchProducts();
        return { ok: true };
      }
      const msg =
        (response.data as { message?: string })?.message ||
        "Xóa sản phẩm thất bại.";
      return { ok: false, message: msg };
    } catch (error) {
      console.error("Lỗi deleteProduct:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearAuthAndRedirect();
      }
      return { ok: false, message: getApiErrorMessage(error) };
    }
  },
}));
