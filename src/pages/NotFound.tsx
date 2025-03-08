
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
      <div className="space-y-6 max-w-md">
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-ocean-500 to-energy-500 blur opacity-70"></div>
          <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-ocean-700 text-white text-5xl font-bold mx-auto">
            404
          </div>
        </div>
        
        <h1 className="text-3xl font-bold">Page Not Found</h1>
        
        <p className="text-muted-foreground">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        
        <Button asChild className="mt-4">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
