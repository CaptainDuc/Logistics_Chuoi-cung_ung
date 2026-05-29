"use client";

import type { ReactNode } from "react";
import { Toaster } from "@/components/Toaster";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
