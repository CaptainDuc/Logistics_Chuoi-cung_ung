import { create } from 'zustand';

interface ToastState {
  message: string | null;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  show: (message: string, type?: 'success' | 'error' | 'info') => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: 'info',
  isVisible: false,
  show: (message, type = 'info') => {
    set({ message, type, isVisible: true });
    setTimeout(() => {
      set({ isVisible: false });
    }, 3000);
  },
  hide: () => set({ isVisible: false }),
}));
