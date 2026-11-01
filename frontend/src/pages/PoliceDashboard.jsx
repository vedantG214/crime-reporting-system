import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../utils/api';
import { Shield, AlertTriangle, CheckCircle, Clock, Search, Filter, Phone, MapPin, UserCheck } from 'lucide-react';

export default function PoliceDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchReports = () => {
    fetch(`${API_BASE}/reports`)
      .then((res) => res.json())
      .then((data) => {
        setReports(data);
        setFilteredReports(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    let result = reports;

    if (filterStatus === 'SOS') {
      result = result.filter((r) => r.sos_flag === 1);
    } else if (filterStatus !== 'ALL') {
      result = result.filter((r) => r.status === filterStatus);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.tracking_code.toLowerCase().includes(term) ||
          r.category.toLowerCase().includes(term) ||
          r.location_address.toLowerCase().includes(term) ||
          (r.citizen_name && r.citizen_name.toLowerCase().includes(term))
      );
    }

    setFilteredReports(result);
  }, [filterStatus, searchTerm, reports]);

  const updateStatus = (reportId, newStatus) => {
    // Quick local update simulation for Viva demo
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
    );
  };

  const stats = {
    total: reports.length,
    sos: reports.filter((r) => r.sos_flag === 1).length,
    pending: reports.filter((r) => r.status === 'Submitted' || r.status === 'Police Assigned').length,
    investigating: reports.filter((r) => r.status === 'Under Investigation').length,
    closed: reports.filter((r) => r.status === 'Case Closed').length,
  };

  return (
    <div className="space-y-8">
      {/* Officer Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-cyan-500/10 text-cyan-500 rounded-2xl">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Police Administration & Dispatch Control
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Officer On Duty: <strong>{user?.name || 'Sr. PI Vikram Deshmukh'}</strong> • Division: Kalyan Central
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Patrol Network Live
          </span>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block">Total Cases Logged</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{stats.total}</span>
        </div>

        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
          <span className="text-xs font-bold block uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle size={14} /> Emergency SOS
          </span>
          <span className="text-2xl font-black mt-1 block">{stats.sos} Dispatches</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-purple-400 block">Active Investigation</span>
          <span className="text-2xl font-black text-purple-400 mt-1 block">{stats.investigating}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-emerald-500 block">Cases Solved / Closed</span>
          <span className="text-2xl font-black text-emerald-500 mt-1 block">{stats.closed}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search code, citizen, area..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1C2541] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {['ALL', 'SOS', 'Submitted', 'Under Investigation', 'Case Closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white dark:bg-[#1C2541] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Case Management Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading cases...</div>
        ) : filteredReports.length === 0 ? (
          <div className="p-8 text-center text-slate-400 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800">
            No matching complaints found.
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className={`p-5 rounded-2xl bg-white dark:bg-[#1C2541] border transition-all ${
                report.sos_flag === 1
                  ? 'border-red-500/50 shadow-md shadow-red-500/10'
                  : 'border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded">
                      {report.tracking_code}
                    </span>
                    {report.sos_flag === 1 && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                        SOS PANIC
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {report.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {report.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-red-400" /> {report.location_address}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCheck size={12} className="text-cyan-400" /> {report.citizen_name || 'Citizen'} ({report.citizen_phone || 'Phone'})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Status Dropdown Controller */}
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={report.status}
                    onChange={(e) => updateStatus(report.id, e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Police Assigned">Police Assigned</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Evidence Verified">Evidence Verified</option>
                    <option value="Case Closed">Case Closed</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}