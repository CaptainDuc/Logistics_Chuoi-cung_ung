import { create } from "zustand";

interface AdminState {
  isSidebarOpen: boolean;
  adminName: string;
  adminRole: string; // Thêm biến lưu chức vụ (Admin, Kiểm kho, Thủ kho...)
  toggleSidebar: () => void;
  setAdminInfo: (name: string, role: string) => void; // Hàm để nạp cả tên và chức vụ khi đăng nhập
  clearStore: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  isSidebarOpen: true,
  adminName: "Trần Minh Đức", // Tên mặc định ban đầu
  adminRole: "Admin", // Chức vụ mặc định ban đầu

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  // Hàm dùng để cập nhật thông tin động sau này khi kết nối API đăng nhập thành công
  setAdminInfo: (name, role) => set({ adminName: name, adminRole: role }),

  // Hàm xóa sạch dữ liệu store khi bấm nút Đăng xuất
  clearStore: () => set({ adminName: "", adminRole: "" }),
}));
