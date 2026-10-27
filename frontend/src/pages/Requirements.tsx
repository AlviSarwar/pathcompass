import { useEffect, useState, type FormEvent } from 'react'
import { api, errorText } from '../api'
import { Card } from '../components/ui'
import { btnCls, errCls, inputCls } from '../styles'

interface Req { id: number; name: string; required_credits: string; done_credits: string }

export default function Requirements() {
  const [rows, setRows] = useState<Req[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', required_credits: '' })
  const [error, setError] = useState('')

  async function load() {
    try {
      const [r, p] = await Promise.all([
        api.get<Req[]>('/requirements/'),
        api.get<{ total_credits_required: string }>('/profile/'),
      ])
      setRows(r.data)
      setTotal(Number(p.data.total_credits_required))
    } catch (e) { setError(errorText(e)) }
  }
  useEffect(() => { void load() }, [])

  async function add(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await api.post('/requirements/', form)
      setForm({ name: '', required_credits: '' })
      await load()
    } catch (err) { setError(errorText(err)) }
  }

  const setDone = (id: number, v: string) => setRows(rows.map((r) => (r.id === id ? { ...r, done_credits: v } : r)))

  async function saveDone(r: Req) {
    setError('')
    try { await api.patch(`/requirements/${r.id}/`, { done_credits: r.done_credits }) } catch (err) { setError(errorText(err)) }
    await load()
  }

  async function remove(id: number) {
    if (!window.confirm('Delete this requirement?')) return
    try { await api.delete(`/requirements/${id}/`); await load() } catch (err) { setError(errorText(err)) }
  }

  const sumReq = rows.reduce((n, r) => n + Number(r.required_credits), 0)
  const sumDone = rows.reduce((n, r) => n + Math.min(Number(r.done_credits), Number(r.required_credits)), 0)
  const pct = (done: number, req: number) => (req > 0 ? Math.min(100, (done / req) * 100) : 0)

  return (
    <>
      {error && <p className={errCls}>{error}</p>}
      <Card title="Add a requirement group">
        <form onSubmit={add} className="flex flex-wrap items-end gap-2">
          <label className="text-sm">Name<input className={inputCls} placeholder="Core, Elective, Lab, Thesis..." value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label className="text-sm">Credits required<input className={`${inputCls} w-32`} type="number" step="0.5" min="0.5" value={form.required_credits}
            onChange={(e) => setForm({ ...form, required_credits: e.target.value })} required /></label>
          <button className={btnCls}>Add</button>
        </form>
        <p className="mt-2 text-xs text-slate-500">
          Copy these numbers from your department&apos;s curriculum. You enter the completed credits yourself; this checklist is not linked to your courses yet.
        </p>
      </Card>

      {rows.length > 0 && total !== null && Math.abs(sumReq - total) > 0.001 && (
        <p className="rounded bg-amber-100 p-3 text-sm text-amber-900">
          Your groups add up to {sumReq} credits, but Settings says {total} credits are needed to graduate. One of them may be wrong.
        </p>
      )}

      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">No requirement groups yet.</p>
      ) : (
        <Card title={`Overall: ${sumDone} of ${sumReq} credits (${pct(sumDone, sumReq).toFixed(0)}%)`}>
          <div className="space-y-4">
            {rows.map((r) => (
              <div key={r.id}>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-semibold">{r.name}</span>
                  <span className="flex items-center gap-2">
                    <input className={`${inputCls} w-24`} type="number" step="0.5" min="0" value={r.done_credits}
                      onChange={(e) => setDone(r.id, e.target.value)} onBlur={() => void saveDone(r)} />
                    <span>of {r.required_credits} done</span>
                    <button className="text-red-600 hover:underline" onClick={() => void remove(r.id)}>Delete</button>
                  </span>
                </div>
                <div className="mt-1 h-3 rounded bg-slate-200">
                  <div className="h-3 rounded bg-emerald-500" style={{ width: `${pct(Number(r.done_credits), Number(r.required_credits))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  )
}
