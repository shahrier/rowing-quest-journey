
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const UpdateNotification = () => {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showReload, setShowReload] = useState<boolean>(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker);
              setShowReload(true);
              
              toast('Update Available', {
                description: 'A new version is available. Click here to update.',
                action: {
                  label: 'Update',
                  onClick: () => {
                    if (waitingWorker) {
                      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
                      waitingWorker.addEventListener('statechange', () => {
                        if (waitingWorker.state === 'activated') {
                          window.location.reload();
                        }
                      });
                    }
                  }
                }
              });
            }
          });
        });
      });
    }
  }, [waitingWorker]);

  return null; // This component doesn't render anything visible
};
