import { useEffect, useState, type FormEvent } from 'react'
import { api, errorText } from '../api'
import SafeZoneCard from '../components/SafeZoneCard'
import WhatIfCard from '../components/WhatIfCard'
import { Card } from '../components/ui'
import { btnCls, errCls, inputCls } from '../styles'
import type { CreditPlan, RetakeImpact } from '../types'

const badge: Record<string, string> = {
  over: 'bg-red-100 text-red-800', ok: 'bg-emerald-100 text-emerald-900', empty: 'bg-slate-100 text-slate-600',
}
const policyNote: Record<string, string> = {
  latest: 'Your policy: the new grade replaces the old one.',
  highest: 'Your policy: the highest grade counts.',
  all: 'Your policy: every attempt counts, so a retake adds a new attempt instead of replacing the old one.',
}

export default function Insights() {
  const [plan, setPlan] = useState<CreditPlan | null>(null)
  const [impact, setImpact] = useState<RetakeImpact | null>(null)
  const [gp, setGp] = useState('')
  const [error, setError] = useState('')

  async function loadImpact(value: string) {
    setError('')
    try {
      const res = await api.get<RetakeImpact>('/retake-impact/', { params: value ? { grade_point: value } : {} })
      setImpact(res.data)
      setGp(String(res.data.grade_point))
    } catch (err) { setError(errorText(err)) }
  }

  useEffect(() => {
    api.get<CreditPlan>('/credit-plan/').then((r) => setPlan(r.data)).catch((e) => setError(errorText(e)))
    void loadImpact('')
  }, [])

  function submit(e: FormEvent) {
    e.preventDefault()
    void loadImpact(gp)
  }

  return (
    <>
      {error && <p className={errCls}>{error}</p>}
      <SafeZoneCard />
      <WhatIfCard />

      <Card title="Retake impact: which retake helps your CGPA most?">
        <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
          <label className="text-sm">If I retake and get grade point</label>
          <input className={`${inputCls} max-w-[7rem]`} type="number" step="0.01" min="0.01" value={gp}
            onChange={(e) => setGp(e.target.value)} />
          <button className={btnCls}>Calculate</button>
        </form>
        {impact && (
          <>
            <p className="mt-2 text-xs text-slate-500">
              Current CGPA {impact.base_cgpa === null ? '—' : impact.base_cgpa.toFixed(2)}. {policyNote[impact.policy]} Only courses below that grade are listed.
            </p>
            {impact.items.length === 0 ? (
              <p className="mt-3 text-sm">No retake would raise your CGPA at this grade point.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-slate-500">
                    <tr><th className="p-2">Course</th><th className="p-2">Credits</th><th className="p-2">Current</th>
                      <th className="p-2">CGPA after retake</th><th className="p-2">Gain</th></tr>
                  </thead>
                  <tbody>
                    {impact.items.map((r) => (
                      <tr key={r.code} className="border-t">
                        <td className="p-2 font-medium">{r.code}</td><td className="p-2">{r.credits}</td>
                        <td className="p-2">{r.current_letter} ({r.current_point.toFixed(2)})</td>
                        <td className="p-2">{r.new_cgpa.toFixed(2)}</td>
                        <td className="p-2 font-semibold text-emerald-700">+{r.gain.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Card>

      <Card title="Credit planner">
        {plan && (
          <>
            <p className="mb-2 text-sm">
              Limit per semester: <b>{plan.max_per_semester}</b> credits (change in Settings). Remaining to graduate:{' '}
              <b>{plan.remaining_credits}</b>. At this limit you need at least <b>{plan.min_semesters_needed}</b> more semester(s).
            </p>
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500"><tr><th className="p-2">Semester</th><th className="p-2">Credits</th><th className="p-2">Status</th></tr></thead>
              <tbody>
                {plan.semesters.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-2">{s.name}{s.is_planned ? ' (planned)' : ''}</td>
                    <td className="p-2">{s.credits}</td>
                    <td className="p-2"><span className={`rounded px-2 py-0.5 text-xs ${badge[s.status]}`}>{s.message}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Card>
    </>
  )
}

