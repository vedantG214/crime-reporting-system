import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../utils/api';
import SOSModal from '../components/SOSModal';
import { FilePlus, Search, AlertCircle, Shield, Clock, ExternalLink } from 'lucide-react';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/reports`)
      .then((res) => res.json())
      .then((data) => {
        // Filter reports belonging to logged in citizen
        const userReports = data.filter((r) => r.citizen_id === user?.id);
        setReports(userReports);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  const getStatusBadge = (status) => {
    const map = {
      'Submitted': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'Police Assigned': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'Under Investigation': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'Evidence Verified': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
      'Case Closed': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    };
    return map[status] || 'bg-slate-500/10 text-slate-500';
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800 shadow-md">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Namaste, {user?.name}! 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Registered Citizen Portal • Phone: {user?.phone}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Quick SOS Trigger */}
          <button
            onClick={() => setIsSosOpen(true)}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all hover:scale-105"
          >
            <AlertCircle size={18} />
            <span>SOS PANIC</span>
          </button>

          <Link
            to="/report"
            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <FilePlus size={18} />
            <span>File New FIR</span>
          </Link>
        </div>
      </div>

      {/* Reports Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield size={20} className="text-cyan-500" />
            Your Lodged Reports ({reports.length})
          </h2>
          <Link to="/track" className="text-xs font-semibold text-cyan-500 hover:underline flex items-center gap-1">
            <Search size={14} /> Search Any Case
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading your complaint records...</div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/30">
            <p className="text-slate-500 dark:text-slate-400 text-sm">No complaints filed yet by your account.</p>
            <Link to="/report" className="mt-3 inline-block text-xs font-bold text-cyan-500 hover:underline">
              Lodge your first report &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {report.tracking_code}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(report.status)}`}>
                      {report.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {report.category}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {report.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {new Date(report.created_at).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/track?code=${report.tracking_code}`}
                    className="font-semibold text-cyan-500 hover:underline flex items-center gap-0.5"
                  >
                    View Status <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency SOS Modal */}
      <SOSModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </div>
  );
}