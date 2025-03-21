import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Simple initialization with error handling
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Root element not found");
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: sans-serif;">
      <h2 style="color: #e53e3e;">Application Error</h2>
      <p>The application could not be initialized. Please refresh the page.</p>
    </div>
  `;
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}