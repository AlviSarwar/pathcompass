import { useEffect, useState, type FormEvent } from 'react'
import { api, errorText } from '../api'
import { Card } from '../components/ui'
import { btnCls, errCls, inputCls } from '../styles'
import type { Course, Scale, Semester } from '../types'

export default function Courses() {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [scale, setScale] = useState<Scale | null>(null)
  const [error, setError] = useState('')
  const [sem, setSem] = useState({ name: '', order: 1, is_planned: false })
  const [course, setCourse] = useState({ semester: '', code: '', title: '', credits: '3', letter_grade: '', status: 'completed' })

  async function load() {
    try {
      const [s, c, sc] = await Promise.all([
        api.get<Semester[]>('/semesters/'), api.get<Course[]>('/courses/'), api.get<Scale>('/scale/'),
      ])
      setSemesters(s.data)
      setCourses(c.data)
      setScale(sc.data)
      setSem((p) => ({ ...p, order: s.data.length ? Math.max(...s.data.map((x) => x.order)) + 1 : 1 }))
      setCourse((p) => ({ ...p, semester: p.semester || String(s.data[0]?.id ?? '') }))
    } catch (e) {
      setError(errorText(e))
    }
  }

  useEffect(() => { void load() }, [])

  async function addSemester(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await api.post('/semesters/', sem)
      setSem({ ...sem, name: '' })
      await load()
    } catch (err) { setError(errorText(err)) }
  }

  async function addCourse(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await api.post('/courses/', { ...course, semester: Number(course.semester) })
      setCourse({ ...course, code: '', title: '', letter_grade: '' })
      await load()
    } catch (err) { setError(errorText(err)) }
  }

  async function remove(url: string, what: string) {
    if (!window.confirm(`Delete this ${what}?`)) return
    try { await api.delete(url); await load() } catch (err) { setError(errorText(err)) }
  }

  return (
    <>
      {error && <p className={errCls}>{error}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Add semester">
          <form onSubmit={addSemester} className="space-y-2">
            <input className={inputCls} placeholder="e.g. Spring 2025" value={sem.name}
              onChange={(e) => setSem({ ...sem, name: e.target.value })} required />
            <input className={inputCls} type="number" min={1} value={sem.order}
              onChange={(e) => setSem({ ...sem, order: Number(e.target.value) })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={sem.is_planned} onChange={(e) => setSem({ ...sem, is_planned: e.target.checked })} />
              Planned (future) semester, not counted in CGPA
            </label>
            <button className={btnCls}>Add semester</button>
          </form>
        </Card>

        <Card title="Add course">
          <form onSubmit={addCourse} className="space-y-2">
            <select className={inputCls} value={course.semester} onChange={(e) => setCourse({ ...course, semester: e.target.value })} required>
              <option value="">Select semester…</option>
              {semesters.map((s) => <option key={s.id} value={s.id}>{s.name}{s.is_planned ? ' (planned)' : ''}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} placeholder="Code (CSE101)" value={course.code}
                onChange={(e) => setCourse({ ...course, code: e.target.value })} required />
              <input className={inputCls} type="number" step="0.5" min="0.5" value={course.credits}
                onChange={(e) => setCourse({ ...course, credits: e.target.value })} required />
            </div>
            <input className={inputCls} placeholder="Course title (optional)" value={course.title}
              onChange={(e) => setCourse({ ...course, title: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <select className={inputCls} value={course.letter_grade} onChange={(e) => setCourse({ ...course, letter_grade: e.target.value })}>
                <option value="">No grade yet</option>
                {scale?.boundaries.map((b) => <option key={b.letter} value={b.letter}>{b.letter} ({b.point})</option>)}
              </select>
              <select className={inputCls} value={course.status} onChange={(e) => setCourse({ ...course, status: e.target.value })}>
                <option value="completed">Completed</option>
                <option value="planned">Planned</option>
                <option value="withdrawn">Withdrawn</option>
                <option value="incomplete">Incomplete</option>
              </select>
            </div>
            <button className={btnCls}>Add course</button>
          </form>
        </Card>
      </div>

      {semesters.length === 0 && <p className="text-sm text-slate-500">Add a semester first, then add its courses.</p>}

      {semesters.map((s) => (
        <Card key={s.id} title={`${s.name}${s.is_planned ? ' (planned, not counted)' : ''}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr><th className="p-2">Code</th><th className="p-2">Title</th><th className="p-2">Credits</th>
                  <th className="p-2">Grade</th><th className="p-2">Point</th><th className="p-2">Status</th><th /></tr>
              </thead>
              <tbody>
                {courses.filter((c) => c.semester === s.id).map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-2 font-medium">{c.code}</td><td className="p-2">{c.title}</td><td className="p-2">{c.credits}</td>
                    <td className="p-2">{c.letter_grade || '—'}</td><td className="p-2">{c.grade_point ?? '—'}</td><td className="p-2">{c.status}</td>
                    <td className="p-2 text-right">
                      <button className="text-red-600 hover:underline" onClick={() => remove(`/courses/${c.id}/`, 'course')}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-2 text-xs text-red-600 hover:underline" onClick={() => remove(`/semesters/${s.id}/`, 'semester and all its courses')}>
            Delete this semester
          </button>
        </Card>
      ))}
    </>
  )
}
