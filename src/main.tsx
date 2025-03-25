import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { Debug } from "./components/Debug";
import { initDiagnostics, runDiagnostics } from "./lib/diagnostics";
import { logDiagnostics } from './utils/systemDiagnostics';

// Enable debug mode in development or when URL has debug parameter
const isDebugMode = 
  import.meta.env.DEV || 
  window.location.search.includes("debug=true");

console.log("🚀 Script execution started", {
  timestamp: new Date().toISOString(),
  url: window.location.href,
  mode: import.meta.env.MODE,
  debugMode: isDebugMode
});

// Function to initialize the app with error handling
function initializeApp() {
  console.log("📋 Starting app initialization");
  
  // Check for root element
  const rootElement = document.getElementById("root");
  console.log("🔍 Root element check:", { 
    exists: !!rootElement,
    id: rootElement?.id,
    tagName: rootElement?.tagName,
    childCount: rootElement?.childElementCount
  });
  
  if (!rootElement) {
    console.error("❌ Root element not found. Cannot mount React application.");
    document.body.innerHTML += `
      <div style="padding: 20px; background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; border-radius: 4px; margin: 20px;">
        <h3>Critical Error</h3>
        <p>Root element with ID "root" not found in the document.</p>
        <p>This is required for the application to mount.</p>
      </div>
    `;
    return;
  }
  
  try {
    // Log React version
    console.log("📚 React version:", React.version);
    
    // Initialize diagnostics
    if (isDebugMode) {
      console.log("🛠️ Initializing diagnostics tools");
      initDiagnostics();
    }
    
    // Log environment variables (without exposing sensitive data)
    console.log("🔐 Environment variables check:", {
      supabaseUrlDefined: !!import.meta.env.VITE_SUPABASE_URL,
      supabaseKeyDefined: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      mode: import.meta.env.MODE,
      baseUrl: import.meta.env.BASE_URL,
      prod: import.meta.env.PROD,
      dev: import.meta.env.DEV
    });
    
    // Log initialization
    console.log(`🏁 Initializing RowQuest app (${import.meta.env.MODE} mode)`);
    
    // Create root before rendering
    const root = ReactDOM.createRoot(rootElement);
    
    // Wrap rendering in error boundary
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <>
            <App />
            {isDebugMode && <Debug />}
          </>
        </ErrorBoundary>
      </React.StrictMode>
    );
    
    // Log diagnostics after render using Promise
    logDiagnostics().then(diagnostics => {
      console.log('Initial diagnostics:', diagnostics);
    }).catch(error => {
      console.error('Diagnostics error:', error);
    });
    
    // Run diagnostics after render
    if (isDebugMode) {
      console.log("🔍 Scheduling post-render diagnostics");
      setTimeout(() => {
        console.log("🔍 Running post-render diagnostics");
        const results = runDiagnostics();
        console.log("📊 Diagnostics results:", results);
      }, 1000);
    }
    
    // Log successful initialization
    console.log("🎉 App initialization completed successfully");
  } catch (error) {
    console.error("❌ Failed to initialize React application:", error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
    }
    
    // Render error fallback
    if (rootElement) {
      const root = ReactDOM.createRoot(rootElement);
      root.render(
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-4">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Failed to start application</h1>
            <p className="text-gray-600 mb-4">Please try refreshing the page</p>
          </div>
        </div>
      );
    }
  }
}

// Initialize the app
console.log("⏳ Calling initializeApp function");
initializeApp();

// Add global error handler for uncaught errors
window.addEventListener("error", (event) => {
  console.error("🔥 Global error:", {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    timestamp: new Date().toISOString()
  });
});

// Add handler for unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("⚠️ Unhandled promise rejection:", {
    reason: event.reason,
    timestamp: new Date().toISOString()
  });
});

// Log when DOM is fully loaded
window.addEventListener("DOMContentLoaded", () => {
  console.log("📄 DOMContentLoaded event fired");
});

// Log when page is fully loaded
window.addEventListener("load", () => {
  console.log("🏁 Window load event fired");
  console.log("📊 Page load metrics:", {
    domContentLoadedTime: window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart,
    loadTime: window.performance.timing.loadEventEnd - window.performance.timing.navigationStart,
    timestamp: new Date().toISOString()
  });
});