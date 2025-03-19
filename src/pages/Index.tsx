import React from "react";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to RowQuest</h1>
      <p className="mb-4">Track your rowing journey to your destination.</p>
      <div className="flex gap-4">
        <Link 
          to="/login" 
          className="bg-primary text-primary-foreground px-4 py-2 rounded"
        >
          Login / Register
        </Link>
      </div>
    </div>
  );
}