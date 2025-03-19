import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4 text-center"
      data-oid="bn85f1s"
    >
      <div className="space-y-4" data-oid="_0n0h8i">
        <div className="relative w-24 h-24 mx-auto" data-oid="bf0:57y">
          <div
            className="absolute -inset-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 blur opacity-70"
            data-oid="n4q8j-7"
          ></div>
          <div
            className="relative flex items-center justify-center h-24 w-24 rounded-full bg-blue-700 text-white text-4xl font-bold"
            data-oid="va35mit"
          >
            404
          </div>
        </div>

        <h1 className="text-3xl font-bold" data-oid="ltnjtus">
          Page Not Found
        </h1>

        <p
          className="text-muted-foreground max-w-md mx-auto"
          data-oid="g1x_8bi"
        >
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Button asChild className="mt-6" data-oid=":s5k58f">
          <Link to="/" className="flex items-center gap-2" data-oid="1v41l.e">
            <Home className="h-4 w-4" data-oid="-byoysj" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
