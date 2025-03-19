import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container mx-auto py-8 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-6">The page you are looking for does not exist.</p>
      <Link 
        to="/" 
        className="bg-primary text-primary-foreground px-4 py-2 rounded"
      >
        Return to Home
      </Link>
    </div>
  );
}