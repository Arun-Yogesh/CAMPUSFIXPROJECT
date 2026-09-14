import React, { useState } from 'react';
import { Wrench, ShieldCheck, GraduationCap, UserCheck, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage = ({ showToast }) => {
  const { login, register, quickDemoLogin } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'STUDENT',
    department: 'Computer Science',
    phone: '',
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginData.email || !loginData.password) {
      setErrorMsg('Please enter both email/username and password.');
      return;
    }

    setLoading(true);
    try {
      await login(loginData.email.trim(), loginData.password);
      showToast('Logged in successfully! Welcome to CampusFix.', 'success');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (registerData.password !== registerData.confirm_password) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (registerData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(registerData);
      showToast('Account registered successfully! Welcome to CampusFix.', 'success');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setErrorMsg('');
    setLoading(true);
    try {
      await quickDemoLogin(role);
      showToast(`Logged in as Demo ${role}!`, 'success');
    } catch (err) {
      setErrorMsg(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 16px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Brand Banner */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #4338ca)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)', marginBottom: '14px' }}>
            <Wrench size={30} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            CampusFix Portal
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Smart Campus Maintenance & Infrastructure Complaint System
          </p>
        </div>

        {/* 1-Click Demo Evaluation Box */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 20px', marginBottom: '22px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
            ⚡ 1-Click Evaluation Logins
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ padding: '8px 4px', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '3px' }}
              onClick={() => handleQuickDemo('STUDENT')}
              disabled={loading}
            >
              <GraduationCap size={16} color="#6366f1" />
              <span>Student</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ padding: '8px 4px', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '3px' }}
              onClick={() => handleQuickDemo('ADMIN')}
              disabled={loading}
            >
              <ShieldCheck size={16} color="#4f46e5" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ padding: '8px 4px', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '3px' }}
              onClick={() => handleQuickDemo('STAFF')}
              disabled={loading}
            >
              <UserCheck size={16} color="#8b5cf6" />
              <span>Staff</span>
            </button>
          </div>
        </div>

        {/* Auth Box */}
        <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px' }}>
          {/* Mode Switch Tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '4px', marginBottom: '24px' }}>
            <button
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                background: isLoginMode ? 'white' : 'transparent',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.88rem',
                color: isLoginMode ? 'var(--primary-600)' : 'var(--text-secondary)',
                boxShadow: isLoginMode ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onClick={() => { setIsLoginMode(true); setErrorMsg(''); }}
            >
              Sign In
            </button>
            <button
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                background: !isLoginMode ? 'white' : 'transparent',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.88rem',
                color: !isLoginMode ? 'var(--primary-600)' : 'var(--text-secondary)',
                boxShadow: !isLoginMode ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onClick={() => { setIsLoginMode(false); setErrorMsg(''); }}
            >
              Register Account
            </button>
          </div>

          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem', marginBottom: '20px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{errorMsg}</div>
            </div>
          )}

          {isLoginMode ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">Email or Username</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="student@campusfix.edu"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', marginTop: '10px', padding: '12px' }}
              >
                {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Maya Patel"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Campus Email <span className="required">*</span></label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="maya@campusfix.edu"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Role <span className="required">*</span></label>
                  <select
                    className="form-select"
                    value={registerData.role}
                    onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="ADMIN">Administrator</option>
                    <option value="STAFF">Maintenance Staff</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Computer Science"
                    value={registerData.department}
                    onChange={(e) => setRegisterData({ ...registerData, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="+1-555-0144"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Password <span className="required">*</span></label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password <span className="required">*</span></label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={registerData.confirm_password}
                    onChange={(e) => setRegisterData({ ...registerData, confirm_password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', marginTop: '10px', padding: '12px' }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
