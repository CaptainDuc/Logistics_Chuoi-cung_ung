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
  updateProduct: (id: number, updatedProduct: Partial<Product>) => void; // Thêm dòng này
  deleteProduct: (id: number) => void; // Thêm dòng này
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
        p.id === id ? { ...p, ...updatedProduct } : p
      ),
    })),

  // Action: Xóa sản phẩm khỏi danh sách (Thêm mới)
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),

  // Action: Lập phiếu nhập kho bổ sung ➜ Tự động cộng dồn số lượng tồn 'qty'
  addInboundTicket: (ticket) =>
    set((state) => {
      const targetProduct = state.products.find(
        (p) => p.sku === ticket.productSku
      );
      const updatedProducts = state.products.map((p) =>
        p.sku === ticket.productSku ? { ...p, qty: p.qty + ticket.qty } : p
      );

      const newInbound: InboundTicket = {
        id: `IP-2026-00${state.inboundTickets.length + 1}`,
        productSku: ticket.productSku,
        name: targetProduct ? targetProduct.name : "Sản phẩm không rõ",
        qty: ticket.qty,
        date: new Date().toISOString().replace("T", " ").substring(0, 16),
        handler: "Trần Minh Đức",
        note: ticket.note,
      };

      return {
        products: updatedProducts,
        inboundTickets: [newInbound, ...state.inboundTickets],
      };
    }),

  // Action: Lập phiếu xuất kho ➜ Tự động trừ số lượng tồn 'qty'
  addOutboundTicket: (ticket) =>
    set((state) => {
      const targetProduct = state.products.find(
        (p) => p.sku === ticket.productSku
      );
      const updatedProducts = state.products.map((p) =>
        p.sku === ticket.productSku ? { ...p, qty: p.qty - ticket.qty } : p
      );

      const newOutbound: OutboundTicket = {
        id: `OP-2026-00${state.outboundTickets.length + 1}`,
        productSku: ticket.productSku,
        name: targetProduct ? targetProduct.name : "Sản phẩm không rõ",
        qty: ticket.qty,
        date: new Date().toISOString().replace("T", " ").substring(0, 16),
        handler: "Trần Minh Đức",
        customerName: ticket.customerName,
      };

      return {
        products: updatedProducts,
        outboundTickets: [newOutbound, ...state.outboundTickets],
      };
    }),
}));
