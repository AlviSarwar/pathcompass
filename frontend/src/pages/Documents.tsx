import { useState } from 'react'
import { api, errorText } from '../api'
import Tracker from '../components/Tracker'
import { Card } from '../components/ui'
import { errCls } from '../styles'

export default function Documents() {
  const [reload, setReload] = useState(0)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  async function seed() {
    setMsg('')
    setError('')
    try {
      const res = await api.post<{ added: number }>('/documents/seed/')
      setMsg(res.data.added ? `Added ${res.data.added} starter item(s).` : 'You already have every starter item.')
      setReload(reload + 1)
    } catch (err) { setError(errorText(err)) }
  }

  return (
    <>
      <Card title="Starter checklist">
        <p className="mb-2 text-sm text-slate-600">
          Adds the usual study-abroad documents. Requirements differ by university and scholarship, so check each official page.
        </p>
        <button className="rounded border px-3 py-2 text-sm hover:bg-slate-100" onClick={() => void seed()}>Add starter list</button>
        {msg && <p className="mt-2 text-sm text-emerald-700">{msg}</p>}
        {error && <p className={`${errCls} mt-2`}>{error}</p>}
      </Card>
      <Tracker key={reload} title="Document checklist" endpoint="/documents/" statusKey="status"
        empty="No documents yet. Press the button above or add your own."
        fields={[
          { key: 'name', label: 'Document', required: true },
          { key: 'status', label: 'Status', type: 'select', options: ['todo', 'in_progress', 'ready', 'submitted'] },
          { key: 'due_date', label: 'Due date', type: 'date' },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ]} />
    </>
  )
}
