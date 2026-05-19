// src/store/useWarehouseStore.ts
import { create } from "zustand";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

// 🔑 LẤY CHÍNH XÁC KEY "accessToken" MÀ LOGIN SẼ LƯU
const getAuthHeader = () => {
  if (typeof window === "undefined") {
    return {};
  }

  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken");

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

interface Product {
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
  transactions: Transaction[];
  isLoading: boolean;
  addInventoryTransaction: (data: {
    sku: string;
    type: "Import" | "Export";
    quantity: number;
  }) => Promise<boolean>;
  fetchProducts: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  addProduct: (product: Omit<Product, "_id">) => Promise<boolean>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
}

export enum TransactionType {
  INBOUND = "INBOUND",
  OUTBOUND = "OUTBOUND",
}

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
  products: [],
  transactions: [],
  isLoading: false,

  addInventoryTransaction: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/inventory/scan`, data, {
        headers: getAuthHeader(),
      });

      if (response.data.success) {
        await get().fetchProducts();
        await get().fetchTransactions();

        return true;
      }

      return false;
    } catch (error) {
      console.error("Add inventory transaction error:", error);

      return false;
    }
  },
  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/products`, {
        headers: getAuthHeader(),
      });
      if (response.data && response.data.success) {
        set({ products: response.data.data || [] });
      }
    } catch (error: any) {
      console.error("Lỗi fetchProducts:", error);
      if (error.response?.status === 401 && typeof window !== "undefined") {
        // Xóa toàn bộ auth
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        localStorage.removeItem("userRole");

        // Xóa cookie middleware
        document.cookie =
          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

        // Chỉ redirect nếu chưa ở login
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
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

      set({
        transactions: mappedTransactions,
      });
    } catch (error) {
      console.error("Fetch transactions error:", error);
    }
  },

  addProduct: async (product) => {
    try {
      const response = await axios.post(`${API_URL}/products`, product, {
        headers: getAuthHeader(),
      });
      if (response.data && response.data.success) {
        await get().fetchProducts();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi addProduct:", error);
      return false;
    }
  },

  updateProduct: async (id, product) => {
    try {
      const response = await axios.put(`${API_URL}/products/${id}`, product, {
        headers: getAuthHeader(),
      });
      if (response.data && response.data.success) {
        await get().fetchProducts();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi updateProduct:", error);
      return false;
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/products/${id}`, {
        headers: getAuthHeader(),
      });
      if (response.data && response.data.success) {
        await get().fetchProducts();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi deleteProduct:", error);
      return false;
    }
  },
}));
