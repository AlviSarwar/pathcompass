import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, Outlet } from 'react-router-dom';
const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/courses', label: 'Semesters & Courses' },
    { to: '/target', label: 'Target CGPA' },
    { to: '/settings', label: 'Settings' },
];
export default function Layout({ onLogout }) {
    return (_jsxs("div", { className: "min-h-screen bg-slate-50 text-slate-900", children: [_jsx("header", { className: "bg-slate-900 text-white", children: _jsxs("div", { className: "mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3", children: [_jsx("span", { className: "text-lg font-bold text-emerald-400", children: "PathCompass" }), _jsx("nav", { className: "flex flex-wrap gap-1", children: links.map((l) => (_jsx(NavLink, { to: l.to, end: l.to === '/', className: ({ isActive }) => `rounded px-3 py-1.5 text-sm ${isActive ? 'bg-emerald-500 font-semibold text-slate-900' : 'hover:bg-slate-700'}`, children: l.label }, l.to))) }), _jsx("button", { onClick: onLogout, className: "ml-auto text-sm text-slate-300 hover:text-white", children: "Log out" })] }) }), _jsx("main", { className: "mx-auto max-w-6xl space-y-4 p-4", children: _jsx(Outlet, {}) })] }));
}
