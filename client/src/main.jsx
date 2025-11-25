import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { register as registerServiceWorker } from './registerServiceWorker';

// Render App
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register Service Worker untuk PWA
if (import.meta.env.PROD) {
  // Hanya aktif saat production
  registerServiceWorker();
  console.log('🚀 PWA Mode Active');
} else {
  console.log('🔧 Development Mode - PWA Disabled');
}
