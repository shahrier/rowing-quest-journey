import { supabase } from '../lib/supabase';

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
    // Simple health check
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    return {
      status: error ? 'error' : 'connected',
      error: error ? error.message : null,
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