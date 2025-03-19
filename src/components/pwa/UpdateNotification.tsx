import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check if the app is running in a service worker environment
    if ('serviceWorker' in navigator) {
      // Listen for service worker updates
      window.addEventListener('sw-update-available', () => {
        setUpdateAvailable(true);
        
        // Show a toast notification
        toast({
          title: "Update Available",
          description: "A new version of the app is available. Click to update.",
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleUpdate}
            >
              Update
            </Button>
          ),
          duration: 0, // Don't auto-dismiss
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    // Reload the page to apply the update
    window.location.reload();
  };

  // If no update is available, don't render anything
  if (!updateAvailable) {
    return null;
  }

  // This component doesn't need to render anything visible by default
  // as we're using the toast notification system
  return null;
}