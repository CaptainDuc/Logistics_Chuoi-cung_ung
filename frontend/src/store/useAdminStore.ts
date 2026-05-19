import { create } from "zustand";

interface AdminState {
  isSidebarOpen: boolean;
  adminName: string;
  adminRole: string;

  toggleSidebar: () => void;
  loadUserFromStorage: () => void;
  clearStore: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  isSidebarOpen: true,

  adminName: "",
  adminRole: "",

  toggleSidebar: () =>
    set((state) => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),

  loadUserFromStorage: () => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("userName") || "Người dùng";

      const role = localStorage.getItem("userRole") || "Staff";

      set({
        adminName: name,
        adminRole: role,
      });
    }
  },

  clearStore: () => {
    set({
      adminName: "",
      adminRole: "",
    });
  },
}));
