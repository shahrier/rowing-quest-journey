
import { useState, useEffect } from 'react';
import { toast } from "sonner";

export function UpdateNotification() {
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Setup service worker update handling
    if ('serviceWorker' in navigator) {
      // When a new service worker is available
      window.addEventListener('sw-update-found', () => {
        toast.custom((id) => (
          <div className="bg-background border rounded-lg shadow-lg p-4 mb-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Update available</h3>
                <p className="text-sm text-muted-foreground">A new version of the app is available</p>
              </div>
              <button 
                className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm"
                onClick={() => {
                  setRefreshing(true);
                  window.location.reload();
                  toast.dismiss(id);
                }}
              >
                {refreshing ? "Updating..." : "Update now"}
              </button>
            </div>
          </div>
        ), {
          duration: Infinity,
        });
      });
    }
  }, []);

  return null;
}
