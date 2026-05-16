import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Navbar = () => {
  const { user } = useApp();
  const navigate = useNavigate();

  return (
  <nav className="fixed top-0 w-full z-50 bg-brand-dark/80 backdrop-blur-md border-b border-white/5">
    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center text-brand-dark font-black text-xl shadow-[0_0_15px_rgba(0,229,255,0.3)]">
          &infin;
        </div>
        <div>
          <h1 className="font-black text-lg tracking-widest leading-none text-white">
            INFINITE <span className="text-accent">PIECES AI</span>
          </h1>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-300">
        <a href="#platform" className="hover:text-white transition">
          Platform
        </a>
        <a href="#roi" className="hover:text-white transition">
          Live ROI Closer
        </a>

        <div className="flex items-center gap-4 ml-4">
          <button
            onClick={() => navigate(user ? '/dashboard' : '/login')}
            className="text-white hover:text-accent transition flex items-center gap-2"
          >
            {user ? 'Dashboard' : 'Provider Login'}{' '}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-full transition shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            Book a Demo
          </button>
        </div>
      </div>
    </div>
  </nav>
  );
};

export default Navbar;
