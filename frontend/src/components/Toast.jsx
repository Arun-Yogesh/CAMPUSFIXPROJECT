import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const Toast = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        let Icon = Info;
        let toastClass = 'toast-info';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          toastClass = 'toast-success';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          toastClass = 'toast-error';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          toastClass = 'toast-warning';
        }

        return (
          <div key={toast.id} className={`toast ${toastClass}`}>
            <Icon size={20} style={{ flexShrink: 0, color: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#f59e0b' }} />
            <div style={{ flex: 1, fontSize: '0.86rem', lineHeight: '1.4' }}>
              {toast.message}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
