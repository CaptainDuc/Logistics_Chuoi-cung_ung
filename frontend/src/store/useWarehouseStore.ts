import { create } from "zustand";
import axios from "axios";

export interface Product {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
  minQuantity: number;
  location: string;
  supplierId?: { _id: string; name: string } | null;
  trangThaiTonKho?: string;
}

// 🔥 CẬP NHẬT INTERFACE: Quản lý cả sản phẩm và nhật ký giao dịch kho
interface WarehouseState {
  products: Product[];
  transactions: any[]; // Lưu lịch sử phiếu nhập / xuất kho thật từ MongoDB
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchTransactions: () => Promise<void>; // Hàm kéo lịch sử giao dịch về Dashboard
  addProduct: (
    productData: Omit<Product, "_id" | "trangThaiTonKho">
  ) => Promise<void>;

  addInventoryTransaction: (transaction: {
    productId: string;
    type: "INBOUND" | "OUTBOUND";
    quantity: number;
    name?: string;
  }) => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
  products: [],
  transactions: [], // Khởi tạo mảng nhật ký trống sạch sẽ ban đầu
  isLoading: false,
  error: null,

  // 1. Hàm lấy danh sách sản phẩm từ Backend thật
  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/products`);
      // Backend trả về dạng { success: true, data: [...] } nên phải lấy response.data.data
      if (response.data && response.data.success) {
        set({ products: response.data.data, isLoading: false });
      } else {
        set({ products: [], isLoading: false });
      }
    } catch (error) {
      console.error("Lỗi lấy sản phẩm từ MongoDB:", error);
      set({ products: [], isLoading: false });
    }
  },

  // 2. 🔥 BỔ SUNG: Hàm lấy danh sách toàn bộ Nhật ký giao dịch từ Backend thật
  fetchTransactions: async () => {
    try {
      const response = await axios.get(`${API_URL}/inventory/transactions`);
      if (response.data && response.data.success) {
        set({ transactions: response.data.data });
      } else {
        set({ transactions: [] });
      }
    } catch (error) {
      console.error("Lỗi lấy nhật ký giao dịch từ MongoDB:", error);
      set({ transactions: [] });
    }
  },

  // 3. Hàm thêm mới một sản phẩm vào Database thật
  addProduct: async (newProduct) => {
    try {
      const response = await axios.post(`${API_URL}/products`, newProduct);
      const addedProduct = response.data.data;

      set((state) => ({
        products: [addedProduct, ...state.products],
      }));
    } catch (error) {
      console.error("Lỗi khi tạo sản phẩm trong Store:", error);
      throw error;
    }
  },

  // 4. 🔥 CẬP NHẬT HÀM: Xử lý Nhập / Xuất kho real-time tự nhảy số liệu
  addInventoryTransaction: async (transaction) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/inventory/transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });
      const result = await response.json();

      if (result.success) {
        // Sau khi tạo phiếu thành công -> Gọi lại API kéo dữ liệu mới nhất
        // của cả Sản phẩm và Giao dịch về để Dashboard tự nhảy số real-time!
        await get().fetchProducts();
        await get().fetchTransactions();
      } else {
        set({
          error: result.message || "Giao dịch bãi kho thất bại!",
          isLoading: false,
        });
      }
    } catch (error: any) {
      console.error("Lỗi khi gửi phiếu nhập/xuất kho:", error);
      set({
        error: error.message || "Lỗi kết nối hệ thống!",
        isLoading: false,
      });
    }
  },
}));
