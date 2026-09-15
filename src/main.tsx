import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App'
import { BookPage } from './booking/BookPage'
import { KidsPage } from './pages/KidsPage'
import { BackToSchoolPage } from './pages/BackToSchoolPage'
import { captureAttribution } from './booking/attribution'
import { captureFbclid } from './booking/fb'

// Captura a atribuição (UTM + ad click IDs) ANTES de a navegação SPA limpar a
// query string — uma vez, no boot do app. O fbclid também vira fallback
// first-party do _fbc para o espelho CAPI (§7.6.3).
captureAttribution()
captureFbclid()

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/book" element={<BookPage />} />
        <Route path="/kids" element={<KidsPage />} />
        <Route path="/back-to-school" element={<BackToSchoolPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
