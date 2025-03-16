import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Refresh } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if the app is running as a PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;

    if ('serviceWorker' in navigator) {
      // Listen for service worker updates
      window.addEventListener('sw-update-available', () => {
        setUpdateAvailable(true);
        
        toast({
          title: 'Update Available',
          description: 'A new version of RowQuest is available. Click to update.',
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleUpdate}
              className="flex items-center gap-1"
            >
              <Refresh className="h-4 w-4" />
              Update
            </Button>
          ),
          duration: 10000, // 10 seconds
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    // Reload the page to get the new version
    window.location.reload();
  };

  return null; // This component doesn't render anything directly
}