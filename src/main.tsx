import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";

console.log("🚀 Starting Rowing Quest Journey application");

// Get the root element
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("❌ Root element not found. Cannot mount React application.");
  document.body.innerHTML = `
    <div style="padding: 20px; background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; border-radius: 4px; margin: 20px;">
      <h3>Critical Error</h3>
      <p>Root element with ID "root" not found in the document.</p>
    </div>
  `;
} else {
  // Create root and render app
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  console.log("✅ Application rendered successfully");
}