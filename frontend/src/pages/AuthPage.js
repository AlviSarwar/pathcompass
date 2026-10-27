import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { api, errorText } from '../api';
import { btnCls, errCls, inputCls } from '../styles';
export default function AuthPage({ onLogin }) {
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    async function submit(e) {
        e.preventDefault();
        setError('');
        try {
            const url = mode === 'login' ? '/auth/login/' : '/auth/register/';
            const body = mode === 'login' ? { username: form.username, password: form.password } : form;
            const res = await api.post(url, body);
            onLogin(res.data.token);
        }
        catch (err) {
            setError(errorText(err));
        }
    }
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-slate-900 p-4", children: _jsxs("form", { onSubmit: submit, className: "w-full max-w-sm space-y-3 rounded-lg bg-white p-6 shadow-lg", children: [_jsx("h1", { className: "text-2xl font-bold text-emerald-600", children: "PathCompass" }), _jsx("p", { className: "text-sm text-slate-500", children: "Smart CGPA and career planner" }), error && _jsx("p", { className: errCls, children: error }), _jsx("input", { className: inputCls, placeholder: "Username", value: form.username, onChange: (e) => setForm({ ...form, username: e.target.value }), required: true }), mode === 'register' && (_jsx("input", { className: inputCls, type: "email", placeholder: "Email", value: form.email, onChange: (e) => setForm({ ...form, email: e.target.value }), required: true })), _jsx("input", { className: inputCls, type: "password", placeholder: "Password (8+ characters)", value: form.password, onChange: (e) => setForm({ ...form, password: e.target.value }), required: true }), _jsx("button", { className: `${btnCls} w-full`, children: mode === 'login' ? 'Log in' : 'Create account' }), _jsx("button", { type: "button", className: "w-full text-sm text-slate-600 underline", onClick: () => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }, children: mode === 'login' ? 'New here? Create an account' : 'Have an account? Log in' })] }) }));
}
