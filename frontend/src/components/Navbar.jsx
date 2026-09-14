import React from 'react';
import { Wrench, LogOut, ShieldCheck, UserCheck, GraduationCap, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onOpenReportModal }) => {
  const { user, logout, quickDemoLogin, isAdmin, isStudent, isStaff } = useAuth();

  const handleRoleSwitch = async (role) => {
    try {
      await quickDemoLogin(role);
    } catch (err) {
      console.error('Failed to switch demo role:', err);
    }
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Brand */}
        <div className="brand-wrapper">
          <div className="brand-icon">
            <Wrench size={22} strokeWidth={2.5} />
          </div>
          <div className="brand-text">
            <h1>CampusFix</h1>
            <span>Smart Maintenance Portal</span>
          </div>
        </div>

        {/* Demo Fast Role Switcher (Crucial for easy evaluation!) */}
        {user && (
          <div className="demo-role-switcher" title="Click to instantly test as another role">
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, paddingLeft: '6px' }}>
              DEMO ROLE:
            </span>
            <button
              className={`demo-role-btn ${isStudent ? 'active' : ''}`}
              onClick={() => handleRoleSwitch('STUDENT')}
            >
              <GraduationCap size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Student
            </button>
            <button
              className={`demo-role-btn ${isAdmin ? 'active' : ''}`}
              onClick={() => handleRoleSwitch('ADMIN')}
            >
              <ShieldCheck size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Admin
            </button>
            <button
              className={`demo-role-btn ${isStaff ? 'active' : ''}`}
              onClick={() => handleRoleSwitch('STAFF')}
            >
              <UserCheck size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Staff
            </button>
          </div>
        )}

        {/* User Info & Actions */}
        {user ? (
          <div className="nav-actions">
            {isStudent && onOpenReportModal && (
              <button
                className="btn btn-primary btn-sm"
                onClick={onOpenReportModal}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>+ Report Issue</span>
              </button>
            )}

            <div className="user-badge">
              <div className="user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-info">
                <span className="user-name">{user.name || user.username}</span>
                <span className="user-role-tag">{user.role}</span>
              </div>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={logout}
              title="Sign out of CampusFix"
              style={{ padding: '8px 12px' }}
            >
              <LogOut size={16} />
              <span className="hide-mobile">Sign Out</span>
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
};
