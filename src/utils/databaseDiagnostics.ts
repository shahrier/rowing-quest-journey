import { supabase } from '@/lib/supabase';

export interface DatabaseDiagnosticResult {
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
  timestamp: string;
}

export interface DatabaseStats {
  profiles_count: number;
  teams_count: number;
  activities_count: number;
  badges_count: number;
  checkpoints_count: number;
  media_count: number;
}

/**
 * Comprehensive database diagnostics utility
 */
export const databaseDiagnostics = {
  /**
   * Check basic database connectivity
   */
  async checkConnection(): Promise<DatabaseDiagnosticResult> {
    try {
      const startTime = performance.now();
      const { data, error } = await supabase.rpc('check_connection');
      const endTime = performance.now();
      
      if (error) {
        return {
          status: 'error',
          message: `Connection failed: ${error.message}`,
          details: { error },
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        status: 'success',
        message: 'Database connection successful',
        details: {
          ...data,
          responseTime: Math.round(endTime - startTime)
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Connection error: ${error instanceof Error ? error.message : String(error)}`,
        details: { error },
        timestamp: new Date().toISOString()
      };
    }
  },
  
  /**
   * Get database statistics
   */
  async getStats(): Promise<DatabaseStats | null> {
    try {
      const { data, error } = await supabase.rpc('get_db_stats');
      
      if (error) {
        console.error('Failed to get database stats:', error);
        return null;
      }
      
      return data as DatabaseStats;
    } catch (error) {
      console.error('Error getting database stats:', error);
      return null;
    }
  },
  
  /**
   * Check if required tables exist
   */
  async checkTables(): Promise<DatabaseDiagnosticResult> {
    try {
      const requiredTables = [
        'profiles', 'teams', 'activities', 'badges', 
        'user_badges', 'journey_checkpoints', 'media'
      ];
      
      const { data, error } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
      
      if (error) {
        return {
          status: 'error',
          message: `Failed to check tables: ${error.message}`,
          details: { error },
          timestamp: new Date().toISOString()
        };
      }
      
      const existingTables = data.map(t => t.tablename);
      const missingTables = requiredTables.filter(t => !existingTables.includes(t));
      
      if (missingTables.length > 0) {
        return {
          status: 'warning',
          message: `Missing required tables: ${missingTables.join(', ')}`,
          details: { missingTables, existingTables },
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        status: 'success',
        message: 'All required tables exist',
        details: { tables: existingTables },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Table check error: ${error instanceof Error ? error.message : String(error)}`,
        details: { error },
        timestamp: new Date().toISOString()
      };
    }
  },
  
  /**
   * Check if required functions exist
   */
  async checkFunctions(): Promise<DatabaseDiagnosticResult> {
    try {
      const requiredFunctions = [
        'check_connection', 'get_db_stats', 'has_role', 
        'update_team_distance', 'check_badge_requirements'
      ];
      
      // Fixed the syntax error here - removed the type cast with ::
      const { data, error } = await supabase
        .from('pg_proc')
        .select('proname')
        .eq('pronamespace', 'public');
      
      if (error) {
        return {
          status: 'error',
          message: `Failed to check functions: ${error.message}`,
          details: { error },
          timestamp: new Date().toISOString()
        };
      }
      
      const existingFunctions = data.map(f => f.proname);
      const missingFunctions = requiredFunctions.filter(f => !existingFunctions.includes(f));
      
      if (missingFunctions.length > 0) {
        return {
          status: 'warning',
          message: `Missing required functions: ${missingFunctions.join(', ')}`,
          details: { missingFunctions, existingFunctions },
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        status: 'success',
        message: 'All required functions exist',
        details: { functions: existingFunctions },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Function check error: ${error instanceof Error ? error.message : String(error)}`,
        details: { error },
        timestamp: new Date().toISOString()
      };
    }
  },
  
  /**
   * Check authentication configuration
   */
  async checkAuth(): Promise<DatabaseDiagnosticResult> {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        return {
          status: 'error',
          message: `Auth check failed: ${error.message}`,
          details: { error },
          timestamp: new Date().toISOString()
        };
      }
      
      const hasSession = !!data.session;
      
      return {
        status: hasSession ? 'success' : 'warning',
        message: hasSession 
          ? 'Authentication is configured and user is logged in' 
          : 'Authentication is configured but no active session',
        details: {
          hasSession,
          authConfigured: true
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Auth check error: ${error instanceof Error ? error.message : String(error)}`,
        details: { error },
        timestamp: new Date().toISOString()
      };
    }
  },
  
  /**
   * Run all diagnostics
   */
  async runAll(): Promise<Record<string, DatabaseDiagnosticResult>> {
    const connection = await this.checkConnection();
    
    // If connection fails, don't run other checks
    if (connection.status === 'error') {
      return {
        connection,
        tables: {
          status: 'error',
          message: 'Skipped due to connection failure',
          timestamp: new Date().toISOString()
        },
        functions: {
          status: 'error',
          message: 'Skipped due to connection failure',
          timestamp: new Date().toISOString()
        },
        auth: {
          status: 'error',
          message: 'Skipped due to connection failure',
          timestamp: new Date().toISOString()
        }
      };
    }
    
    // Run all checks in parallel
    const [tables, functions, auth] = await Promise.all([
      this.checkTables(),
      this.checkFunctions(),
      this.checkAuth()
    ]);
    
    return {
      connection,
      tables,
      functions,
      auth
    };
  }
};