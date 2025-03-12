
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

// Define proper types for ServiceWorker related interfaces
interface ServiceWorkerRegistration {
  waiting: ServiceWorker | null;
  installing: ServiceWorker | null;
  updatefound: Event;
  addEventListener: (event: string, callback: Function) => void;
}

interface ServiceWorker {
  state: string;
  postMessage: (data: any) => void;
  addEventListener: (event: string, callback: Function) => void;
}

interface NavigatorWithServiceWorker extends Navigator {
  serviceWorker: {
    register: (path: string) => Promise<ServiceWorkerRegistration>;
    controller: ServiceWorker | null;
    addEventListener: (event: string, callback: Function) => void;
  };
}

// React functional component
export function UpdateNotification() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const nav = navigator as NavigatorWithServiceWorker;
      
      nav.serviceWorker.register('/sw.js').then(reg => {
        if (reg.waiting) {
          setWaitingWorker(reg.waiting);
          showUpdateToast();
        }
        
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && nav.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                showUpdateToast();
              }
            });
          }
        });
      }).catch(error => {
        console.error('Service worker registration failed:', error);
      });
      
      let refreshing = false;
      nav.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const showUpdateToast = () => {
    toast({
      title: 'Update Available',
      description: 'A new version of the app is available!',
      action: (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={updateServiceWorker}
        >
          Reload
        </Button>
      ),
      duration: Infinity
    });
  };
  
  const updateServiceWorker = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };
  
  return null;
}
