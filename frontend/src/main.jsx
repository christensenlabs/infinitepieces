import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import LandingPage from './pages/LandingPage';
import SiteLogin from './pages/SiteLogin';
import RoleGate from './pages/RoleGate';
import Dashboard from './pages/Dashboard';
import ApiTest from './pages/ApiTest';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<SiteLogin />} />
          <Route path="/role-select" element={<RoleGate />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/test/api" element={<ApiTest />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
