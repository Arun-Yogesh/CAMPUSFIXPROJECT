import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  UserCheck,
  Eye,
  Edit3,
  Trash2,
  Wrench,
  Users,
  Layers,
  MapPin,
  Calendar,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import { complaintsApi } from '../api/complaints';
import { staffApi } from '../api/staff';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { ComplaintDetailModal } from '../components/ComplaintDetailModal';
import { ComplaintModal } from '../components/ComplaintModal';
import { StaffModal } from '../components/StaffModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

const CATEGORIES = ['All', 'Electrical', 'Furniture', 'Classroom', 'Wi-Fi/Network', 'Plumbing', 'Cleaning', 'Projector', 'Fan/AC', 'Other'];
const STATUSES = ['All', 'Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];
const PRIORITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];

export const AdminDashboard = ({ showToast }) => {
  const [activeTab, setActiveTab] = useState('complaints'); // 'complaints' | 'staff'

  // Complaints & Analytics
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modals state
  const [viewingComplaint, setViewingComplaint] = useState(null);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [deletingComplaint, setDeletingComplaint] = useState(null);

  const [editingStaff, setEditingStaff] = useState(null);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [compData, statsData, staffData] = await Promise.all([
        complaintsApi.getComplaints(),
        complaintsApi.getAnalytics(),
        staffApi.getStaff(),
      ]);
      setComplaints(compData || []);
      setAnalytics(statsData);
      setStaffList(staffData || []);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to load administration data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Complaints
  const filteredComplaints = complaints.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.complaint_title.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      (c.student_details?.name && c.student_details.name.toLowerCase().includes(q));

    const matchesCat = categoryFilter === 'All' || c.category === categoryFilter;
    const matchesStat = statusFilter === 'All' || c.status === statusFilter;
    const matchesPrio = priorityFilter === 'All' || c.priority === priorityFilter;

    return matchesSearch && matchesCat && matchesStat && matchesPrio;
  });

  // Complaint Actions
  const handleAssignStaff = async (complaintId, staffId) => {
    try {
      const res = await complaintsApi.assignStaff(complaintId, staffId);
      showToast(res.message || 'Staff assigned successfully.', 'success');
      loadData();
      if (viewingComplaint && viewingComplaint.id === complaintId) {
        setViewingComplaint(res.complaint);
      }
    } catch (err) {
      showToast(err.message || 'Failed to assign staff.', 'error');
    }
  };

  const handleUpdateStatus = async (complaintId, newStatus) => {
    try {
      const res = await complaintsApi.updateStatus(complaintId, newStatus);
      showToast(res.message || 'Status updated successfully.', 'success');
      loadData();
      if (viewingComplaint && viewingComplaint.id === complaintId) {
        setViewingComplaint(res.complaint);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status.', 'error');
    }
  };

  const handleDeleteComplaintConfirm = async () => {
    if (!deletingComplaint) return;
    setActionLoading(true);
    try {
      await complaintsApi.deleteComplaint(deletingComplaint.id);
      showToast('Complaint ticket permanently deleted from database.', 'success');
      setDeletingComplaint(null);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete complaint.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Staff Actions
  const handleDeleteStaffConfirm = async () => {
    if (!deletingStaff) return;
    setActionLoading(true);
    try {
      await staffApi.deleteStaff(deletingStaff.id);
      showToast(`Staff member "${deletingStaff.name}" deleted successfully.`, 'success');
      setDeletingStaff(null);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete staff member.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '30px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Administration Command Center
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Campus Facilities Operations • Live dispatch, resolution analytics & technician management.
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '10px', padding: '4px', gap: '4px' }}>
          <button
            className={`btn btn-sm ${activeTab === 'complaints' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('complaints')}
            style={{ borderRadius: '8px' }}
          >
            <Layers size={15} />
            <span>Complaints ({complaints.length})</span>
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'staff' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('staff')}
            style={{ borderRadius: '8px' }}
          >
            <Users size={15} />
            <span>Staff Directory ({staffList.length})</span>
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Complaints</h3>
            <div className="stat-value">{analytics?.total ?? 0}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#eef2ff', color: 'var(--primary-600)' }}>
            <Layers size={24} />
          </div>
        </div>

        <div className="stat-card stat-amber">
          <div className="stat-info">
            <h3>Pending Review</h3>
            <div className="stat-value">{analytics?.pending ?? 0}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={24} />
          </div>
        </div>

        <div className="stat-card stat-purple">
          <div className="stat-info">
            <h3>In Progress</h3>
            <div className="stat-value">{analytics?.in_progress ?? 0}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#f3e8ff', color: '#9333ea' }}>
            <Play size={24} />
          </div>
        </div>

        <div className="stat-card stat-emerald">
          <div className="stat-info">
            <h3>Resolved Issues</h3>
            <div className="stat-value">{analytics?.resolved ?? 0}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="stat-card stat-rose">
          <div className="stat-info">
            <h3>Critical Emergencies</h3>
            <div className="stat-value">{analytics?.critical ?? 0}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Analytics Visual Breakdown Bar (Smart Feature 4) */}
      {analytics && (
        <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '16px' }}>
            Campus Category Breakdown
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {Object.entries(analytics.by_category || {}).map(([cat, count]) => {
              const pct = analytics.total > 0 ? Math.round((count / analytics.total) * 100) : 0;
              return (
                <div
                  key={cat}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border-subtle)',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.84rem',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat}:</span>
                  <span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, fontSize: '0.78rem' }}>
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Tab View: Complaints Management */}
      {activeTab === 'complaints' && (
        <>
          {/* Filters Bar */}
          <div className="glass-panel" style={{ padding: '18px 20px', marginBottom: '22px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search complaint, location, student..."
                  style={{ paddingLeft: '36px' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
                <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>Category: {cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>Status: {st}</option>
                  ))}
                </select>
              </div>

              <div>
                <select className="form-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>Priority: {p}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Complaints Table */}
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Complaints Queue ({filteredComplaints.length})
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Complete administrative dispatch and resolution access
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading complaint records...
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No complaints match your filters.
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Issue & Location</th>
                      <th>Category</th>
                      <th>Student</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Assigned Staff</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                          #{c.id}
                        </td>

                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {c.complaint_title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            <MapPin size={12} /> {c.location}
                          </div>
                        </td>

                        <td>
                          <span style={{ fontSize: '0.8rem', fontWeight: 500, background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>
                            {c.category}
                          </span>
                        </td>

                        <td style={{ fontSize: '0.84rem' }}>
                          <div style={{ fontWeight: 600 }}>{c.student_details?.name || 'Student'}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{c.student_details?.department || ''}</div>
                        </td>

                        <td>
                          <PriorityBadge priority={c.priority} />
                        </td>

                        <td>
                          <StatusBadge status={c.status} />
                        </td>

                        <td style={{ fontSize: '0.84rem' }}>
                          <select
                            style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white' }}
                            value={c.assigned_staff || ''}
                            onChange={(e) => handleAssignStaff(c.id, e.target.value)}
                          >
                            <option value="">-- Unassigned --</option>
                            {staffList.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({s.specialization})
                              </option>
                            ))}
                          </select>
                        </td>

                        <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>

                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setViewingComplaint(c)}
                              title="View Full Details & Timeline"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setEditingComplaint(c)}
                              title="Edit Complaint"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setDeletingComplaint(c)}
                              title="Delete Record"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Main Tab View: Maintenance Staff Management */}
      {activeTab === 'staff' && (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Maintenance Staff Directory ({staffList.length})
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Manage campus maintenance technicians, trade specializations, and dispatch availability.
              </p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsAddStaffOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} />
              <span>+ Add Maintenance Staff</span>
            </button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Staff Member</th>
                  <th>Department</th>
                  <th>Specialization</th>
                  <th>Availability</th>
                  <th>Active Complaints</th>
                  <th>Contact Info</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary-600)' }}>#{s.id}</td>

                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</div>
                    </td>

                    <td style={{ fontSize: '0.85rem' }}>{s.department}</td>

                    <td>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-700)', background: 'var(--primary-50)', padding: '3px 8px', borderRadius: '6px' }}>
                        {s.specialization}
                      </span>
                    </td>

                    <td>
                      <span
                        className="badge"
                        style={{
                          background: s.availability === 'Available' ? '#dcfce7' : s.availability === 'Busy' ? '#ffedd5' : '#f1f5f9',
                          color: s.availability === 'Available' ? '#15803d' : s.availability === 'Busy' ? '#c2410c' : '#475569',
                          borderColor: s.availability === 'Available' ? '#bbf7d0' : s.availability === 'Busy' ? '#fed7aa' : '#cbd5e1',
                        }}
                      >
                        {s.availability}
                      </span>
                    </td>

                    <td style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                      {s.assigned_count} active tickets
                    </td>

                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <div><Mail size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {s.email}</div>
                      <div style={{ marginTop: '2px' }}><Phone size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {s.phone}</div>
                    </td>

                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingStaff(s)}
                          title="Edit Staff Member"
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeletingStaff(s)}
                          title="Delete Staff Member"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Complaint Detail Modal */}
      <ComplaintDetailModal
        isOpen={Boolean(viewingComplaint)}
        onClose={() => setViewingComplaint(null)}
        complaint={viewingComplaint}
        staffList={staffList}
        onAssignStaff={handleAssignStaff}
        onUpdateStatus={handleUpdateStatus}
        onEdit={(item) => {
          setViewingComplaint(null);
          setEditingComplaint(item);
        }}
        onDelete={(item) => {
          setViewingComplaint(null);
          setDeletingComplaint(item);
        }}
      />

      {/* Complaint Edit Modal */}
      <ComplaintModal
        isOpen={Boolean(editingComplaint)}
        onClose={() => setEditingComplaint(null)}
        complaint={editingComplaint}
        onSuccess={loadData}
        showToast={showToast}
      />

      {/* Delete Complaint Confirmation */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingComplaint)}
        onClose={() => setDeletingComplaint(null)}
        onConfirm={handleDeleteComplaintConfirm}
        title="Delete Complaint Ticket?"
        message={
          deletingComplaint
            ? `Are you sure you want to permanently delete complaint #${deletingComplaint.id} ("${deletingComplaint.complaint_title}")? This will remove all history and records from the database.`
            : ''
        }
        loading={actionLoading}
      />

      {/* Add Staff Modal */}
      <StaffModal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        staffMember={null}
        onSuccess={loadData}
        showToast={showToast}
      />

      {/* Edit Staff Modal */}
      <StaffModal
        isOpen={Boolean(editingStaff)}
        onClose={() => setEditingStaff(null)}
        staffMember={editingStaff}
        onSuccess={loadData}
        showToast={showToast}
      />

      {/* Delete Staff Confirmation */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingStaff)}
        onClose={() => setDeletingStaff(null)}
        onConfirm={handleDeleteStaffConfirm}
        title="Delete Staff Member?"
        message={
          deletingStaff
            ? `Are you sure you want to remove staff technician "${deletingStaff.name}" (${deletingStaff.specialization}) from the database?`
            : ''
        }
        loading={actionLoading}
      />
    </div>
  );
};
