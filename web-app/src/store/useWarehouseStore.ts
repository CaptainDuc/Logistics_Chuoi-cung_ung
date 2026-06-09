import { create } from 'zustand';

interface Product {
  _id?: string;
  sku: string;
  name: string;
  location?: string;
  quantity: number;
  minQuantity: number;
  supplierId?: string | null;
  status?: string;
  category?: string;
}

interface WarehouseState {
  products: Product[];
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Product) => Promise<{ ok: boolean; message: string }>;
}

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
  products: [],
  isLoading: false,

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      if (data.success) {
        set({ products: data.data });
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addProduct: async (product) => {
    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      const data = await response.json();
      if (data.success) {
        set({ products: [data.data, ...get().products] });
        return { ok: true, message: 'Thêm thành công' };
      }
      return { ok: false, message: data.message || 'Lỗi không xác định' };
    } catch (error) {
      return { ok: false, message: 'Lỗi kết nối Server' };
    }
  },
}));
