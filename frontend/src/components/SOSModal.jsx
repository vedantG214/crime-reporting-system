import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../utils/api';
import { AlertTriangle, X, Radio, CheckCircle2 } from 'lucide-react';

export default function SOSModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  if (!isOpen) return null;

  const triggerSOS = () => {
    setLoading(true);

    const sendAlert = (lat, lng) => {
      fetch(`${API_BASE}/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizen_id: user?.id,
          latitude: lat,
          longitude: lng,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setSuccess(data.tracking_code);
        })
        .catch((err) => {
          alert('Failed to dispatch SOS alert: ' + err.message);
        })
        .finally(() => setLoading(false));
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          sendAlert(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // Default fallback coordinates (Kalyan)
          sendAlert(19.2437, 73.1355);
        }
      );
    } else {
      sendAlert(19.2437, 73.1355);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1C2541] border border-red-500/30 rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full"
        >
          <X size={20} />
        </button>

        {!success ? (
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4 animate-pulse">
              <AlertTriangle size={42} />
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              EMERGENCY SOS DISPATCH
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-300 mt-2">
              This will broadcast an urgent panic alert with your GPS coordinates directly to the Police Patrol and your Emergency Contact (<strong>{user?.emergency_contact_phone || 'Emergency Contact'}</strong>).
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={triggerSOS}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-lg flex items-center justify-center gap-2 shadow-lg shadow-red-600/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Radio className="animate-spin" size={24} />
                    <span>DISPATCHING LIVE ALERT...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={24} />
                    <span>ACTIVATE SOS NOW</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4">
              <CheckCircle2 size={40} />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              SOS Alert Dispatched!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Police control and emergency contacts have received your live location distress ping.
            </p>
            <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-900 rounded-xl font-mono text-xs font-semibold text-cyan-500">
              Emergency Case ID: {success}
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm"
            >
              Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
}