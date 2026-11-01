import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { LogOut, FileText, Search } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 dark:bg-[#1C2541]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Direct Embedded SVG Shield Logo - Never Breaks! */}
        <Link to="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-slate-900 dark:text-white group">
          <svg className="w-9 h-9 drop-shadow-md group-hover:scale-105 transition-transform" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 5 L88 20 V48 C88 73 50 93 50 93 C50 93 12 73 12 48 V20 L50 5 Z" fill="#06B6D4" stroke="#EF4444" strokeWidth="5"/>
            <path d="M50 14 L79 26 V47 C79 66 50 83 50 83 C50 83 21 66 21 47 V26 L50 14 Z" fill="#0B132B"/>
            <polygon points="50,25 56,39 71,39 59,48 63,62 50,53 37,62 41,48 29,39 44,39" fill="#EF4444"/>
            <circle cx="50" cy="46" r="5" fill="#06B6D4"/>
          </svg>
          <span>Crime<span className="text-cyan-500">Guard</span></span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-4">
          <Link 
            to="/track" 
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-500 transition-colors"
          >
            <Search size={16} />
            Track FIR
          </Link>

          {user && user.role === 'Citizen' && (
            <Link 
              to="/report" 
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-500 transition-colors"
            >
              <FileText size={16} />
              File FIR
            </Link>
          )}

          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                {user.name} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white transition-colors shadow-sm"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}