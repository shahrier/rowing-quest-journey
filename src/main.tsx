
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { UpdateNotification } from './components/pwa/UpdateNotification.tsx';
import { Toaster } from './components/ui/toaster';

// Get the root element
const rootElement = document.getElementById("root");

// Ensure we have a root element before rendering
if (rootElement) {
  const root = createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <UpdateNotification />
      <App />
      <Toaster />
    </React.StrictMode>
  );
}
