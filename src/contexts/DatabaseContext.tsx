import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { verifySupabaseConnection } from '@/lib/supabase';

type DatabaseStatus = 'connecting' | 'connected' | 'error';

interface DatabaseContextType {
  status: DatabaseStatus;
  retry: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<DatabaseStatus>('connecting');

  const checkConnection = async () => {
    try {
      const isConnected = await verifySupabaseConnection();
      setStatus(isConnected ? 'connected' : 'error');
    } catch (error) {
      console.error('Database connection error:', error);
      setStatus('error');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const retry = async () => {
    setStatus('connecting');
    await checkConnection();
  };

  return (
    <DatabaseContext.Provider value={{ status, retry }}>
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