import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  console.log("🔔 ToastProvider rendering");
  
  useEffect(() => {
    console.log("✅ ToastProvider mounted");
    
    // Check if Toaster component is properly defined
    if (typeof Toaster !== 'function') {
      console.error("❌ Toaster component is not properly defined:", Toaster);
    } else {
      console.log("✅ Toaster component is properly defined");
    }
    
    return () => {
      console.log("🧹 ToastProvider cleanup");
    };
  }, []);
  
  return (
    <div className="toast-provider-wrapper relative" data-testid="toast-provider">
      {children}
      <Toaster />
    </div>
  );
}