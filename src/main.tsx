import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './contexts/ToastContext.tsx'
import { Analytics } from '@vercel/analytics/react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <Analytics />
      <App />
    </ToastProvider>
  </StrictMode>,
)
