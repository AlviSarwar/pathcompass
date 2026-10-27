import axios from 'axios'

export const api = axios.create({ baseURL: 'http://127.0.0.1:8000/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Token ${token}`
  return config
})

export function errorText(err: unknown): string {
  if (axios.isAxiosError(err) && err.response && typeof err.response.data === 'object' && err.response.data) {
    return Object.entries(err.response.data as Record<string, unknown>)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : String(v)}`)
      .join(' | ')
  }
  return 'Something went wrong. Is the backend running?'
}

export async function downloadReport() {
  const res = await api.get('/report/pdf/', { responseType: 'blob' })
  const url = URL.createObjectURL(res.data as Blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'pathcompass-report.pdf'
  a.click()
  URL.revokeObjectURL(url)
}

export async function downloadFile(path: string, filename: string) {
  const res = await api.get(path, { responseType: 'blob' })
  const url = URL.createObjectURL(res.data as Blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
