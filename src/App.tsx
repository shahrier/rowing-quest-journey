import { Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';
import { DatabaseProvider, useDatabaseStatus } from '@/contexts/DatabaseContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Debug } from '@/components/Debug';

function DatabaseStatusHandler({ children }: { children: React.ReactNode }) {
  const { status, error, retry, runDiagnostics } = useDatabaseStatus();
  const [showDebug, setShowDebug] = useState(false);

  if (status === 'connecting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <LoadingSpinner />
        <p className="mt-4 text-muted-foreground">Connecting to database...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full p-6 bg-card rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Connection Error</h1>
          <p className="text-muted-foreground mb-4">{error || 'Failed to connect to the database'}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              onClick={retry}
            >
              Retry Connection
            </button>
            <button
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
              onClick={() => {
                runDiagnostics();
                setShowDebug(true);
              }}
            >
              Run Diagnostics
            </button>
          </div>
          
          {showDebug && <Debug onClose={() => setShowDebug(false)} />}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  const [showDebug, setShowDebug] = useState(false);
  const isDebugMode = import.meta.env.DEV || window.location.search.includes("debug=true");

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <DatabaseProvider>
          <DatabaseStatusHandler>
            <AuthProvider>
              <ThemeProvider>
                <ToastProvider>
                  <BrowserRouter>
                    <div className="min-h-screen">
                      <Routes>
                        <Route path="/" element={<div>Home Page</div>} />
                        <Route path="/login" element={<div>Login Page</div>} />
                      </Routes>
                      
                      {/* Debug button in development or when debug=true in URL */}
                      {isDebugMode && (
                        <>
                          {showDebug ? (
                            <Debug onClose={() => setShowDebug(false)} />
                          ) : (
                            <button
                              onClick={() => setShowDebug(true)}
                              className="fixed bottom-4 right-4 bg-slate-800 text-white p-2 rounded-full shadow-lg z-50"
                              title="Open Debug Panel"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                                <path d="m9 12 2 2 4-4"></path>
                              </svg>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </BrowserRouter>
                </ToastProvider>
              </ThemeProvider>
            </AuthProvider>
          </DatabaseStatusHandler>
        </DatabaseProvider>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;