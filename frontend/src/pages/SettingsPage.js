import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api, errorText } from '../api';
import { Card } from '../components/ui';
import { btnCls, errCls, inputCls } from '../styles';
export default function SettingsPage() {
    const [profile, setProfile] = useState(null);
    const [rows, setRows] = useState([]);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    useEffect(() => {
        Promise.all([api.get('/profile/'), api.get('/scale/')])
            .then(([p, s]) => { setProfile(p.data); setRows(s.data.boundaries); })
            .catch((e) => setError(errorText(e)));
    }, []);
    async function saveProfile(e) {
        e.preventDefault();
        setMsg('');
        setError('');
        try {
            await api.patch('/profile/', profile);
            setMsg('Profile saved.');
        }
        catch (err) {
            setError(errorText(err));
        }
    }
    async function saveScale() {
        setMsg('');
        setError('');
        try {
            const res = await api.put('/scale/', { boundaries: rows });
            setRows(res.data.boundaries);
            setMsg('Grading scale saved. All your courses were recalculated.');
        }
        catch (err) {
            setError(errorText(err));
        }
    }
    const setP = (k, v) => profile && setProfile({ ...profile, [k]: v });
    const setRow = (i, patch) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
    if (!profile)
        return error ? _jsx("p", { className: errCls, children: error }) : _jsx("p", { children: "Loading\u2026" });
    return (_jsxs(_Fragment, { children: [msg && _jsx("p", { className: "rounded bg-emerald-100 p-3 text-sm text-emerald-900", children: msg }), error && _jsx("p", { className: errCls, children: error }), _jsx(Card, { title: "Academic profile and policies", children: _jsxs("form", { onSubmit: saveProfile, className: "grid gap-3 md:grid-cols-2", children: [_jsxs("label", { className: "text-sm", children: ["University", _jsx("input", { className: inputCls, value: profile.university, onChange: (e) => setP('university', e.target.value) })] }), _jsxs("label", { className: "text-sm", children: ["Department", _jsx("input", { className: inputCls, value: profile.department, onChange: (e) => setP('department', e.target.value) })] }), _jsxs("label", { className: "text-sm", children: ["Degree name", _jsx("input", { className: inputCls, value: profile.degree_name, onChange: (e) => setP('degree_name', e.target.value) })] }), _jsxs("label", { className: "text-sm", children: ["Total credits required to graduate (check your program!)", _jsx("input", { className: inputCls, type: "number", step: "0.5", value: profile.total_credits_required, onChange: (e) => setP('total_credits_required', e.target.value) })] }), _jsxs("label", { className: "text-sm", children: ["Target CGPA", _jsx("input", { className: inputCls, type: "number", step: "0.01", value: profile.target_cgpa, onChange: (e) => setP('target_cgpa', e.target.value) })] }), _jsxs("label", { className: "text-sm", children: ["Retake policy", _jsxs("select", { className: inputCls, value: profile.retake_policy, onChange: (e) => setP('retake_policy', e.target.value), children: [_jsx("option", { value: "latest", children: "Latest attempt replaces the old grade" }), _jsx("option", { value: "highest", children: "Highest grade counts" }), _jsx("option", { value: "all", children: "All attempts count" })] })] }), _jsxs("label", { className: "text-sm", children: ["Decimal places for GPA/CGPA", _jsx("input", { className: inputCls, type: "number", min: 0, max: 4, value: profile.rounding_places, onChange: (e) => setP('rounding_places', e.target.value) })] }), _jsxs("label", { className: "text-sm", children: ["Career track", _jsx("input", { className: inputCls, placeholder: "e.g. Data Analytics", value: profile.career_track, onChange: (e) => setP('career_track', e.target.value) })] }), _jsx("div", { className: "md:col-span-2", children: _jsx("button", { className: btnCls, children: "Save profile" }) })] }) }), _jsxs(Card, { title: "Grading scale (edit to match your university)", children: [_jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "text-left text-slate-500", children: _jsxs("tr", { children: [_jsx("th", { className: "p-1", children: "Letter" }), _jsx("th", { className: "p-1", children: "Grade point" }), _jsx("th", { className: "p-1", children: "Passing?" }), _jsx("th", {})] }) }), _jsx("tbody", { children: rows.map((r, i) => (_jsxs("tr", { children: [_jsx("td", { className: "p-1", children: _jsx("input", { className: inputCls, value: r.letter, onChange: (e) => setRow(i, { letter: e.target.value }) }) }), _jsx("td", { className: "p-1", children: _jsx("input", { className: inputCls, type: "number", step: "0.01", min: "0", value: r.point, onChange: (e) => setRow(i, { point: e.target.value }) }) }), _jsx("td", { className: "p-1", children: _jsx("input", { type: "checkbox", checked: r.is_pass, onChange: (e) => setRow(i, { is_pass: e.target.checked }) }) }), _jsx("td", { className: "p-1", children: _jsx("button", { className: "text-red-600", onClick: () => setRows(rows.filter((_, j) => j !== i)), children: "Remove" }) })] }, i))) })] }), _jsxs("div", { className: "mt-3 flex gap-2", children: [_jsx("button", { className: "rounded border px-3 py-2 text-sm", onClick: () => setRows([...rows, { letter: '', point: '0.00', is_pass: true }]), children: "Add grade" }), _jsx("button", { className: btnCls, onClick: saveScale, children: "Save scale" })] })] })] }));
}
