import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api, errorText } from '../api';
import { Card } from '../components/ui';
import { btnCls, errCls, inputCls } from '../styles';
export default function Courses() {
    const [semesters, setSemesters] = useState([]);
    const [courses, setCourses] = useState([]);
    const [scale, setScale] = useState(null);
    const [error, setError] = useState('');
    const [sem, setSem] = useState({ name: '', order: 1, is_planned: false });
    const [course, setCourse] = useState({ semester: '', code: '', title: '', credits: '3', letter_grade: '', status: 'completed' });
    async function load() {
        try {
            const [s, c, sc] = await Promise.all([
                api.get('/semesters/'), api.get('/courses/'), api.get('/scale/'),
            ]);
            setSemesters(s.data);
            setCourses(c.data);
            setScale(sc.data);
            setSem((p) => ({ ...p, order: s.data.length ? Math.max(...s.data.map((x) => x.order)) + 1 : 1 }));
            setCourse((p) => ({ ...p, semester: p.semester || String(s.data[0]?.id ?? '') }));
        }
        catch (e) {
            setError(errorText(e));
        }
    }
    useEffect(() => { void load(); }, []);
    async function addSemester(e) {
        e.preventDefault();
        setError('');
        try {
            await api.post('/semesters/', sem);
            setSem({ ...sem, name: '' });
            await load();
        }
        catch (err) {
            setError(errorText(err));
        }
    }
    async function addCourse(e) {
        e.preventDefault();
        setError('');
        try {
            await api.post('/courses/', { ...course, semester: Number(course.semester) });
            setCourse({ ...course, code: '', title: '', letter_grade: '' });
            await load();
        }
        catch (err) {
            setError(errorText(err));
        }
    }
    async function remove(url, what) {
        if (!window.confirm(`Delete this ${what}?`))
            return;
        try {
            await api.delete(url);
            await load();
        }
        catch (err) {
            setError(errorText(err));
        }
    }
    return (_jsxs(_Fragment, { children: [error && _jsx("p", { className: errCls, children: error }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsx(Card, { title: "Add semester", children: _jsxs("form", { onSubmit: addSemester, className: "space-y-2", children: [_jsx("input", { className: inputCls, placeholder: "e.g. Spring 2025", value: sem.name, onChange: (e) => setSem({ ...sem, name: e.target.value }), required: true }), _jsx("input", { className: inputCls, type: "number", min: 1, value: sem.order, onChange: (e) => setSem({ ...sem, order: Number(e.target.value) }) }), _jsxs("label", { className: "flex items-center gap-2 text-sm", children: [_jsx("input", { type: "checkbox", checked: sem.is_planned, onChange: (e) => setSem({ ...sem, is_planned: e.target.checked }) }), "Planned (future) semester, not counted in CGPA"] }), _jsx("button", { className: btnCls, children: "Add semester" })] }) }), _jsx(Card, { title: "Add course", children: _jsxs("form", { onSubmit: addCourse, className: "space-y-2", children: [_jsxs("select", { className: inputCls, value: course.semester, onChange: (e) => setCourse({ ...course, semester: e.target.value }), required: true, children: [_jsx("option", { value: "", children: "Select semester\u2026" }), semesters.map((s) => _jsxs("option", { value: s.id, children: [s.name, s.is_planned ? ' (planned)' : ''] }, s.id))] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("input", { className: inputCls, placeholder: "Code (CSE101)", value: course.code, onChange: (e) => setCourse({ ...course, code: e.target.value }), required: true }), _jsx("input", { className: inputCls, type: "number", step: "0.5", min: "0.5", value: course.credits, onChange: (e) => setCourse({ ...course, credits: e.target.value }), required: true })] }), _jsx("input", { className: inputCls, placeholder: "Course title (optional)", value: course.title, onChange: (e) => setCourse({ ...course, title: e.target.value }) }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("select", { className: inputCls, value: course.letter_grade, onChange: (e) => setCourse({ ...course, letter_grade: e.target.value }), children: [_jsx("option", { value: "", children: "No grade yet" }), scale?.boundaries.map((b) => _jsxs("option", { value: b.letter, children: [b.letter, " (", b.point, ")"] }, b.letter))] }), _jsxs("select", { className: inputCls, value: course.status, onChange: (e) => setCourse({ ...course, status: e.target.value }), children: [_jsx("option", { value: "completed", children: "Completed" }), _jsx("option", { value: "planned", children: "Planned" }), _jsx("option", { value: "withdrawn", children: "Withdrawn" }), _jsx("option", { value: "incomplete", children: "Incomplete" })] })] }), _jsx("button", { className: btnCls, children: "Add course" })] }) })] }), semesters.length === 0 && _jsx("p", { className: "text-sm text-slate-500", children: "Add a semester first, then add its courses." }), semesters.map((s) => (_jsxs(Card, { title: `${s.name}${s.is_planned ? ' (planned, not counted)' : ''}`, children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-sm", children: [_jsx("thead", { className: "text-slate-500", children: _jsxs("tr", { children: [_jsx("th", { className: "p-2", children: "Code" }), _jsx("th", { className: "p-2", children: "Title" }), _jsx("th", { className: "p-2", children: "Credits" }), _jsx("th", { className: "p-2", children: "Grade" }), _jsx("th", { className: "p-2", children: "Point" }), _jsx("th", { className: "p-2", children: "Status" }), _jsx("th", {})] }) }), _jsx("tbody", { children: courses.filter((c) => c.semester === s.id).map((c) => (_jsxs("tr", { className: "border-t", children: [_jsx("td", { className: "p-2 font-medium", children: c.code }), _jsx("td", { className: "p-2", children: c.title }), _jsx("td", { className: "p-2", children: c.credits }), _jsx("td", { className: "p-2", children: c.letter_grade || '—' }), _jsx("td", { className: "p-2", children: c.grade_point ?? '—' }), _jsx("td", { className: "p-2", children: c.status }), _jsx("td", { className: "p-2 text-right", children: _jsx("button", { className: "text-red-600 hover:underline", onClick: () => remove(`/courses/${c.id}/`, 'course'), children: "Delete" }) })] }, c.id))) })] }) }), _jsx("button", { className: "mt-2 text-xs text-red-600 hover:underline", onClick: () => remove(`/semesters/${s.id}/`, 'semester and all its courses'), children: "Delete this semester" })] }, s.id)))] }));
}
