import React, { useState } from 'react';
import { X, MapPin, Calendar, Clock, User, Phone, Mail, Wrench, Shield, AlertCircle, Edit3, Trash2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { VisualTimeline } from './VisualTimeline';
import { useAuth } from '../context/AuthContext';

export const ComplaintDetailModal = ({
  isOpen,
  onClose,
  complaint,
  onEdit,
  onDelete,
  onAssignStaff,
  onUpdateStatus,
  staffList = [],
}) => {
  const { isAdmin, isStudent, isStaff } = useAuth();
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  if (!isOpen || !complaint) return null;

  const handleStaffChange = (e) => {
    const sId = e.target.value;
    setSelectedStaffId(sId);
    if (onAssignStaff) {
      onAssignStaff(complaint.id, sId);
    }
  };

  const handleStatusChange = (e) => {
    const st = e.target.value;
    setSelectedStatus(st);
    if (onUpdateStatus) {
      onUpdateStatus(complaint.id, st);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', background: 'var(--primary-50)', padding: '2px 8px', borderRadius: '4px' }}>
                #{complaint.id}
              </span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {complaint.complaint_title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Visual Progress Timeline */}
        <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            Complaint Resolution Progress
          </div>
          <VisualTimeline currentStatus={complaint.status} resolvedAt={complaint.resolved_at} />
        </div>

        {/* Meta details grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={18} style={{ color: 'var(--primary-500)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Location</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{complaint.location}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={18} style={{ color: 'var(--primary-500)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reported On</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                {new Date(complaint.created_at).toLocaleString()}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wrench size={18} style={{ color: 'var(--primary-500)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{complaint.category}</div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Description
          </div>
          <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-subtle)', lineHeight: 1.6, fontSize: '0.92rem', color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
            {complaint.description}
          </div>
        </div>

        {/* Image Attachment (if exists) */}
        {complaint.image && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Attached Photo
            </div>
            <img
              src={complaint.image}
              alt="Attachment"
              style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '8px', border: '1px solid var(--border-subtle)', objectFit: 'contain' }}
            />
          </div>
        )}

        {/* Submitter & Assigned Staff Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {/* Submitter Card */}
          <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <User size={14} /> Submitting Student
            </div>
            {complaint.student_details ? (
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{complaint.student_details.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{complaint.student_details.department || 'Department Student'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  <Mail size={12} /> {complaint.student_details.email}
                </div>
                {complaint.student_details.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    <Phone size={12} /> {complaint.student_details.phone}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Student Profile Not Loaded</div>
            )}
          </div>

          {/* Assigned Staff Card */}
          <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <Shield size={14} /> Assigned Technician
            </div>
            {complaint.assigned_staff_details ? (
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{complaint.assigned_staff_details.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary-600)', fontWeight: 500 }}>
                  {complaint.assigned_staff_details.specialization}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  <Mail size={12} /> {complaint.assigned_staff_details.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  <Phone size={12} /> {complaint.assigned_staff_details.phone}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '6px' }}>
                No maintenance technician assigned yet.
              </div>
            )}
          </div>
        </div>

        {/* Administrator Actions */}
        {isAdmin && (
          <div style={{ background: '#eef2ff', padding: '16px 18px', borderRadius: '12px', border: '1px solid #c7d2fe', marginBottom: '20px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-700)', marginBottom: '12px' }}>
              Administrative Controls
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Assign Staff Member</label>
                <select
                  className="form-select"
                  style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                  value={complaint.assigned_staff || ''}
                  onChange={handleStaffChange}
                >
                  <option value="">-- Unassigned --</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.specialization} - {s.availability})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Update Status</label>
                <select
                  className="form-select"
                  style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                  value={complaint.status}
                  onChange={handleStatusChange}
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Staff Quick Action */}
        {isStaff && (
          <div style={{ background: '#f5f3ff', padding: '14px 18px', borderRadius: '12px', border: '1px solid #ddd6fe', marginBottom: '20px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6d28d9', marginBottom: '8px' }}>
              Technician Status Action
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onUpdateStatus(complaint.id, 'In Progress')}
                disabled={complaint.status === 'In Progress'}
              >
                Mark In Progress
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onUpdateStatus(complaint.id, 'Resolved')}
                disabled={complaint.status === 'Resolved'}
              >
                Mark Resolved
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <div>
            {isStudent && complaint.is_editable && (
              <span style={{ fontSize: '0.78rem', color: '#16a34a' }}>
                ✓ This complaint can be edited or cancelled before work begins.
              </span>
            )}
            {isStudent && !complaint.is_editable && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Locked for edits because status is "{complaint.status}".
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {(isAdmin || (isStudent && complaint.is_editable)) && (
              <>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    onClose();
                    onEdit(complaint);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Edit3 size={14} />
                  <span>Edit</span>
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    onClose();
                    onDelete(complaint);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Trash2 size={14} />
                  <span>{isStudent ? 'Cancel Issue' : 'Delete'}</span>
                </button>
              </>
            )}
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
