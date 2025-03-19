import React, { Suspense, lazy, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./providers/ThemeProvider";
import { ToastProvider } from "./providers/ToastProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import { verifySupabaseConnection } from "./lib/supabase";

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
  console.log("🏁 App component rendering started");
  
  const [appReady, setAppReady] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);
  const [dbStatus, setDbStatus] = useState<{connected: boolean, error?: string} | null>(null);

  // Initialize app and handle any startup errors
  useEffect(() => {
    console.log("⚙️ App useEffect initialization started");
    
    const initializeApp = async () => {
      console.log("🔄 Starting app initialization process");
      
      try {
        // Check environment variables
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
          console.warn("⚠️ Supabase environment variables are missing. App may not function correctly.");
        }
        
        // Verify database connection
        console.log("🔌 Verifying database connection");
        const connectionStatus = await verifySupabaseConnection();
        setDbStatus({
          connected: connectionStatus.connected,
          error: connectionStatus.error
        });
        
        if (!connectionStatus.connected) {
          console.warn("⚠️ Database connection issue:", connectionStatus.error);
          // We'll continue even if DB connection fails, but log the issue
        }
        
        // Add any other initialization logic here
        console.log("✅ App initialization checks completed");
        
        // App is ready to render
        setAppReady(true);
      } catch (error) {
        console.error("❌ Failed to initialize app:", error);
        setInitError(error instanceof Error ? error : new Error("Failed to initialize application"));
      }
    };

    initializeApp();
    
    return () => {
      console.log("🧹 App component cleanup");
    };
  }, []);

  // Log render state
  useEffect(() => {
    console.log("📊 App render state:", { 
      appReady, 
      hasError: !!initError,
      dbConnected: dbStatus?.connected
    });
  }, [appReady, initError, dbStatus]);

  // Show loading state while initializing
  if (!appReady && !initError) {
    console.log("⏳ App showing loading state");
    return <LoadingFallback />;
  }

  // Show error if initialization failed
  if (initError) {
    console.error("❌ App showing error state:", initError.message);
    return <ErrorFallback error={initError} />;
  }

  // Show warning if database connection failed but continue rendering
  if (dbStatus && !dbStatus.connected) {
    console.warn("⚠️ Continuing with app render despite database connection issues");
  }

  console.log("🖌️ Rendering main App component tree");
  
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system">
        <ToastProvider>
          <BrowserRouter>
            <div className="app-container min-h-screen bg-background text-foreground">
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<Index />} />
                  <Route path="/not-found" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/not-found" replace />} />
                </Routes>
              </Suspense>
              
              {/* Database connection warning */}
              {dbStatus && !dbStatus.connected && (
                <div className="fixed bottom-4 left-4 right-4 bg-yellow-100 dark:bg-yellow-900/70 text-yellow-800 dark:text-yellow-200 p-3 rounded-md text-sm border border-yellow-200 dark:border-yellow-800">
                  <strong>Warning:</strong> Database connection issue. Some features may not work correctly.
                  <button 
                    onClick={() => window.location.reload()} 
                    className="ml-2 underline"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;