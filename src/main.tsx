
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { UpdateNotification } from './components/pwa/UpdateNotification.tsx'

createRoot(document.getElementById("root")!).render(
  <>
    <UpdateNotification />
    <App />
  </>
);
