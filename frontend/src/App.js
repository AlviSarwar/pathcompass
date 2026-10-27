import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import Courses from './pages/Courses';
import Dashboard from './pages/Dashboard';
import SettingsPage from './pages/SettingsPage';
import Target from './pages/Target';
export default function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    function login(t) {
        localStorage.setItem('token', t);
        setToken(t);
    }
    function logout() {
        localStorage.removeItem('token');
        setToken(null);
    }
    if (!token)
        return _jsx(AuthPage, { onLogin: login });
    return (_jsx(BrowserRouter, { children: _jsx(Routes, { children: _jsxs(Route, { element: _jsx(Layout, { onLogout: logout }), children: [_jsx(Route, { path: "/", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/courses", element: _jsx(Courses, {}) }), _jsx(Route, { path: "/target", element: _jsx(Target, {}) }), _jsx(Route, { path: "/settings", element: _jsx(SettingsPage, {}) })] }) }) }));
}
