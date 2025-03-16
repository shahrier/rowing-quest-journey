import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="space-y-4">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 blur opacity-70"></div>
          <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-blue-700 text-white text-4xl font-bold">
            404
          </div>
        </div>
        
        <h1 className="text-3xl font-bold">Page Not Found</h1>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Button asChild className="mt-6">
          <Link to="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}