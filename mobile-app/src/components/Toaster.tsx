"use client";

import { useToastStore, type ToastType } from "@/store/useToastStore";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

function toastStyles(type: ToastType) {
  switch (type) {
    case "success":
      return {
        wrap: "border-emerald-200 bg-emerald-50 text-emerald-900",
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      };
    case "error":
      return {
        wrap: "border-rose-200 bg-rose-50 text-rose-900",
        icon: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
      };
    default:
      return {
        wrap: "border-slate-200 bg-white text-slate-900",
        icon: <Info className="w-5 h-5 text-slate-500 shrink-0" />,
      };
  }
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex max-w-[min(420px,calc(100vw-2rem))] flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const { wrap, icon } = toastStyles(t.type);
        return (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg shadow-slate-900/10 ${wrap}`}
          >
            {icon}
            <p className="text-sm font-medium leading-snug flex-1">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="rounded-lg p-1 text-current opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
