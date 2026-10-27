import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { api, downloadReport, errorText } from '../api'
import { setLang, useT } from '../i18n'
import { isDark, setDark } from '../theme'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/courses', label: 'Semesters & Courses' },
  { to: '/target', label: 'Target CGPA' },
  { to: '/insights', label: 'Planner & Insights' },
  { to: '/requirements', label: 'Requirements' },
  { to: '/skills', label: 'Skills' },
  { to: '/projects', label: 'Projects' },
  { to: '/applications', label: 'Applications' },
  { to: '/scholarships', label: 'Scholarships' },
  { to: '/scores', label: 'Test Scores' },
  { to: '/documents', label: 'Documents' },
  { to: '/settings', label: 'Settings' },
]

export default function Layout({ onLogout }: { onLogout: () => void }) {
  const { lang, t } = useT()
  const [dark, setDarkState] = useState(isDark())
  const [demo, setDemo] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<{ is_demo: boolean }>('/profile/').then((r) => setDemo(r.data.is_demo)).catch(() => undefined)
  }, [])

  function toggle() {
    setDark(!dark)
    setDarkState(!dark)
  }

  async function exportPdf() {
    setError('')
    try { await downloadReport() } catch (e) { setError(errorText(e)) }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-slate-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
          <span className="text-lg font-bold text-emerald-400">PathCompass</span>
          <nav className="flex flex-wrap gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `rounded px-3 py-1.5 text-sm ${isActive ? 'bg-emerald-500 font-semibold text-slate-900' : 'hover:bg-slate-700'}`
                }
              >
                {t(l.label)}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm text-slate-300">
            <button onClick={() => setLang(lang === 'en' ? 'bn' : 'en')} className="hover:text-white">
              {lang === 'en' ? 'বাংলা' : 'English'}
            </button>
            <button onClick={exportPdf} className="hover:text-white">{t('Export PDF')}</button>
            <button onClick={toggle} className="hover:text-white">{dark ? t('Light mode') : t('Dark mode')}</button>
            <button onClick={onLogout} className="hover:text-white">{t('Log out')}</button>
          </div>
        </div>
      </header>
      {demo && (
        <p className="bg-amber-200 px-4 py-2 text-center text-sm font-medium text-amber-900">
          Demo account: all data here is SAMPLE data, not real. It is deleted after about a day. Create a real account to keep your own data.
        </p>
      )}
      <main className="mx-auto max-w-6xl space-y-4 p-4">
        {error && <p className="rounded bg-red-100 p-3 text-sm text-red-800">{error}</p>}
        <Outlet />
      </main>
    </div>
  )
}
