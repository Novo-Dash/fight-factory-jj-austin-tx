import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App'
import { BookPage } from './nd'
import { KidsPage } from './pages/KidsPage'
import { BackToSchoolPage } from './pages/BackToSchoolPage'


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
