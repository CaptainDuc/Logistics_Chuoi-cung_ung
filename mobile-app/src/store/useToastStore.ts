import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
};

type ToastState = {
  toasts: ToastItem[];
  show: (message: string, type?: ToastType) => void;
  dismiss: (id: string) => void;
};

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  show: (message, type = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    window.setTimeout(() => {
      get().dismiss(id);
    }, 4800);
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
