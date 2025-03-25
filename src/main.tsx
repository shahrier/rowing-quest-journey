import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";

// Function to initialize the app with error handling
function initializeApp() {
  console.log("Starting app initialization");
  
  // Check for root element
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error("Root element not found. Cannot mount React application.");
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
    // Create root and render
    const root = ReactDOM.createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    
    console.log("App initialization completed successfully");
  } catch (error) {
    console.error("Failed to initialize React application:", error);
    
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; border-radius: 4px; margin: 20px;">
          <h3>Application Error</h3>
          <p>Failed to initialize the application. Please try refreshing the page.</p>
          <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      `;
    }
  }
}

// Initialize the app
initializeApp();