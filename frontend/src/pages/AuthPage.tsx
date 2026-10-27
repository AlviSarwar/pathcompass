import { useState, type FormEvent } from 'react'
import { api, errorText } from '../api'
import { btnCls, errCls, inputCls } from '../styles'

export default function AuthPage({ onLogin }: { onLogin: (token: string) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const url = mode === 'login' ? '/auth/login/' : '/auth/register/'
      const body = mode === 'login' ? { username: form.username, password: form.password } : form
      const res = await api.post<{ token: string }>(url, body)
      onLogin(res.data.token)
    } catch (err) {
      setError(errorText(err))
    }
  }

  async function tryDemo() {
    setError('')
    try {
      const res = await api.post<{ token: string }>('/auth/demo/')
      onLogin(res.data.token)
    } catch (err) {
      setError(errorText(err))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-3 rounded-lg bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-emerald-600">PathCompass</h1>
        <p className="text-sm text-slate-500">Smart CGPA and career planner</p>
        {error && <p className={errCls}>{error}</p>}
        <input className={inputCls} placeholder="Username" value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        {mode === 'register' && (
          <input className={inputCls} type="email" placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        )}
        <input className={inputCls} type="password" placeholder="Password (8+ characters)" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className={`${btnCls} w-full`}>{mode === 'login' ? 'Log in' : 'Create account'}</button>
        <button type="button" className="w-full text-sm text-slate-600 underline"
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>
          {mode === 'login' ? 'New here? Create an account' : 'Have an account? Log in'}
        </button>
        <hr />
        <button type="button" className="w-full rounded border px-3 py-2 text-sm hover:bg-slate-100" onClick={tryDemo}>
          Try the demo (labelled sample data)
        </button>
      </form>
    </div>
  )
}
