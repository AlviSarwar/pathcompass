import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './theme'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import Courses from './pages/Courses'
import Dashboard from './pages/Dashboard'
import Insights from './pages/Insights'
import SettingsPage from './pages/SettingsPage'
import Skills from './pages/Skills'
import Documents from './pages/Documents'
import Requirements from './pages/Requirements'
import { Applications, Projects, Recommendations, Scholarships, TestScores } from './pages/Trackers'
import Target from './pages/Target'

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))

  function login(t: string) {
    localStorage.setItem('token', t)
    setToken(t)
  }
  function logout() {
    localStorage.removeItem('token')
    setToken(null)
  }

  if (!token) return <AuthPage onLogin={login} />

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout onLogout={logout} />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/target" element={<Target />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/scholarships" element={<Scholarships />} />
          <Route path="/scores" element={<TestScores />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/requirements" element={<Requirements />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}



