
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";

export function UpdateNotification() {
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Setup service worker update handling
    if ('serviceWorker' in navigator) {
      // When a new service worker is available
      window.addEventListener('sw-update-found', () => {
        toast({
          title: "Update available",
          description: "A new version of the app is available. Refresh to update.",
          action: (
            <button 
              className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm"
              onClick={() => {
                setRefreshing(true);
                window.location.reload();
              }}
            >
              {refreshing ? "Updating..." : "Update now"}
            </button>
          ),
          duration: 0, // Don't auto-dismiss this toast
        });
      });
    }
  }, []);

  return null;
}
