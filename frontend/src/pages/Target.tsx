import { useEffect, useState, type FormEvent } from 'react'
import { api, errorText } from '../api'
import { Card, Stat } from '../components/ui'
import { btnCls, errCls, inputCls } from '../styles'
import type { TargetResult } from '../types'

const fmt = (n: number | null) => (n === null ? '—' : n.toFixed(2))

export default function Target() {
  const [target, setTarget] = useState('')
  const [result, setResult] = useState<TargetResult | null>(null)
  const [error, setError] = useState('')

  async function run(value: string) {
    setError('')
    try {
      const res = await api.get<TargetResult>('/target/', { params: value ? { target: value } : {} })
      setResult(res.data)
      setTarget(String(res.data.target_cgpa))
    } catch (err) { setError(errorText(err)) }
  }

  useEffect(() => { void run('') }, [])

  function submit(e: FormEvent) {
    e.preventDefault()
    void run(target)
  }

  return (
    <>
      <Card title="Target CGPA calculator">
        <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
          <input className={`${inputCls} max-w-[8rem]`} type="number" step="0.01" min="0" value={target}
            onChange={(e) => setTarget(e.target.value)} />
          {['3.25', '3.50', '3.60', '3.75', '3.90'].map((t) => (
            <button type="button" key={t} className="rounded border px-3 py-1.5 text-sm hover:bg-slate-100"
              onClick={() => void run(t)}>{t}</button>
          ))}
          <button className={btnCls}>Calculate</button>
        </form>
      </Card>

      {error && <p className={errCls}>{error}</p>}

      {result && (
        <>
          <p className={`rounded p-3 text-sm font-medium ${result.achievable ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-800'}`}>
            {result.message}
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Required avg GPA" value={fmt(result.required_avg_gpa)} hint={`over ${result.remaining_credits} credits`} />
            <Stat label="Current CGPA" value={fmt(result.current_cgpa)} />
            <Stat label="Highest possible" value={fmt(result.highest_final_cgpa)} hint="all top grades" />
            <Stat label="Lowest possible" value={fmt(result.lowest_final_cgpa)} hint="all lowest grades" />
          </div>
          {result.scenarios.length > 0 && (
            <Card title="What-if scenarios (illustrative, not predictions)">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-500">
                  <tr><th className="p-2">If you average</th><th className="p-2">Final CGPA</th><th className="p-2">Meets target?</th></tr>
                </thead>
                <tbody>
                  {result.scenarios.map((s) => (
                    <tr key={s.future_gpa} className="border-t">
                      <td className="p-2">{s.future_gpa.toFixed(2)}</td><td className="p-2">{s.final_cgpa.toFixed(2)}</td>
                      <td className="p-2">{s.meets_target ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}
    </>
  )
}
