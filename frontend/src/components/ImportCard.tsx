import axios from 'axios'
import { useState, type ChangeEvent } from 'react'
import { api, downloadFile, errorText } from '../api'
import { Card } from './ui'

export default function ImportCard({ onDone }: { onDone: () => void }) {
  const [errors, setErrors] = useState<string[]>([])
  const [msg, setMsg] = useState('')

  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setErrors([])
    setMsg('')
    try {
      const res = await api.post<{ imported: number }>('/import/courses/', { csv: await file.text() })
      setMsg(`Imported ${res.data.imported} course(s).`)
      onDone()
    } catch (err) {
      const errs = axios.isAxiosError(err) ? (err.response?.data as { errors?: string[] } | undefined)?.errors : undefined
      setErrors(Array.isArray(errs) ? errs : [errorText(err)])
    }
  }

  return (
    <Card title="Import courses from CSV">
      <p className="mb-2 text-sm text-slate-600">
        Every row is checked first. If any row is wrong, nothing is imported and you see which lines to fix.
      </p>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <button type="button" className="rounded border px-3 py-2 hover:bg-slate-100"
          onClick={() => void downloadFile('/import/template/', 'pathcompass-courses-template.csv')}>Download template</button>
        <input type="file" accept=".csv,text/csv" onChange={(e) => void pick(e)} />
      </div>
      {msg && <p className="mt-2 rounded bg-emerald-100 p-2 text-sm text-emerald-900">{msg}</p>}
      {errors.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 rounded bg-red-100 p-3 pl-6 text-sm text-red-800">
          {errors.map((m) => <li key={m}>{m}</li>)}
        </ul>
      )}
    </Card>
  )
}
