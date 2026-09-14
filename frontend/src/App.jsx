import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { AuthPage } from './pages/AuthPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { ComplaintModal } from './components/ComplaintModal';

function AppContent() {
  const { user, loading, isStudent, isAdmin, isStaff } = useAuth();

  // Toast System
  const [toasts, setToasts] = useState([]);
  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Global Report Modal trigger for student
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e0e7ff', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading CampusFix Portal...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onOpenReportModal={() => setIsReportModalOpen(true)} />

      <main style={{ flex: 1 }}>
        {!user ? (
          <AuthPage showToast={showToast} />
        ) : isAdmin ? (
          <AdminDashboard showToast={showToast} />
        ) : isStaff ? (
          <StaffDashboard showToast={showToast} />
        ) : (
          <StudentDashboard
            showToast={showToast}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            isReportModalOpen={isReportModalOpen}
            onCloseReportModal={() => setIsReportModalOpen(false)}
          />
        )}
      </main>

      {/* Global Student Complaint Creation Modal (accessible from Navbar button) */}
      {user && isStudent && (
        <ComplaintModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          complaint={null}
          onSuccess={() => {
            window.dispatchEvent(new CustomEvent('complaintCreated'));
          }}
          showToast={showToast}
        />
      )}

      {/* Global Toast Alerts */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <footer style={{ background: 'white', borderTop: '1px solid var(--border-subtle)', padding: '20px 0', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        <div className="container">
          <p>
            <strong>CampusFix</strong> • Smart Campus Maintenance Complaint Management System
          </p>
          <p style={{ marginTop: '4px', fontSize: '0.76rem' }}>
            Production Full-Stack Architecture • React + Django REST Framework + SQLite / PostgreSQL Ready
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
