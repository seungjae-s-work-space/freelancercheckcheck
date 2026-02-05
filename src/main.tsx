import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Landing from './pages/Landing.tsx'
import Terms from './pages/Terms.tsx'
import Privacy from './pages/Privacy.tsx'
import AdminDashboard from './pages/admin/AdminDashboard.tsx'
import AdminRoute from './components/AdminRoute.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<App />} />
        <Route path="/app" element={<App />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
