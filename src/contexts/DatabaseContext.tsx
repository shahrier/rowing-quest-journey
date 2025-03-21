import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { verifySupabaseConnection } from '@/lib/supabase';
import { databaseDiagnostics } from '@/utils/databaseDiagnostics';

type DatabaseStatus = 'connecting' | 'connected' | 'error';

interface DatabaseContextType {
  status: DatabaseStatus;
  error: string | null;
  retry: () => Promise<void>;
  diagnostics: any | null;
  runDiagnostics: () => Promise<void>;
  stats: any | null;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<DatabaseStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<any | null>(null);
  const [stats, setStats] = useState<any | null>(null);

  const checkConnection = async () => {
    try {
      setStatus('connecting');
      setError(null);
      
      const isConnected = await verifySupabaseConnection();
      
      if (isConnected) {
        setStatus('connected');
        // Get database stats if connected
        const dbStats = await databaseDiagnostics.getStats();
        setStats(dbStats);
      } else {
        setStatus('error');
        setError('Failed to connect to database');
      }
    } catch (error) {
      console.error('Database connection error:', error);
      setStatus('error');
      setError(error instanceof Error ? error.message : 'Unknown database error');
    }
  };

  const runDiagnostics = async () => {
    try {
      const results = await databaseDiagnostics.runAll();
      setDiagnostics(results);
      return results;
    } catch (error) {
      console.error('Error running diagnostics:', error);
      return null;
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Set up periodic health checks
    const intervalId = setInterval(() => {
      verifySupabaseConnection().then(isConnected => {
        if (!isConnected && status === 'connected') {
          console.warn('Database connection lost, reconnecting...');
          checkConnection();
        }
      });
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  const retry = async () => {
    await checkConnection();
    await runDiagnostics();
  };

  return (
    <DatabaseContext.Provider value={{ 
      status, 
      error, 
      retry, 
      diagnostics, 
      runDiagnostics,
      stats
    }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabaseStatus() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabaseStatus must be used within a DatabaseProvider');
  }
  return context;
}