import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
              {title || 'Confirm Deletion'}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '6px', lineHeight: 1.5 }}>
              {message || 'Are you sure you want to delete this record? This action will permanently remove it from the database and cannot be undone.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Trash2 size={16} />
            <span>{loading ? 'Deleting...' : 'Permanently Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
