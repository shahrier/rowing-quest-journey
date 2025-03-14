
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { UpdateNotification } from './components/pwa/UpdateNotification.tsx';
import { Toaster } from './components/ui/toaster';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UpdateNotification />
    <App />
    <Toaster />
  </StrictMode>
);
