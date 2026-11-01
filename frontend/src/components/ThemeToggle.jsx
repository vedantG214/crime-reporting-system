import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-cyan-400 hover:scale-105 transition-all shadow-sm"
      title="Toggle Theme"
      type="button"
    >
      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}