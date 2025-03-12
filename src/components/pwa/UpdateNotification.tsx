
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export function UpdateNotification() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showReload, setShowReload] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        setRegistration(registration);
        
        // If a waiting worker exists, show the update notification
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowReload(true);
        }
        
        // Listen for new updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                
                toast({
                  title: 'Update Available',
                  description: 'A new version of the app is available!',
                  action: (
                    <Button variant="outline" size="sm" onClick={updateServiceWorker}>
                      Reload
                    </Button>
                  ),
                  duration: Infinity
                });
              }
            });
          }
        });
      }).catch(error => {
        console.error('Service worker registration failed:', error);
      });
      
      // Handle controller change
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);
  
  const updateServiceWorker = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };
  
  return null;
}
