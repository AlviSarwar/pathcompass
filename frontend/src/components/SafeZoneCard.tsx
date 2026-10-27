import { useEffect, useState } from 'react'
import { api } from '../api'
import type { SafeZone } from '../types'
import { Card } from './ui'

const barColor: Record<string, string> = {
  probation: 'bg-red-500', warning: 'bg-amber-500', safe: 'bg-emerald-500', deans_list: 'bg-sky-500', no_data: 'bg-slate-400',
}
const label: Record<string, string> = {
  probation: 'Below probation line', warning: 'Warning zone', safe: 'Safe zone', deans_list: "Dean's List zone", no_data: 'No data yet',
}

export default function SafeZoneCard() {
  const [z, setZ] = useState<SafeZone | null>(null)

  useEffect(() => {
    api.get<SafeZone>('/safe-zone/').then((r) => setZ(r.data)).catch(() => setZ(null))
  }, [])

  if (!z) return null
  const pct = (v: number) => Math.min(100, Math.max(0, (v / z.max_point) * 100))

  return (
    <Card title={`Safe-zone meter: ${label[z.status]}`}>
      <div className="relative h-4 rounded bg-slate-200">
        {z.cgpa !== null && <div className={`h-4 rounded ${barColor[z.status]}`} style={{ width: `${pct(z.cgpa)}%` }} />}
        <div className="absolute top-0 h-4 w-1 bg-red-600" style={{ left: `${pct(z.probation_cgpa)}%` }} title="Probation line" />
        <div className="absolute top-0 h-4 w-1 bg-sky-600" style={{ left: `${pct(z.deans_list_cgpa)}%` }} title="Dean's List line" />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Red marker: probation line {z.probation_cgpa.toFixed(2)}. Blue marker: Dean&apos;s List line {z.deans_list_cgpa.toFixed(2)}. Change both in Settings.
      </p>
      <p className="mt-1 text-sm">{z.message}</p>
    </Card>
  )
}
