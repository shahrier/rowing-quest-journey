import React, { useState, useEffect } from "react";
import { X, Bug, ChevronUp, ChevronDown, RefreshCw } from "lucide-react";

interface LogEntry {
  timestamp: string;
  message: string;
  type: "info" | "error" | "warn";
}

export function Debug() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [appInfo, setAppInfo] = useState({
    reactVersion: "",
    routerVersion: "",
    environment: import.meta.env.MODE || "unknown",
    userAgent: navigator.userAgent,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
  });

  useEffect(() => {
    // Capture React version
    try {
      // @ts-ignore
      const reactVersion = React.version;
      setAppInfo(prev => ({ ...prev, reactVersion }));
    } catch (e) {
      console.error("Could not determine React version", e);
    }

    // Intercept console methods
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.log = (...args) => {
      addLog("info", args);
      originalConsoleLog(...args);
    };

    console.error = (...args) => {
      addLog("error", args);
      originalConsoleError(...args);
    };

    console.warn = (...args) => {
      addLog("warn", args);
      originalConsoleWarn(...args);
    };

    // Add initial log
    addLog("info", ["Debug panel initialized"]);

    // Capture global errors
    const handleGlobalError = (event: ErrorEvent) => {
      addLog("error", [`Global error: ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`]);
    };

    window.addEventListener("error", handleGlobalError);

    // Capture unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addLog("error", [`Unhandled promise rejection: ${event.reason}`]);
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  const addLog = (type: "info" | "error" | "warn", args: any[]) => {
    const message = args.map(arg => 
      typeof arg === "object" ? JSON.stringify(arg) : String(arg)
    ).join(" ");
    
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
    
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog("info", ["Logs cleared"]);
  };

  const checkDOMStructure = () => {
    try {
      const rootElement = document.getElementById("root");
      if (!rootElement) {
        addLog("error", ["Root element not found in DOM"]);
        return;
      }

      const childCount = rootElement.childElementCount;
      addLog("info", [`Root element has ${childCount} direct children`]);

      if (childCount === 0) {
        addLog("warn", ["Root element has no children - React may not be mounting"]);
      }

      // Check for React DevTools
      // @ts-ignore
      const hasReactDevTools = typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined";
      addLog("info", [`React DevTools ${hasReactDevTools ? "detected" : "not detected"}`]);

      // Check if any elements are visible
      const visibleElements = document.querySelectorAll("body *:not(script):not(style)");
      let visibleCount = 0;
      visibleElements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0") {
          visibleCount++;
        }
      });
      
      addLog("info", [`${visibleCount} visible elements detected in DOM`]);
      
      if (visibleCount === 0) {
        addLog("warn", ["No visible elements found - possible CSS issue"]);
      }
    } catch (e) {
      addLog("error", [`Error checking DOM structure: ${e}`]);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-black p-2 rounded-full shadow-lg z-50"
        title="Open Debug Panel"
      >
        <Bug size={20} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-background border rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-lg flex items-center">
            <Bug className="mr-2" size={20} />
            Debug Panel
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 border-b">
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <strong>React:</strong> {appInfo.reactVersion || "Unknown"}
            </div>
            <div>
              <strong>Env:</strong> {appInfo.environment}
            </div>
            <div>
              <strong>Screen:</strong> {appInfo.screenSize}
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button 
              onClick={checkDOMStructure}
              className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm flex items-center"
            >
              Check DOM
            </button>
            <button 
              onClick={clearLogs}
              className="bg-muted text-muted-foreground px-3 py-1 rounded text-sm flex items-center"
            >
              Clear Logs
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-muted text-muted-foreground px-3 py-1 rounded text-sm flex items-center"
            >
              <RefreshCw size={14} className="mr-1" />
              Reload
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-2">
          <div className="font-mono text-xs space-y-1">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className={`p-1 rounded ${
                  log.type === "error" ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300" : 
                  log.type === "warn" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300" : 
                  "bg-muted/50"
                }`}
              >
                <span className="opacity-70">[{log.timestamp}]</span> {log.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}