import { useEffect, useState, type FormEvent } from 'react'
import { api, errorText } from '../api'
import { btnCls, errCls, inputCls } from '../styles'
import { Card } from './ui'

export interface Field {
  key: string
  label: string
  type?: 'text' | 'date' | 'url' | 'textarea' | 'select'
  options?: string[]
  required?: boolean
}

type Row = { id: number } & Record<string, string | number | null>

interface Props { title: string; endpoint: string; fields: Field[]; statusKey: string; empty: string }

const isLink = (v: unknown): v is string => typeof v === 'string' && /^https?:\/\//i.test(v)

export default function Tracker({ title, endpoint, fields, statusKey, empty }: Props) {
  const blank = Object.fromEntries(fields.map((f) => [f.key, f.type === 'select' ? (f.options?.[0] ?? '') : '']))
  const [rows, setRows] = useState<Row[]>([])
  const [form, setForm] = useState<Record<string, string>>(blank)
  const [error, setError] = useState('')

  async function load() {
    try { setRows((await api.get<Row[]>(endpoint)).data) } catch (e) { setError(errorText(e)) }
  }
  useEffect(() => { void load() }, [])

  async function add(e: FormEvent) {
    e.preventDefault()
    setError('')
    const body: Record<string, string | null> = {}
    for (const f of fields) body[f.key] = f.type === 'date' && form[f.key] === '' ? null : form[f.key]
    try { await api.post(endpoint, body); setForm(blank); await load() } catch (err) { setError(errorText(err)) }
  }

  async function setStatus(id: number, value: string) {
    try { await api.patch(`${endpoint}${id}/`, { [statusKey]: value }); await load() } catch (err) { setError(errorText(err)) }
  }

  async function remove(id: number) {
    if (!window.confirm('Delete this entry?')) return
    try { await api.delete(`${endpoint}${id}/`); await load() } catch (err) { setError(errorText(err)) }
  }

  function cell(f: Field, r: Row) {
    const v = r[f.key]
    if (f.key === statusKey) {
      return (
        <select className={inputCls} value={String(v)} onChange={(e) => void setStatus(r.id, e.target.value)}>
          {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      )
    }
    if (isLink(v)) return <a className="text-emerald-700 underline" href={v} target="_blank" rel="noopener noreferrer">link</a>
    return v === null || String(v) === '' ? '—' : String(v)
  }

  return (
    <>
      {error && <p className={errCls}>{error}</p>}
      <Card title={title}>
        <form onSubmit={add} className="grid gap-3 md:grid-cols-2">
          {fields.map((f) => (
            <label key={f.key} className={`text-sm ${f.type === 'textarea' ? 'md:col-span-2' : ''}`}>
              {f.label}
              {f.type === 'select' ? (
                <select className={inputCls} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>
                  {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea className={inputCls} rows={2} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              ) : (
                <input className={inputCls} type={f.type === 'date' ? 'date' : f.type === 'url' ? 'url' : 'text'}
                  value={form[f.key]} required={f.required} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              )}
            </label>
          ))}
          <div className="md:col-span-2"><button className={btnCls}>Add</button></div>
        </form>
      </Card>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">{empty}</p>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>{fields.map((f) => <th key={f.key} className="p-2">{f.label}</th>)}<th /></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t align-top">
                    {fields.map((f) => <td key={f.key} className="max-w-xs p-2">{cell(f, r)}</td>)}
                    <td className="p-2"><button className="text-red-600 hover:underline" onClick={() => void remove(r.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  )
}

