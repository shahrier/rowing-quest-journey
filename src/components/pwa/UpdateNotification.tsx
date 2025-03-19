import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export function UpdateNotification() {
  useEffect(() => {
    // Check if the app is running as a PWA
    const isPWA = window.matchMedia("(display-mode: standalone)").matches;

    if ("serviceWorker" in navigator) {
      // Listen for service worker updates
      window.addEventListener("sw-update-available", () => {
        // Show toast notification
        toast({
          title: "Update Available",
          description:
            "A new version of RowQuest is available. Click to update.",
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="flex items-center gap-1"
              data-oid="462zpp7"
            >
              <RefreshCw className="h-4 w-4" data-oid="g0n8a5_" />
              Update
            </Button>
          ),

          duration: 10000, // 10 seconds
        });
      });
    }
  }, []);

  return null; // This component doesn't render anything directly
}
