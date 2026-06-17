import { create } from "zustand";
import axios from "axios";
import { backendBaseUrl } from "@/lib/api";

// Định nghĩa đầy đủ kiểu dữ liệu cấu trúc Sản phẩm
interface Product {
  _id: string;
  sku: string;
  name: string;
  location?: string;
  quantity: number;
  minQuantity: number;
  supplierId?: string | null;
  status?: string;
  category?: string;
  trangThaiTonKho?: string;
}

// Định nghĩa chi tiết cấu trúc Giao dịch phục vụ xem Pop-up
interface Transaction {
  _id: string;
  name: string;
  sku: string;
  location: string;
  type: "Import" | "Export";
  quantity: number;
  date: string;
  executor: {
    username: string;
    role: string;
  };
}

interface WarehouseState {
  products: Product[];
  transactions: Transaction[];
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  addInventoryTransaction: (args: {
    sku: string;
    type: "Import" | "Export";
    quantity: number;
    customerName?: string;
    customerId?: string;
    supplierId?: string; 
    note?: string; 
  }) => Promise<{ ok: boolean; message: string }>;
  addProduct: (
    product: Omit<Product, "_id" | "trangThaiTonKho">,
  ) => Promise<{ ok: boolean; message: string }>;
  deleteProduct: (id: string) => Promise<{ ok: boolean; message: string }>;
}

const API_URL = backendBaseUrl.endsWith("/api")
  ? backendBaseUrl
  : `${backendBaseUrl}/api`;

const getAuthHeader = () => {
  if (typeof window === "undefined") return {};
  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

let isRedirecting = false;

const clearAuthAndRedirect = () => {
  if (typeof window === "undefined" || isRedirecting) return;

  isRedirecting = true;
  localStorage.clear();
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  window.location.href = "/login";
};

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
  products: [],
  transactions: [],
  isLoading: false,

  // ĐÃ UPDATE NHẬN ĐẦY ĐỦ THAM SỐ VÀ GỬI LÊN SERVER
  addInventoryTransaction: async ({
    sku,
    type,
    quantity,
    customerName,
    supplierId,
    note,
  }) => {
    try {
      const response = await axios.post(
        `${API_URL}/inventory/scan`,
        { sku, type, quantity, customerName, supplierId, note }, // Gửi kèm lên API backend
        { headers: getAuthHeader() },
      );

      if (response.data?.success) {
        await get().fetchProducts();
        await get().fetchTransactions();
        return {
          ok: true,
          message: response.data?.message || "Giao dịch thành công",
        };
      }
      return {
        ok: false,
        message: response.data?.message || "Lỗi không xác định",
      };
    } catch (error: any) {
      return {
        ok: false,
        message: error.response?.data?.message || "Lỗi kết nối Server",
      };
    }
  },

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/products`, {
        headers: getAuthHeader(),
      });
      if (response.data.success) {
        set({ products: response.data.data });
      }
    } catch (error: any) {
      if (error.response?.status === 401) clearAuthAndRedirect();
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTransactions: async () => {
    try {
      const response = await axios.get(`${API_URL}/inventory/logs`, {
        headers: getAuthHeader(),
      });
      if (response.data.success) {
        const mapped = (response.data.data || []).map((t: any) => ({
          _id: t._id,
          name: t.productId?.name || "Sản phẩm đã xóa",
          sku: t.productId?.sku || "N/A",
          location: t.productId?.location || "Chưa định vị",
          type: t.type,
          quantity: t.quantity || 0,
          date: new Date(t.createdAt).toLocaleString("vi-VN"),
          executor: {
            username: t.userId?.username || "Ẩn danh",
            role: t.userId?.role || "User",
          },
        }));
        set({ transactions: mapped });
      }
    } catch (error: any) {
      if (error.response?.status === 401) clearAuthAndRedirect();
    }
  },

  addProduct: async (product) => {
    try {
      const response = await axios.post(`${API_URL}/products`, product, {
        headers: getAuthHeader(),
      });
      if (response.data.success) {
        await get().fetchProducts();
        return { ok: true, message: "Thêm thành công" };
      }
      return {
        ok: false,
        message: response.data.message || "Lỗi không xác định",
      };
    } catch (error) {
      return { ok: false, message: "Lỗi kết nối Server" };
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/products/${id}`, {
        headers: getAuthHeader(),
      });
      if (response.data.success) {
        await get().fetchProducts();
        return { ok: true, message: "Xóa thành công" };
      }
      return { ok: false, message: response.data.message || "Lỗi khi xóa" };
    } catch (error) {
      return { ok: false, message: "Lỗi kết nối Server" };
    }
  },
}));
