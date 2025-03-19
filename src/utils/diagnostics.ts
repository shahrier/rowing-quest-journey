import { checkHealth } from '../lib/supabase';

export async function logDiagnostics() {
  return {
    react: checkReactRendering(),
    database: await checkDatabaseStatus(),
  };
}

function checkReactRendering() {
  const root = document.getElementById('root');
  return {
    rootExists: !!root,
    childrenCount: root?.childNodes.length || 0,
    reactDevTools: !!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__,
  };
}

async function checkDatabaseStatus() {
  try {
    const isHealthy = await checkHealth();
    return {
      status: isHealthy ? 'connected' : 'error',
      error: isHealthy ? null : 'Failed to connect to database',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown database error',
      timestamp: new Date().toISOString(),
    };
  }
} 