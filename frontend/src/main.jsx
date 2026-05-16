import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import LandingPage from './pages/LandingPage';
import SiteLogin from './pages/SiteLogin';
import RoleGate from './pages/RoleGate';
import Dashboard from './pages/Dashboard';
import ApiTest from './pages/ApiTest';
import Profile from './pages/Profile';
import Forbidden from './pages/Forbidden';
import './index.css';

const PUBLIC_PATHS = ['/', '/login'];

function ForbiddenGuard({ children }) {
  const { forbidden, authLoading } = useApp();
  const { pathname } = useLocation();
  if (authLoading) return null;
  if (forbidden && !PUBLIC_PATHS.includes(pathname)) return <Forbidden />;
  return children;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <ForbiddenGuard>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<SiteLogin />} />
            <Route path="/role-select" element={<RoleGate />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/test/api" element={<ApiTest />} />
          </Routes>
        </ForbiddenGuard>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
