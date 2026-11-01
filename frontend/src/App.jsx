import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CitizenDashboard from './pages/CitizenDashboard';
import PoliceDashboard from './pages/PoliceDashboard';
import ReportCrime from './pages/ReportCrime';
import TrackStatus from './pages/TrackStatus';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/track" element={<TrackStatus />} />
                
                {/* Protected Citizen Routes */}
                <Route path="/citizen-dashboard" element={
                  <ProtectedRoute role="Citizen">
                    <CitizenDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/report" element={
                  <ProtectedRoute role="Citizen">
                    <ReportCrime />
                  </ProtectedRoute>
                } />

                {/* Protected Police Routes */}
                <Route path="/police-dashboard" element={
                  <ProtectedRoute role="Police">
                    <PoliceDashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}