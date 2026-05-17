import { create } from "zustand";

interface AdminState {
  adminName: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  adminName: "Trần Minh Đức",
  isSidebarOpen: true,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
