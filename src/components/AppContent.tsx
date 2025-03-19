import { useDatabaseStatus } from '@/contexts/DatabaseContext';
import { Routes, Route } from 'react-router-dom';

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto" />
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const DatabaseError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-red-500 mb-4">Database Connection Error</h1>
      <p className="text-gray-600 mb-4">Unable to connect to the database</p>
      <button
        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        onClick={onRetry}
      >
        Retry Connection
      </button>
    </div>
  </div>
);

export function AppContent() {
  const { status, retry } = useDatabaseStatus();

  if (status === 'connecting') {
    return <LoadingSpinner />;
  }

  if (status === 'error') {
    return <DatabaseError onRetry={retry} />;
  }

  return (
    <Routes>
      <Route path="/" element={<div>Home Page</div>} />
      <Route path="/login" element={<div>Login Page</div>} />
    </Routes>
  );
} 