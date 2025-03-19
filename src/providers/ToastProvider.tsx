import React from "react";
import { Toaster } from "@/components/ui/toaster";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <Toaster />
    </div>
  );
}