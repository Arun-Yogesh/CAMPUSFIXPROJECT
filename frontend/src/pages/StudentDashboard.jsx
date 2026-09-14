import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, AlertCircle, FileText, CheckCircle, Clock, Play, Eye, Edit3, Trash2, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { complaintsApi } from '../api/complaints';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { ComplaintModal } from '../components/ComplaintModal';
import { ComplaintDetailModal } from '../components/ComplaintDetailModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

const CATEGORIES = ['All', 'Electrical', 'Furniture', 'Classroom', 'Wi-Fi/Network', 'Plumbing', 'Cleaning', 'Projector', 'Fan/AC', 'Other'];
const STATUSES = ['All', 'Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];

export const StudentDashboard = ({ showToast, onOpenReportModal, isReportModalOpen, onCloseReportModal }) => {
  const { user } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, submitted: 0, in_progress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [viewingComplaint, setViewingComplaint] = useState(null);
  const [deletingComplaint, setDeletingComplaint] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchComplaintsAndStats = async () => {
    setLoading(true);
    try {
      const [listData, statsData] = await Promise.all([
        complaintsApi.getComplaints(),
        complaintsApi.getAnalytics(),
      ]);
      setComplaints(listData || []);
      setStats({
        total: statsData.total || 0,
        submitted: statsData.submitted || 0,
        in_progress: statsData.in_progress || 0,
        resolved: statsData.resolved || 0,
      });
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to load complaints.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintsAndStats();
  }, []);

  // Filter complaints client-side
  const filteredComplaints = complaints.filter((item) => {
    const matchesSearch =
      item.complaint_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDeleteConfirm = async () => {
    if (!deletingComplaint) return;
    setActionLoading(true);
    try {
      await complaintsApi.deleteComplaint(deletingComplaint.id);
      showToast('Complaint ticket cancelled and removed.', 'success');
      setDeletingComplaint(null);
      fetchComplaintsAndStats();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to cancel complaint.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '30px 20px' }}>
      {/* Student Welcome & Quick Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {user?.department || 'Campus Student'} • Track your reported facility issues and resolution updates.
          </p>
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={onOpenReportModal}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)' }}
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>+ Report a Campus Issue</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>My Complaints</h3>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#eef2ff', color: 'var(--primary-600)' }}>
            <FileText size={24} />
          </div>
        </div>

        <div className="stat-card stat-amber">
          <div className="stat-info">
            <h3>Submitted / Review</h3>
            <div className="stat-value">{stats.submitted}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={24} />
          </div>
        </div>

        <div className="stat-card stat-purple">
          <div className="stat-info">
            <h3>In Progress</h3>
            <div className="stat-value">{stats.in_progress}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#f3e8ff', color: '#9333ea' }}>
            <Play size={24} />
          </div>
        </div>

        <div className="stat-card stat-emerald">
          <div className="stat-info">
            <h3>Resolved</h3>
            <div className="stat-value">{stats.resolved}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search */}
          <div style={{ position: 'relative', minWidth: '260px', flex: '1' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by title, room, or keyword..."
              style={{ paddingLeft: '38px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Dropdown */}
          <div style={{ minWidth: '180px' }}>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div style={{ minWidth: '180px' }}>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  Status: {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Complaints List Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            My Reported Issues ({filteredComplaints.length})
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Showing records stored in database
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading your maintenance complaints...
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <AlertCircle size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              No complaints found
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All'
                ? 'Try adjusting your search query or filters.'
                : 'You have not reported any maintenance issues yet.'}
            </p>
            {complaints.length === 0 && (
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: '16px' }}
                onClick={onOpenReportModal}
              >
                + Report Your First Issue
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title & Location</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned Staff</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                      #{item.id}
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                        {item.complaint_title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <MapPin size={12} /> {item.location}
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.82rem', fontWeight: 500, background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>
                        {item.category}
                      </span>
                    </td>

                    <td>
                      <PriorityBadge priority={item.priority} />
                    </td>

                    <td>
                      <StatusBadge status={item.status} />
                    </td>

                    <td style={{ fontSize: '0.84rem' }}>
                      {item.assigned_staff_details ? (
                        <div>
                          <div style={{ fontWeight: 600 }}>{item.assigned_staff_details.name}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {item.assigned_staff_details.specialization}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                      )}
                    </td>

                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>

                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setViewingComplaint(item)}
                          title="View Details & Timeline"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>

                        {item.is_editable && (
                          <>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setEditingComplaint(item)}
                              title="Edit Complaint"
                            >
                              <Edit3 size={14} />
                              <span>Edit</span>
                            </button>

                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setDeletingComplaint(item)}
                              title="Cancel Complaint"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
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

      {/* Complaint Creation Modal */}
      <ComplaintModal
        isOpen={isReportModalOpen}
        onClose={onCloseReportModal}
        complaint={null}
        onSuccess={fetchComplaintsAndStats}
        showToast={showToast}
      />

      {/* Complaint Edit Modal */}
      <ComplaintModal
        isOpen={Boolean(editingComplaint)}
        onClose={() => setEditingComplaint(null)}
        complaint={editingComplaint}
        onSuccess={fetchComplaintsAndStats}
        showToast={showToast}
      />

      {/* Complaint Detail View Modal with Timeline */}
      <ComplaintDetailModal
        isOpen={Boolean(viewingComplaint)}
        onClose={() => setViewingComplaint(null)}
        complaint={viewingComplaint}
        onEdit={(item) => {
          setViewingComplaint(null);
          setEditingComplaint(item);
        }}
        onDelete={(item) => {
          setViewingComplaint(null);
          setDeletingComplaint(item);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingComplaint)}
        onClose={() => setDeletingComplaint(null)}
        onConfirm={handleDeleteConfirm}
        title="Cancel Complaint?"
        message={
          deletingComplaint
            ? `Are you sure you want to cancel and delete ticket #${deletingComplaint.id} ("${deletingComplaint.complaint_title}")? This will remove the record from the campus maintenance database.`
            : ''
        }
        loading={actionLoading}
      />
    </div>
  );
};
