import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { Debug } from "./components/Debug";
import { initDiagnostics, runDiagnostics } from "./lib/diagnostics";

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
    
    // Create root and render app
    console.log("🌱 Creating React root");
    const root = ReactDOM.createRoot(rootElement);
    
    console.log("🖌️ Rendering React application");
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
    
    console.log("✅ App render method called successfully");
    
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
    
    // Fallback rendering if React fails to initialize
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h2 style="color: #e11d48;">Application Error</h2>
          <p>We encountered a problem while starting the application.</p>
          <p style="font-family: monospace; margin: 20px 0; padding: 10px; background: #f8f9fa; text-align: left; overflow: auto;">
            ${error instanceof Error ? error.message : String(error)}
          </p>
          <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
            <button onclick="window.location.reload()" style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Reload Application
            </button>
            <button onclick="window.location.href = window.location.href + (window.location.href.includes('?') ? '&' : '?') + 'debug=true'" style="padding: 8px 16px; background: #4b5563; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Launch Debug Mode
            </button>
          </div>
          <div style="margin-top: 20px; text-align: left; background: #f8f9fa; padding: 10px; border-radius: 4px;">
            <h3 style="margin-top: 0;">Technical Information</h3>
            <p style="font-family: monospace; font-size: 12px;">
              Time: ${new Date().toISOString()}<br>
              URL: ${window.location.href}<br>
              User Agent: ${navigator.userAgent}<br>
              ${error instanceof Error ? `Stack: ${error.stack}` : ''}
            </p>
          </div>
        </div>
      `;
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