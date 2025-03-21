import { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/LoadingSpinner';

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <ThemeProvider>
          <ToastProvider>
            <BrowserRouter>
              <div className="min-h-screen">
                <Routes>
                  <Route path="/" element={<div className="p-8 text-center">Rowing Quest Journey Home Page</div>} />
                  <Route path="/login" element={<div className="p-8 text-center">Login Page</div>} />
                </Routes>
              </div>
            </BrowserRouter>
          </ToastProvider>
        </ThemeProvider>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;