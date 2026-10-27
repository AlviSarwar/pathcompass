import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Card } from './ui'

interface Item { kind: string; title: string; date: string; days_left: number; overdue: boolean; path: string }

function when(n: number) {
  if (n < 0) return `${-n} day(s) overdue`
  if (n === 0) return 'due today'
  if (n === 1) return 'due tomorrow'
  return `in ${n} days`
}

const tone = (i: Item) =>
  i.overdue ? 'bg-red-100 text-red-800' : i.days_left <= 3 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'

export default function DeadlineBanner() {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    api.get<Item[]>('/deadlines/').then((r) => setItems(r.data)).catch(() => setItems([]))
  }, [])

  if (items.length === 0) return null

  return (
    <Card title="Upcoming deadlines (next 14 days) and overdue items">
      <ul className="space-y-2 text-sm">
        {items.map((i) => (
          <li key={`${i.kind}-${i.title}-${i.date}`} className="flex flex-wrap items-center gap-2">
            <span className={`rounded px-2 py-0.5 text-xs font-semibold ${tone(i)}`}>{when(i.days_left)}</span>
            <span className="text-slate-500">{i.kind}</span>
            <Link className="font-medium text-emerald-700 underline" to={i.path}>{i.title}</Link>
            <span className="text-slate-500">({i.date})</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
