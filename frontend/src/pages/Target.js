import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api, errorText } from '../api';
import { Card, Stat } from '../components/ui';
import { btnCls, errCls, inputCls } from '../styles';
const fmt = (n) => (n === null ? '—' : n.toFixed(2));
export default function Target() {
    const [target, setTarget] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    async function run(value) {
        setError('');
        try {
            const res = await api.get('/target/', { params: value ? { target: value } : {} });
            setResult(res.data);
            setTarget(String(res.data.target_cgpa));
        }
        catch (err) {
            setError(errorText(err));
        }
    }
    useEffect(() => { void run(''); }, []);
    function submit(e) {
        e.preventDefault();
        void run(target);
    }
    return (_jsxs(_Fragment, { children: [_jsx(Card, { title: "Target CGPA calculator", children: _jsxs("form", { onSubmit: submit, className: "flex flex-wrap items-center gap-2", children: [_jsx("input", { className: `${inputCls} max-w-[8rem]`, type: "number", step: "0.01", min: "0", value: target, onChange: (e) => setTarget(e.target.value) }), ['3.25', '3.50', '3.60', '3.75', '3.90'].map((t) => (_jsx("button", { type: "button", className: "rounded border px-3 py-1.5 text-sm hover:bg-slate-100", onClick: () => void run(t), children: t }, t))), _jsx("button", { className: btnCls, children: "Calculate" })] }) }), error && _jsx("p", { className: errCls, children: error }), result && (_jsxs(_Fragment, { children: [_jsx("p", { className: `rounded p-3 text-sm font-medium ${result.achievable ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-800'}`, children: result.message }), _jsxs("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-4", children: [_jsx(Stat, { label: "Required avg GPA", value: fmt(result.required_avg_gpa), hint: `over ${result.remaining_credits} credits` }), _jsx(Stat, { label: "Current CGPA", value: fmt(result.current_cgpa) }), _jsx(Stat, { label: "Highest possible", value: fmt(result.highest_final_cgpa), hint: "all top grades" }), _jsx(Stat, { label: "Lowest possible", value: fmt(result.lowest_final_cgpa), hint: "all lowest grades" })] }), result.scenarios.length > 0 && (_jsx(Card, { title: "What-if scenarios (illustrative, not predictions)", children: _jsxs("table", { className: "w-full text-left text-sm", children: [_jsx("thead", { className: "text-slate-500", children: _jsxs("tr", { children: [_jsx("th", { className: "p-2", children: "If you average" }), _jsx("th", { className: "p-2", children: "Final CGPA" }), _jsx("th", { className: "p-2", children: "Meets target?" })] }) }), _jsx("tbody", { children: result.scenarios.map((s) => (_jsxs("tr", { className: "border-t", children: [_jsx("td", { className: "p-2", children: s.future_gpa.toFixed(2) }), _jsx("td", { className: "p-2", children: s.final_cgpa.toFixed(2) }), _jsx("td", { className: "p-2", children: s.meets_target ? 'Yes' : 'No' })] }, s.future_gpa))) })] }) }))] }))] }));
}
