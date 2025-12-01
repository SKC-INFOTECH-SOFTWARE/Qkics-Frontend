import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'   // ✅ added
import './index.css'
import App from './App.jsx'
import "./tailwind.css";
import { AlertProvider } from './context/AlertContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>     {/* ✅ wrap App in Router */}
      <AlertProvider>
        <App />
      </AlertProvider>
    </BrowserRouter>
  </StrictMode>
)
