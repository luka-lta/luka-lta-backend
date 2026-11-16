import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Settings } from 'luxon'
import './index.css'
import App from './App.tsx'

// UI-Sprache ist Deutsch — relative Zeiten ("vor 2 Stunden") und Monatsnamen entsprechend.
Settings.defaultLocale = 'de'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
