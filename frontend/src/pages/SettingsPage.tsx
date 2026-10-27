import { useEffect, useState, type FormEvent } from 'react'
import { api, errorText } from '../api'
import { Card } from '../components/ui'
import { btnCls, errCls, inputCls } from '../styles'
import type { Boundary, Profile, Scale } from '../types'

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [rows, setRows] = useState<Boundary[]>([])
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get<Profile>('/profile/'), api.get<Scale>('/scale/')])
      .then(([p, s]) => { setProfile(p.data); setRows(s.data.boundaries) })
      .catch((e) => setError(errorText(e)))
  }, [])

  async function saveProfile(e: FormEvent) {
    e.preventDefault()
    setMsg(''); setError('')
    try { await api.patch('/profile/', profile); setMsg('Profile saved.') } catch (err) { setError(errorText(err)) }
  }

  async function saveScale() {
    setMsg(''); setError('')
    try {
      const res = await api.put<Scale>('/scale/', { boundaries: rows })
      setRows(res.data.boundaries)
      setMsg('Grading scale saved. All your courses were recalculated.')
    } catch (err) { setError(errorText(err)) }
  }

  const setP = (k: keyof Profile, v: string) => profile && setProfile({ ...profile, [k]: v })
  const setRow = (i: number, patch: Partial<Boundary>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  if (!profile) return error ? <p className={errCls}>{error}</p> : <p>Loading…</p>

  return (
    <>
      {msg && <p className="rounded bg-emerald-100 p-3 text-sm text-emerald-900">{msg}</p>}
      {error && <p className={errCls}>{error}</p>}

      <Card title="Academic profile and policies">
        <form onSubmit={saveProfile} className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">University<input className={inputCls} value={profile.university} onChange={(e) => setP('university', e.target.value)} /></label>
          <label className="text-sm">Department<input className={inputCls} value={profile.department} onChange={(e) => setP('department', e.target.value)} /></label>
          <label className="text-sm">Degree name<input className={inputCls} value={profile.degree_name} onChange={(e) => setP('degree_name', e.target.value)} /></label>
          <label className="text-sm">Total credits required to graduate (check your program!)
            <input className={inputCls} type="number" step="0.5" value={profile.total_credits_required} onChange={(e) => setP('total_credits_required', e.target.value)} /></label>
          <label className="text-sm">Target CGPA
            <input className={inputCls} type="number" step="0.01" value={profile.target_cgpa} onChange={(e) => setP('target_cgpa', e.target.value)} /></label>
          <label className="text-sm">Retake policy
            <select className={inputCls} value={profile.retake_policy} onChange={(e) => setP('retake_policy', e.target.value)}>
              <option value="latest">Latest attempt replaces the old grade</option>
              <option value="highest">Highest grade counts</option>
              <option value="all">All attempts count</option>
            </select></label>
          <label className="text-sm">Decimal places for GPA/CGPA
            <input className={inputCls} type="number" min={0} max={4} value={profile.rounding_places} onChange={(e) => setP('rounding_places', e.target.value)} /></label>
          <label className="text-sm">Career track
            <input className={inputCls} placeholder="e.g. Data Analytics" value={profile.career_track} onChange={(e) => setP('career_track', e.target.value)} /></label>
          <label className="text-sm">Probation line (CGPA below this is at risk)
            <input className={inputCls} type="number" step="0.01" value={profile.probation_cgpa} onChange={(e) => setP('probation_cgpa', e.target.value)} /></label>
          <label className="text-sm">Dean's List line (CGPA)
            <input className={inputCls} type="number" step="0.01" value={profile.deans_list_cgpa} onChange={(e) => setP('deans_list_cgpa', e.target.value)} /></label>
          <label className="text-sm">Maximum credits per semester
            <input className={inputCls} type="number" step="0.5" value={profile.max_credits_per_semester} onChange={(e) => setP('max_credits_per_semester', e.target.value)} /></label>
          <div className="md:col-span-2"><button className={btnCls}>Save profile</button></div>
        </form>
      </Card>

      <Card title="Grading scale (edit to match your university)">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500"><tr><th className="p-1">Letter</th><th className="p-1">Grade point</th><th className="p-1">Passing?</th><th /></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="p-1"><input className={inputCls} value={r.letter} onChange={(e) => setRow(i, { letter: e.target.value })} /></td>
                <td className="p-1"><input className={inputCls} type="number" step="0.01" min="0" value={r.point} onChange={(e) => setRow(i, { point: e.target.value })} /></td>
                <td className="p-1"><input type="checkbox" checked={r.is_pass} onChange={(e) => setRow(i, { is_pass: e.target.checked })} /></td>
                <td className="p-1"><button className="text-red-600" onClick={() => setRows(rows.filter((_, j) => j !== i))}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 flex gap-2">
          <button className="rounded border px-3 py-2 text-sm" onClick={() => setRows([...rows, { letter: '', point: '0.00', is_pass: true }])}>Add grade</button>
          <button className={btnCls} onClick={saveScale}>Save scale</button>
        </div>
      </Card>
    </>
  )
}

