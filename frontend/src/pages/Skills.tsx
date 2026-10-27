import { useEffect, useState, type FormEvent } from 'react'
import { api, errorText } from '../api'
import { Card } from '../components/ui'
import { btnCls, errCls, inputCls } from '../styles'
import type { Skill } from '../types'

const STARTERS = ['Python', 'SQL', 'Git', 'JavaScript', 'Excel', 'Statistics', 'Communication']

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [form, setForm] = useState({ name: '', level: 0, target_level: 80 })
  const [error, setError] = useState('')

  async function load() {
    try { setSkills((await api.get<Skill[]>('/skills/')).data) } catch (e) { setError(errorText(e)) }
  }
  useEffect(() => { void load() }, [])

  async function add(name: string, level = form.level, target = form.target_level) {
    setError('')
    try {
      await api.post('/skills/', { name, level, target_level: target })
      setForm({ name: '', level: 0, target_level: 80 })
      await load()
    } catch (e) { setError(errorText(e)) }
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    void add(form.name)
  }

  const setLevel = (id: number, level: number) => setSkills(skills.map((s) => (s.id === id ? { ...s, level } : s)))

  async function save(s: Skill) {
    try { await api.patch(`/skills/${s.id}/`, { level: s.level }) } catch (e) { setError(errorText(e)) }
  }

  async function remove(id: number) {
    if (!window.confirm('Delete this skill?')) return
    try { await api.delete(`/skills/${id}/`); await load() } catch (e) { setError(errorText(e)) }
  }

  const missing = STARTERS.filter((n) => !skills.some((s) => s.name.toLowerCase() === n.toLowerCase()))

  return (
    <>
      {error && <p className={errCls}>{error}</p>}
      <Card title="Add a skill">
        <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
          <label className="text-sm">Skill<input className={inputCls} value={form.name} placeholder="e.g. Python"
            onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label className="text-sm">Level (0-100)<input className={`${inputCls} w-24`} type="number" min={0} max={100} value={form.level}
            onChange={(e) => setForm({ ...form, level: Number(e.target.value) })} /></label>
          <label className="text-sm">Target<input className={`${inputCls} w-24`} type="number" min={0} max={100} value={form.target_level}
            onChange={(e) => setForm({ ...form, target_level: Number(e.target.value) })} /></label>
          <button className={btnCls}>Add</button>
        </form>
        {missing.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-500">Quick add:</span>
            {missing.map((n) => (
              <button key={n} type="button" className="rounded border px-2 py-1 hover:bg-slate-100" onClick={() => void add(n, 0, 80)}>{n}</button>
            ))}
          </div>
        )}
      </Card>

      {skills.length === 0 && <p className="text-sm text-slate-500">No skills yet. Your own estimate is fine; update it as you learn.</p>}

      {skills.map((s) => (
        <Card key={s.id}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{s.name}</h3>
            <button className="text-sm text-red-600 hover:underline" onClick={() => void remove(s.id)}>Delete</button>
          </div>
          <div className="relative mt-2 h-3 rounded bg-slate-200">
            <div className="h-3 rounded bg-emerald-500" style={{ width: `${s.level}%` }} />
            <div className="absolute top-0 h-3 w-1 bg-sky-600" style={{ left: `${s.target_level}%` }} title="Target" />
          </div>
          <div className="mt-2 flex items-center gap-3 text-sm">
            <input type="range" min={0} max={100} value={s.level} className="flex-1"
              onChange={(e) => setLevel(s.id, Number(e.target.value))}
              onPointerUp={() => void save(s)} onKeyUp={() => void save(s)} />
            <span>{s.level}% of target {s.target_level}%</span>
          </div>
        </Card>
      ))}
    </>
  )
}
