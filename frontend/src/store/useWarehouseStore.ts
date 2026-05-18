import { create } from "zustand";

// 1. Định nghĩa kiểu dữ liệu chuẩn chỉnh cho từng thực thể
export interface Product {
  id: number;
  sku: string;
  name: string;
  location: string;
  qty: number;
}

export interface InboundTicket {
  id: string;
  productSku: string;
  name: string;
  qty: number;
  date: string;
  handler: string;
  note: string;
}

export interface OutboundTicket {
  id: string;
  productSku: string;
  name: string;
  qty: number;
  date: string;
  handler: string;
  customerName: string; // Đồng bộ trường này xuyên suốt hệ thống
}

// 2. Cấu trúc State và Action của Warehouse Store
interface WarehouseState {
  products: Product[];
  inboundTickets: InboundTicket[];
  outboundTickets: OutboundTicket[];
  isLoading: boolean;
  initializeData: () => void;
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (
    id: number | string,
    updatedProduct: Partial<Product>
  ) => void;
  deleteProduct: (id: number | string) => void;
  addInboundTicket: (
    ticket: Omit<InboundTicket, "id" | "date" | "handler" | "name">
  ) => void;
  addOutboundTicket: (
    ticket: Omit<OutboundTicket, "id" | "date" | "handler" | "name">
  ) => void;
}

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
  products: [],
  inboundTickets: [],
  outboundTickets: [],
  isLoading: true,

  // Khởi tạo dữ liệu ban đầu
  initializeData: () => {
    if (get().products.length > 0) return;

    set({ isLoading: true });
    setTimeout(() => {
      set({
        products: [
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
          {
            id: 3,
            sku: "SKU-C2-4915",
            name: "Hộp carton đóng gói size M",
            location: "Khu C - Kệ 2",
            qty: 12,
          },
        ],
        inboundTickets: [
          {
            id: "IP-2026-001",
            productSku: "SKU-B3-8842",
            name: "iPhone 17 Pro Max 256GB",
            qty: 20,
            date: "2026-05-15 09:30",
            handler: "Trần Minh Đức",
            note: "Nhập hàng bổ sung đợt 1",
          },
        ],
        outboundTickets: [
          {
            id: "OP-2026-001",
            productSku: "SKU-C2-4915",
            name: "Hộp carton đóng gói size M",
            qty: 5,
            date: "2026-05-17 10:15",
            handler: "Trần Minh Đức",
            customerName: "Cửa hàng Đại lý Quận 9",
          },
        ],
        isLoading: false,
      });
    }, 1000);
  },

  // Action: Thêm mới sản phẩm gốc vào kho
  addProduct: (newProd) =>
    set((state) => ({
      products: [
        { id: state.products.length + 1, ...newProd },
        ...state.products,
      ],
    })),

  // Action: Cập nhật thông tin sản phẩm (Thêm mới)
  updateProduct: (id, updatedProduct) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id.toString() === id.toString() ? { ...p, ...updatedProduct } : p
      ),
    })),

  // Action: Xóa sản phẩm khỏi danh sách (Thêm mới)
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id.toString() !== id.toString()),
    })),

  // Action: Lập phiếu nhập kho bổ sung ➜ Tự động cộng dồn số lượng tồn 'qty'
  addInboundTicket: (ticket) => {
    const newTicket = {
      ...ticket,
      id: `IN-${Date.now()}`,
      date: new Date().toLocaleDateString("vi-VN"),
    } as InboundTicket;

    set((state) => {
      // Tìm sản phẩm trong kho để cộng thêm số lượng
      const updatedProducts = state.products.map((p) => {
        if (p.sku === ticket.productSku) {
          return { ...p, qty: p.qty + ticket.qty }; // Cộng thêm hàng vào kho
        }
        return p;
      });

      return {
        inboundTickets: [newTicket, ...state.inboundTickets],
        products: updatedProducts, // Cập nhật lại danh sách sản phẩm mới
      };
    });
  },

  // Action: Lập phiếu xuất kho ➜ Tự động trừ số lượng tồn 'qty'
  addOutboundTicket: (ticket) => {
    const newTicket = {
      ...ticket,
      id: `OUT-${Date.now()}`,
      date: new Date().toLocaleDateString("vi-VN"),
    } as OutboundTicket;

    set((state) => {
      // Tìm sản phẩm trong kho để trừ bớt số lượng
      const updatedProducts = state.products.map((p) => {
        if (p.sku === ticket.productSku) {
          // Trừ bớt hàng, đảm bảo không giảm xuống dưới 0
          const newQty = p.qty - ticket.qty;
          return { ...p, qty: newQty < 0 ? 0 : newQty };
        }
        return p;
      });

      return {
        outboundTickets: [newTicket, ...state.outboundTickets],
        products: updatedProducts, // Cập nhật lại danh sách sản phẩm mới
      };
    });
  },
}));
