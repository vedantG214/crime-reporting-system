import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_BASE } from '../utils/api';
import { Search, ShieldAlert, CheckCircle, Clock, MapPin, User, Phone, Building } from 'lucide-react';

const TIMELINE_STEPS = [
  'Submitted',
  'Police Assigned',
  'Under Investigation',
  'Evidence Verified',
  'Case Closed',
];

export default function TrackStatus() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCase = (queryCode) => {
    if (!queryCode.trim()) return;
    setLoading(true);
    setError('');
    setReport(null);

    fetch(`${API_BASE}/reports/track/${queryCode.trim()}`)
      .then((res) => {
        if (!res.ok) throw new Error('No complaint found with this Tracking ID.');
        return res.json();
      })
      .then((data) => setReport(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode) {
      setCode(urlCode);
      fetchCase(urlCode);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCase(code);
  };

  const currentStepIndex = report ? TIMELINE_STEPS.indexOf(report.status) : -1;

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Search Header */}
      <div className="p-8 rounded-3xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
          <ShieldAlert className="text-cyan-500" />
          Track Complaint / FIR Status
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Enter the official Tracking Code issued at submission (e.g. CR-2026-1001)
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. CR-2026-1002"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white font-mono uppercase text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-sm transition-all disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
            {error}
          </div>
        )}
      </div>

      {/* Case Details & Visual Progress Bar */}
      {report && (
        <div className="p-8 rounded-3xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-mono text-sm font-bold text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20">
                {report.tracking_code}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                {report.category}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Reported On</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {new Date(report.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">Investigation Progress</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {TIMELINE_STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div
                    key={step}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isCurrent
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500 font-bold'
                        : isCompleted
                        ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-500 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="flex justify-center mb-1">
                      {isCompleted ? <CheckCircle size={18} /> : <Clock size={18} />}
                    </div>
                    <span className="text-[11px] block">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metadata & Assigned Officer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Incident Details</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                <MapPin size={16} className="text-red-500 shrink-0 mt-0.5" />
                <span>{report.location_address}</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 pl-6 leading-relaxed">
                {report.description}
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-500">Assigned Investigating Officer</h4>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <User size={15} />
                <span>{report.officer_name || 'Senior Duty Inspector'}</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Building size={15} />
                <span>{report.station_division || 'Kalyan Central Police Station'}</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Phone size={15} />
                <span>{report.officer_phone || '+91 98201 12233'}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}