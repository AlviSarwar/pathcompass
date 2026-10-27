import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api, errorText } from '../api'
import { Card, Stat } from '../components/ui'
import SafeZoneCard from '../components/SafeZoneCard'
import { errCls } from '../styles'
import type { DashboardData } from '../types'

const fmt = (n: number | null) => (n === null ? '—' : n.toFixed(2))

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<DashboardData>('/dashboard/').then((r) => setData(r.data)).catch((e) => setError(errorText(e)))
  }, [])

  if (error) return <p className={errCls}>{error}</p>
  if (!data) return <p>Loading…</p>

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Current CGPA" value={fmt(data.cgpa)} hint={`out of ${data.max_point.toFixed(2)}`} />
        <Stat label="Target CGPA" value={fmt(data.target_cgpa)} hint="change in Settings" />
        <Stat label="Credits earned" value={String(data.credits_earned)} hint={`of ${data.total_credits_required} required`} />
        <Stat label="Credits remaining" value={String(data.credits_remaining)} />
      </div>

      {data.semesters.length === 0 && (
        <Card>
          <p className="text-sm">
            No semesters yet. <Link className="font-semibold text-emerald-700 underline" to="/courses">Add your first semester and courses</Link>.
          </p>
        </Card>
      )}

      {data.warnings.map((w) => (
        <p key={w} className="rounded bg-amber-100 p-3 text-sm text-amber-900">{w}</p>
      ))}

      <SafeZoneCard />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="CGPA trend">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.semesters}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, data.max_point]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cgpa" name="Cumulative CGPA" stroke="#059669" strokeWidth={2} />
                  <Line type="monotone" dataKey="gpa" name="Semester GPA" stroke="#2563eb" strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        <Card title="Highlights">
          <ul className="space-y-1 text-sm">
            <li>Completed semesters: <b>{data.completed_semesters}</b></li>
            <li>Best semester: <b>{data.best_semester ? `${data.best_semester.name} (${data.best_semester.gpa.toFixed(2)})` : '—'}</b></li>
            <li>Lowest semester: <b>{data.lowest_semester ? `${data.lowest_semester.name} (${data.lowest_semester.gpa.toFixed(2)})` : '—'}</b></li>
          </ul>
          <h3 className="mb-1 mt-3 text-sm font-semibold">Grade distribution</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.grade_distribution).map(([letter, n]) => (
              <span key={letter} className="rounded bg-slate-100 px-2 py-1 text-xs">{letter}: {n}</span>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Semester results">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr><th className="p-2">Semester</th><th className="p-2">Credits</th><th className="p-2">GPA</th><th className="p-2">CGPA after</th></tr>
            </thead>
            <tbody>
              {data.semesters.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2">{s.name}</td><td className="p-2">{s.credits}</td>
                  <td className="p-2">{fmt(s.gpa)}</td><td className="p-2">{fmt(s.cgpa)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="How this was calculated">
        <p className="text-sm text-slate-600">{data.explanation}</p>
      </Card>
    </>
  )
}

