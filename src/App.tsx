import React, { Suspense, lazy, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./providers/ThemeProvider";
import { ToastProvider } from "./providers/ToastProvider";
import ErrorBoundary from "./components/ErrorBoundary";

// Simple loading component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Simple error fallback
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <div className="w-full max-w-md space-y-4 text-center">
      <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Something went wrong</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-primary text-primary-foreground rounded"
      >
        Reload Application
      </button>
    </div>
  </div>
);

// Lazy load components to reduce initial bundle size
const Login = lazy(() => import("./pages/Login"));
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => {
  const [appReady, setAppReady] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  // Initialize app and handle any startup errors
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Simulate checking environment variables
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
          console.warn("Supabase environment variables are missing. App may not function correctly.");
        }
        
        // Add any other initialization logic here
        
        // App is ready to render
        setAppReady(true);
      } catch (error) {
        console.error("Failed to initialize app:", error);
        setInitError(error instanceof Error ? error : new Error("Failed to initialize application"));
      }
    };

    initializeApp();
  }, []);

  // Show loading state while initializing
  if (!appReady && !initError) {
    return <LoadingFallback />;
  }

  // Show error if initialization failed
  if (initError) {
    return <ErrorFallback error={initError} />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system">
        <ToastProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Index />} />
                <Route path="/not-found" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/not-found" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;