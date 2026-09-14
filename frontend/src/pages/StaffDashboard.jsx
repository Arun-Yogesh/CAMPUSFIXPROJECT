import React, { useState, useEffect } from 'react';
import { Wrench, CheckCircle2, Play, Clock, MapPin, Eye, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { complaintsApi } from '../api/complaints';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { ComplaintDetailModal } from '../components/ComplaintDetailModal';

export const StaffDashboard = ({ showToast }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingComplaint, setViewingComplaint] = useState(null);

  const fetchAssigned = async () => {
    setLoading(true);
    try {
      const data = await complaintsApi.getComplaints();
      setComplaints(data || []);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to load assigned work orders.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
  }, []);

  const handleUpdateStatus = async (complaintId, newStatus) => {
    try {
      const res = await complaintsApi.updateStatus(complaintId, newStatus);
      showToast(res.message || `Status updated to ${newStatus}.`, 'success');
      fetchAssigned();
      if (viewingComplaint && viewingComplaint.id === complaintId) {
        setViewingComplaint(res.complaint);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status.', 'error');
    }
  };

  const pendingCount = complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Rejected').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div className="container" style={{ padding: '30px 20px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Maintenance Staff Workbench
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Technician: {user?.name} ({user?.department || 'Maintenance Team'}) • Assigned Work Orders
        </p>
      </div>

      {/* Metrics */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Active Assignments</h3>
            <div className="stat-value">{pendingCount}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#eef2ff', color: 'var(--primary-600)' }}>
            <Wrench size={24} />
          </div>
        </div>

        <div className="stat-card stat-purple">
          <div className="stat-info">
            <h3>Currently In Progress</h3>
            <div className="stat-value">{inProgressCount}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#f3e8ff', color: '#9333ea' }}>
            <Play size={24} />
          </div>
        </div>

        <div className="stat-card stat-emerald">
          <div className="stat-info">
            <h3>Resolved Completed</h3>
            <div className="stat-value">{resolvedCount}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      {/* Assigned Tasks Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            My Assigned Work Orders ({complaints.length})
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Update resolution progress directly
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading assigned maintenance tickets...
          </div>
        ) : complaints.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <AlertCircle size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              No assigned work orders
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              You currently have no open maintenance complaints assigned to you.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Issue & Room</th>
                  <th>Category</th>
                  <th>Student Contact</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Workflow Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary-600)' }}>#{item.id}</td>

                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.complaint_title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        <MapPin size={12} /> {item.location}
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>
                        {item.category}
                      </span>
                    </td>

                    <td style={{ fontSize: '0.82rem' }}>
                      <div style={{ fontWeight: 600 }}>{item.student_details?.name}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{item.student_details?.phone || item.student_details?.email}</div>
                    </td>

                    <td>
                      <PriorityBadge priority={item.priority} />
                    </td>

                    <td>
                      <StatusBadge status={item.status} />
                    </td>

                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setViewingComplaint(item)}
                          title="View Details"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>

                        {item.status !== 'In Progress' && item.status !== 'Resolved' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleUpdateStatus(item.id, 'In Progress')}
                            style={{ background: '#f5f3ff', color: '#7c3aed', borderColor: '#ddd6fe' }}
                          >
                            <Play size={13} />
                            <span>Start Work</span>
                          </button>
                        )}

                        {item.status !== 'Resolved' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleUpdateStatus(item.id, 'Resolved')}
                            style={{ background: '#10b981' }}
                          >
                            <CheckCircle2 size={13} />
                            <span>Resolve</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Complaint Detail Modal with visual timeline */}
      <ComplaintDetailModal
        isOpen={Boolean(viewingComplaint)}
        onClose={() => setViewingComplaint(null)}
        complaint={viewingComplaint}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};
