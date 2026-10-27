import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Card({ title, children }) {
    return (_jsxs("section", { className: "rounded-lg border border-slate-200 bg-white p-4 shadow-sm", children: [title && _jsx("h2", { className: "mb-3 text-base font-semibold text-slate-800", children: title }), children] }));
}
export function Stat({ label, value, hint }) {
    return (_jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-4 shadow-sm", children: [_jsx("p", { className: "text-xs uppercase tracking-wide text-slate-500", children: label }), _jsx("p", { className: "mt-1 text-3xl font-bold text-slate-900", children: value }), hint && _jsx("p", { className: "mt-1 text-xs text-slate-500", children: hint })] }));
}
