import axios from 'axios';
export const api = axios.create({ baseURL: 'http://127.0.0.1:8000/api' });
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token)
        config.headers.Authorization = `Token ${token}`;
    return config;
});
export function errorText(err) {
    if (axios.isAxiosError(err) && err.response && typeof err.response.data === 'object' && err.response.data) {
        return Object.entries(err.response.data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : String(v)}`)
            .join(' | ');
    }
    return 'Something went wrong. Is the backend running?';
}
