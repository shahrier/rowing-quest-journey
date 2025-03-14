
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Listen for service worker updates
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });

      // Detect if there's a new service worker
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
                
                toast('App update available', {
                  description: 'Refresh the page to get the latest version',
                  action: {
                    label: 'Update now',
                    onClick: () => window.location.reload(),
                  },
                  duration: 0, // Keep it until user acts
                });
              }
            });
          }
        });
        
        // Check for updates every 1 hour
        setInterval(() => {
          registration.update().catch(console.error);
        }, 60 * 60 * 1000);
      });
    }
  }, []);

  return null;
}
