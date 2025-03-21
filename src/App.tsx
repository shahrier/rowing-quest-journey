import { Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { verifySupabaseConnection } from './lib/supabase';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

function App() {
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    // Check database connection on startup
    const checkConnection = async () => {
      try {
        const isConnected = await verifySupabaseConnection();
        setDbStatus(isConnected ? 'connected' : 'error');
      } catch (error) {
        console.error('Database connection error:', error);
        setDbStatus('error');
      }
    };

    checkConnection();
  }, []);

  // Show loading state while checking connection
  if (dbStatus === 'checking') {
    return <LoadingSpinner />;
  }

  // Show error state if connection failed
  if (dbStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Connection Error</h1>
          <p className="text-gray-600 mb-4">
            Could not connect to the database. Please check your connection and try again.
          </p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Main application
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
              </Routes>
            </div>
          </BrowserRouter>
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;