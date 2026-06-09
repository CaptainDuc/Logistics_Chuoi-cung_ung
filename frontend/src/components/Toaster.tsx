"use client";

import { useToastStore, type ToastType } from "@/store/useToastStore";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

function toastStyles(type: ToastType) {
  switch (type) {
    case "success":
      return {
        icon: "#34d399",
        iconBg: "rgba(16,185,129,0.12)",
        iconBorder: "rgba(16,185,129,0.25)",
      };
    case "error":
      return {
        icon: "#fb7185",
        iconBg: "rgba(244,63,94,0.12)",
        iconBorder: "rgba(244,63,94,0.25)",
      };
    default:
      return {
        icon: "#818cf8",
        iconBg: "rgba(99,102,241,0.12)",
        iconBorder: "rgba(99,102,241,0.25)",
      };
  }
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="toaster-container">
      {toasts.map((t) => {
        const { icon, iconBg, iconBorder } = toastStyles(t.type);
        return (
          <div key={t.id} role="status" className={`toast-item toast-${t.type}`}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: iconBg,
                border: `1px solid ${iconBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {t.type === "success" ? (
                <CheckCircle2 size={16} color={icon} />
              ) : t.type === "error" ? (
                <XCircle size={16} color={icon} />
              ) : (
                <Info size={16} color={icon} />
              )}
            </div>
            <p className="text-sm font-medium flex-1" style={{ lineHeight: 1.5 }}>
              {t.message}
            </p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              style={{
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 7,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--text-muted)",
                cursor: "pointer",
                transition: "all 0.15s ease",
                flexShrink: 0,
                fontSize: 12,
                padding: 0,
              }}
              onMouseEnter={(e) => {
                const b = e.currentTarget;
                b.style.background = "rgba(255,255,255,0.12)";
                b.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                const b = e.currentTarget;
                b.style.background = "rgba(255,255,255,0.06)";
                b.style.color = "var(--text-muted)";
              }}
              aria-label="Đóng"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
