import { useState, type FormEvent } from 'react'
import { api, errorText } from '../api'
import { btnCls, errCls, inputCls } from '../styles'
import { Card } from './ui'

interface WhatIf { current_cgpa: number | null; after_cgpa: number | null; change: number | null; credits: number; grade_point: number }

export default function WhatIfCard() {
  const [credits, setCredits] = useState('3')
  const [gp, setGp] = useState('0')
  const [res, setRes] = useState<WhatIf | null>(null)
  const [error, setError] = useState('')

  async function run(c: string, g: string) {
    setError('')
    try {
      const r = await api.get<WhatIf>('/what-if/', { params: { credits: c, grade_point: g } })
      setRes(r.data)
    } catch (err) { setError(errorText(err)) }
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    void run(credits, gp)
  }

  return (
    <Card title="What if I fail (or ace) a course?">
      <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
        <label className="text-sm">Credits<input className={`${inputCls} w-24`} type="number" step="0.5" min="0.5" value={credits}
          onChange={(e) => setCredits(e.target.value)} /></label>
        <label className="text-sm">Grade point<input className={`${inputCls} w-24`} type="number" step="0.01" min="0" value={gp}
          onChange={(e) => setGp(e.target.value)} /></label>
        <button className={btnCls}>Calculate</button>
        <button type="button" className="rounded border px-3 py-2 text-sm hover:bg-slate-100"
          onClick={() => { setGp('0'); void run(credits, '0') }}>Fail it (0.00)</button>
      </form>
      {error && <p className={`${errCls} mt-2`}>{error}</p>}
      {res && (
        <p className="mt-3 text-sm">
          {res.current_cgpa === null || res.after_cgpa === null || res.change === null
            ? `With no graded courses yet, a ${res.credits}-credit course at ${res.grade_point.toFixed(2)} would start you at ${res.after_cgpa?.toFixed(2)}.`
            : `Your CGPA would go from ${res.current_cgpa.toFixed(2)} to ${res.after_cgpa.toFixed(2)} (${res.change >= 0 ? '+' : ''}${res.change.toFixed(2)}).`}
          {' '}This treats it as a new course. For a retake of an existing course, use the retake calculator below, which follows your retake policy.
        </p>
      )}
    </Card>
  )
}
