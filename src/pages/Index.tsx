import React, { useEffect } from "react";
import { Link } from "react-router-dom";

export default function Index() {
  useEffect(() => {
    console.log("Index page mounted");
    
    // Log DOM structure for debugging
    const rootElement = document.getElementById("root");
    if (rootElement) {
      console.log("Root element found with children:", rootElement.childElementCount);
    } else {
      console.warn("Root element not found in DOM");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="mx-auto relative w-24 h-24">
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 blur opacity-70"></div>
          <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-blue-700 text-white text-4xl font-bold">
            R
          </div>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold">Welcome to RowQuest</h1>
          <p className="mt-2 text-muted-foreground">
            Track your rowing journey to your destination
          </p>
        </div>
        
        <div className="pt-4">
          <Link 
            to="/login" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Login / Register
          </Link>
        </div>
        
        <div className="pt-4 text-sm text-muted-foreground">
          <p>
            If you're experiencing issues, visit our{" "}
            <Link to="/troubleshooting" className="text-primary hover:underline">
              troubleshooting page
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}