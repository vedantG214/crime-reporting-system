import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../utils/api';
import { ShieldCheck, MapPin, FileUp, Send, CheckCircle2 } from 'lucide-react';

const CATEGORIES = [
  'Theft',
  'Physical Assault',
  'Cybercrime',
  'Women Harassment',
  'Burglary',
  'Vehicle Theft',
  'Fraud',
  'Vandalism',
];

export default function ReportCrime() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [evidenceType, setEvidenceType] = useState('Photo');
  const [loading, setLoading] = useState(false);
  const [submittedCode, setSubmittedCode] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      citizen_id: user?.id,
      category,
      description,
      location_address: locationAddress,
      evidence_type: evidenceType,
      latitude: 19.2437,
      longitude: 73.1355,
      evidence_url: '/uploads/evidence/sample_evidence.jpg',
    };

    try {
      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit FIR');

      setSubmittedCode(data.tracking_code);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submittedCode) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4 text-center">
        <div className="p-8 rounded-3xl bg-white dark:bg-[#1C2541] border border-emerald-500/30 shadow-xl space-y-4">
          <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">FIR Successfully Lodged!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            An official police complaint has been created and an acknowledgment notification was triggered.
          </p>
          <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl">
            <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">Your Tracking ID</span>
            <span className="font-mono text-xl font-bold text-cyan-500">{submittedCode}</span>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate(`/track?code=${submittedCode}`)}
              className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-sm transition-all"
            >
              Track Case Live
            </button>
            <button
              onClick={() => navigate('/citizen-dashboard')}
              className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4">
      <div className="p-8 rounded-3xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-2xl">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">File an Official FIR / Complaint</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">All submissions are monitored by the police station division.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Crime Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Incident Location / Landmark
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 text-slate-400" size={18} />
              <input
                type="text"
                required
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="e.g. Near Kalyan Station Platform 2 or Shivaji Chowk"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Incident Detailed Description
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the incident, suspect details, time, and sequence of events clearly..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Evidence Type
              </label>
              <select
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Photo">Photo / Image</option>
                <option value="Video">Video Footage</option>
                <option value="Document">PDF / Official Document</option>
                <option value="Multiple">Multiple Files</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Upload File Evidence
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-11 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <FileUp size={16} />
                    <span>Select attachment</span>
                  </div>
                  <input type="file" className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-cyan-500/25 disabled:opacity-50 mt-4"
          >
            {loading ? 'Submitting FIR...' : 'Submit Official Complaint'}
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}