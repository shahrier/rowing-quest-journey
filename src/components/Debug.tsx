import { useState, useEffect } from 'react';
import { X, Database, Server, RefreshCw, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { databaseDiagnostics, DatabaseDiagnosticResult } from '@/utils/databaseDiagnostics';
import { supabase } from '@/lib/supabase';

interface DebugPanelProps {
  onClose?: () => void;
}

export function Debug({ onClose }: DebugPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'database' | 'system' | 'network'>('database');
  const [dbDiagnostics, setDbDiagnostics] = useState<Record<string, DatabaseDiagnosticResult> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dbStats, setDbStats] = useState<any>(null);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [jsErrors, setJsErrors] = useState<any[]>([]);

  // Run diagnostics
  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      const results = await databaseDiagnostics.runAll();
      setDbDiagnostics(results);
      
      const stats = await databaseDiagnostics.getStats();
      setDbStats(stats);
      
      // Collect system info
      setSystemInfo({
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        devicePixelRatio: window.devicePixelRatio,
        timestamp: new Date().toISOString(),
        memory: performance?.memory ? {
          jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / (1024 * 1024)),
          totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / (1024 * 1024)),
          usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / (1024 * 1024))
        } : 'Not available'
      });
      
      // Collect network info
      const connection = (navigator as any).connection;
      setNetworkInfo({
        online: navigator.onLine,
        connectionType: connection?.type || 'unknown',
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 'unknown',
        rtt: connection?.rtt || 'unknown',
        saveData: connection?.saveData || false,
        timestamp: new Date().toISOString()
      });
      
      // Collect JS errors
      setJsErrors(window.__diagnostics_errors || []);
    } catch (error) {
      console.error('Error running diagnostics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      runDiagnostics();
    }
  }, [isVisible]);

  // Toggle visibility
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Status indicator component
  const StatusIndicator = ({ status }: { status: 'success' | 'error' | 'warning' }) => {
    if (status === 'success') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === 'error') return <AlertTriangle className="h-4 w-4 text-red-500" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  // Render debug panel toggle button
  if (!isVisible) {
    return (
      <button
        onClick={toggleVisibility}
        className="fixed bottom-4 right-4 bg-slate-800 text-white p-2 rounded-full shadow-lg z-50 flex items-center justify-center"
        title="Open Debug Panel"
      >
        <Database className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Server className="h-5 w-5" />
            Debug Panel
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={runDiagnostics}
              disabled={isLoading}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Refresh Diagnostics"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => onClose ? onClose() : setIsVisible(false)}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Close Debug Panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b dark:border-slate-700">
          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'database' 
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'text-slate-600 dark:text-slate-400'}`}
          >
            Database
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'system' 
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'text-slate-600 dark:text-slate-400'}`}
          >
            System
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'network' 
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'text-slate-600 dark:text-slate-400'}`}
          >
            Network
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto p-4 flex-1">
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {!isLoading && activeTab === 'database' && (
            <div className="space-y-4">
              {/* Database Connection */}
              <DiagnosticSection
                title="Database Connection"
                status={dbDiagnostics?.connection?.status || 'warning'}
                details={dbDiagnostics?.connection?.details}
                message={dbDiagnostics?.connection?.message || 'No data available'}
              />
              
              {/* Database Tables */}
              <DiagnosticSection
                title="Database Tables"
                status={dbDiagnostics?.tables?.status || 'warning'}
                details={dbDiagnostics?.tables?.details}
                message={dbDiagnostics?.tables?.message || 'No data available'}
              />
              
              {/* Database Functions */}
              <DiagnosticSection
                title="Database Functions"
                status={dbDiagnostics?.functions?.status || 'warning'}
                details={dbDiagnostics?.functions?.details}
                message={dbDiagnostics?.functions?.message || 'No data available'}
              />
              
              {/* Authentication */}
              <DiagnosticSection
                title="Authentication"
                status={dbDiagnostics?.auth?.status || 'warning'}
                details={dbDiagnostics?.auth?.details}
                message={dbDiagnostics?.auth?.message || 'No data available'}
              />
              
              {/* Database Stats */}
              {dbStats && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Database Statistics</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(dbStats).map(([key, value]) => (
                      <div key={key} className="bg-white dark:bg-slate-700 p-2 rounded">
                        <div className="text-xs text-slate-500 dark:text-slate-400">{key.replace(/_/g, ' ')}</div>
                        <div className="font-medium">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {!isLoading && activeTab === 'system' && (
            <div className="space-y-4">
              {/* System Info */}
              {systemInfo && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <h3 className="font-medium mb-2">System Information</h3>
                  <div className="space-y-2">
                    {Object.entries(systemInfo).map(([key, value]) => {
                      if (key === 'memory' && typeof value === 'object') {
                        return (
                          <div key={key} className="bg-white dark:bg-slate-700 p-2 rounded">
                            <div className="text-sm font-medium">Memory (MB)</div>
                            <div className="grid grid-cols-3 gap-2 mt-1">
                              {Object.entries(value).map(([memKey, memValue]) => (
                                <div key={memKey} className="text-xs">
                                  <span className="text-slate-500 dark:text-slate-400">{memKey.replace(/([A-Z])/g, ' $1').trim()}: </span>
                                  <span className="font-medium">{memValue}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={key} className="bg-white dark:bg-slate-700 p-2 rounded flex justify-between">
                          <div className="text-sm text-slate-500 dark:text-slate-400">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                          <div className="font-medium text-sm">{String(value)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* JS Errors */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <h3 className="font-medium mb-2">JavaScript Errors</h3>
                {jsErrors.length === 0 ? (
                  <div className="text-green-500 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    <span>No errors detected</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {jsErrors.map((error, index) => (
                      <div key={index} className="bg-white dark:bg-slate-700 p-2 rounded text-xs">
                        <div className="font-medium text-red-500">{error.message}</div>
                        <div className="text-slate-500 dark:text-slate-400 mt-1">
                          {error.timestamp} - {error.filename}:{error.lineno}:{error.colno}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {!isLoading && activeTab === 'network' && (
            <div className="space-y-4">
              {/* Network Info */}
              {networkInfo && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Network Information</h3>
                  <div className="space-y-2">
                    {Object.entries(networkInfo).map(([key, value]) => (
                      <div key={key} className="bg-white dark:bg-slate-700 p-2 rounded flex justify-between">
                        <div className="text-sm text-slate-500 dark:text-slate-400">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                        <div className="font-medium text-sm">
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* API Endpoints */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <h3 className="font-medium mb-2">API Configuration</h3>
                <div className="space-y-2">
                  <div className="bg-white dark:bg-slate-700 p-2 rounded flex justify-between">
                    <div className="text-sm text-slate-500 dark:text-slate-400">Supabase URL</div>
                    <div className="font-medium text-sm">
                      {import.meta.env.VITE_SUPABASE_URL ? 
                        `${import.meta.env.VITE_SUPABASE_URL.substring(0, 15)}...` : 
                        'Not configured'}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-700 p-2 rounded flex justify-between">
                    <div className="text-sm text-slate-500 dark:text-slate-400">Supabase Key</div>
                    <div className="font-medium text-sm">
                      {import.meta.env.VITE_SUPABASE_ANON_KEY ? 
                        `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 5)}...` : 
                        'Not configured'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Environment */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <h3 className="font-medium mb-2">Environment</h3>
                <div className="space-y-2">
                  <div className="bg-white dark:bg-slate-700 p-2 rounded flex justify-between">
                    <div className="text-sm text-slate-500 dark:text-slate-400">Mode</div>
                    <div className="font-medium text-sm">{import.meta.env.MODE}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-700 p-2 rounded flex justify-between">
                    <div className="text-sm text-slate-500 dark:text-slate-400">Development</div>
                    <div className="font-medium text-sm">{import.meta.env.DEV ? 'Yes' : 'No'}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-700 p-2 rounded flex justify-between">
                    <div className="text-sm text-slate-500 dark:text-slate-400">Production</div>
                    <div className="font-medium text-sm">{import.meta.env.PROD ? 'Yes' : 'No'}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-700 p-2 rounded flex justify-between">
                    <div className="text-sm text-slate-500 dark:text-slate-400">Base URL</div>
                    <div className="font-medium text-sm">{import.meta.env.BASE_URL}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t dark:border-slate-700 p-4 text-xs text-slate-500 dark:text-slate-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

// Collapsible diagnostic section component
function DiagnosticSection({ 
  title, 
  status, 
  message, 
  details 
}: { 
  title: string; 
  status: 'success' | 'error' | 'warning'; 
  message: string;
  details?: any;
}) {
  const [isExpanded, setIsExpanded] = useState(status !== 'success');
  
  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <StatusIndicator status={status} />
          <h3 className="font-medium">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded ${
            status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
            status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
          }`}>
            {status}
          </span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 text-sm">
          <p className="mb-2">{message}</p>
          {details && (
            <pre className="bg-slate-100 dark:bg-slate-700 p-2 rounded text-xs overflow-x-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

// Status indicator component
function StatusIndicator({ status }: { status: 'success' | 'error' | 'warning' }) {
  if (status === 'success') return <CheckCircle className="h-4 w-4 text-green-500" />;
  if (status === 'error') return <AlertTriangle className="h-4 w-4 text-red-500" />;
  return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
}

// Add global type for error tracking
declare global {
  interface Window {
    __diagnostics_errors?: any[];
  }
}