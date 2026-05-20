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
      const userRaw = localStorage.getItem("user");
      let parsedUser: { username?: string; role?: string } | null = null;

      if (userRaw) {
        try {
          parsedUser = JSON.parse(userRaw);
        } catch {
          parsedUser = null;
        }
      }

      const name =
        localStorage.getItem("userName") ||
        parsedUser?.username ||
        "Người dùng";
      const role =
        localStorage.getItem("userRole") || parsedUser?.role || "User";

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
