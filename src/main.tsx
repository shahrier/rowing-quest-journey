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

// Function to initialize the app with error handling
function initializeApp() {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error("Root element not found. Cannot mount React application.");
    return;
  }
  
  try {
    // Initialize diagnostics
    if (isDebugMode) {
      initDiagnostics();
    }
    
    // Log initialization
    console.log(`Initializing RowQuest app (${import.meta.env.MODE} mode)`);
    
    // Create root and render app
    const root = ReactDOM.createRoot(rootElement);
    
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
    
    console.log("App rendered successfully");
    
    // Run diagnostics after render
    if (isDebugMode) {
      setTimeout(runDiagnostics, 1000);
    }
  } catch (error) {
    console.error("Failed to initialize React application:", error);
    
    // Fallback rendering if React fails to initialize
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h2 style="color: #e11d48;">Application Error</h2>
          <p>We encountered a problem while starting the application.</p>
          <p style="font-family: monospace; margin: 20px 0; padding: 10px; background: #f8f9fa; text-align: left; overflow: auto;">
            ${error instanceof Error ? error.message : String(error)}
          </p>
          <button onclick="window.location.reload()" style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Reload Application
          </button>
          <div style="margin-top: 20px;">
            <button onclick="window.location.href = window.location.href + (window.location.href.includes('?') ? '&' : '?') + 'debug=true'" style="padding: 8px 16px; background: #4b5563; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Launch Debug Mode
            </button>
          </div>
        </div>
      `;
    }
  }
}

// Initialize the app
initializeApp();

// Add global error handler for uncaught errors
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
});

// Add handler for unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});