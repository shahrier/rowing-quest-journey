import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

export function ToastProvider() {
  return (
    <>
      {/* shadcn/ui Toaster */}
      <Toaster />
      
      {/* Sonner Toaster (if you need both) */}
      <Sonner />
    </>
  );
}