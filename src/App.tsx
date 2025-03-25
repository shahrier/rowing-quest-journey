import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';
import { useDatabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { router } from './routes';

function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const { status, error, retry } = useDatabase();

  if (status === 'checking') {
    return <LoadingSpinner />;
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Connection Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            onClick={retry}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <DatabaseProvider>
          <AuthProvider>
            <ThemeProvider>
              <ToastProvider>
                <RouterProvider router={router} />
              </ToastProvider>
            </ThemeProvider>
          </AuthProvider>
        </DatabaseProvider>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;