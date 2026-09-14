import React, { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, Zap, Upload, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { complaintsApi } from '../api/complaints';

const CATEGORIES = [
  'Electrical',
  'Furniture',
  'Classroom',
  'Wi-Fi/Network',
  'Plumbing',
  'Cleaning',
  'Projector',
  'Fan/AC',
  'Other',
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export const ComplaintModal = ({ isOpen, onClose, complaint, onSuccess, showToast }) => {
  const isEdit = Boolean(complaint);

  const [formData, setFormData] = useState({
    complaint_title: '',
    description: '',
    category: 'Electrical',
    location: '',
    priority: 'Medium',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Smart feature states
  const [hazardAlert, setHazardAlert] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (complaint) {
      setFormData({
        complaint_title: complaint.complaint_title || '',
        description: complaint.description || '',
        category: complaint.category || 'Electrical',
        location: complaint.location || '',
        priority: complaint.priority || 'Medium',
      });
      if (complaint.image) {
        setImagePreview(complaint.image);
      }
    } else {
      setFormData({
        complaint_title: '',
        description: '',
        category: 'Electrical',
        location: '',
        priority: 'Medium',
      });
      setImageFile(null);
      setImagePreview(null);
      setHazardAlert(null);
      setDuplicateWarning(null);
    }
    setErrors({});
  }, [complaint, isOpen]);

  // Real-time Heuristic Priority Check & Duplicate Check
  useEffect(() => {
    if (!isOpen || isEdit) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      // 1. Check Hazard Keywords
      const text = `${formData.complaint_title} ${formData.description}`.toLowerCase();
      const hazardWords = ['spark', 'fire', 'electric shock', 'exposed wire', 'dangerous', 'emergency', 'smoke', 'hazard'];
      const matched = hazardWords.filter(w => text.includes(w));

      if (matched.length > 0) {
        setHazardAlert({
          words: matched,
          suggested: 'Critical',
          message: `Hazardous condition detected ("${matched.join(', ')}"). Suggesting Critical Priority for rapid response.`
        });
        if (formData.priority !== 'Critical') {
          setFormData(prev => ({ ...prev, priority: 'Critical' }));
        }
      } else {
        setHazardAlert(null);
      }

      // 2. Duplicate Check
      if (formData.location && formData.location.trim().length > 3 && formData.category) {
        try {
          const res = await complaintsApi.checkDuplicate({
            category: formData.category,
            location: formData.location,
            title: formData.complaint_title,
          });
          if (res.found_duplicates) {
            setDuplicateWarning(res.duplicates[0]);
          } else {
            setDuplicateWarning(null);
          }
        } catch {
          // ignore background check errors
        }
      }
    }, 450);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formData.complaint_title, formData.description, formData.location, formData.category, isOpen, isEdit]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.complaint_title.trim() || formData.complaint_title.trim().length < 4) {
      newErrors.complaint_title = 'Please enter a descriptive title (at least 4 characters).';
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      newErrors.description = 'Please explain the issue in detail (at least 10 characters).';
    }
    if (!formData.location.trim() || formData.location.trim().length < 3) {
      newErrors.location = 'Please specify the building, room number, or landmark.';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required.';
    }
    if (!formData.priority) {
      newErrors.priority = 'Priority is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const dataPayload = new FormData();
      dataPayload.append('complaint_title', formData.complaint_title.trim());
      dataPayload.append('description', formData.description.trim());
      dataPayload.append('category', formData.category);
      dataPayload.append('location', formData.location.trim());
      dataPayload.append('priority', formData.priority);

      if (imageFile) {
        dataPayload.append('image', imageFile);
      }

      if (isEdit) {
        await complaintsApi.updateComplaint(complaint.id, dataPayload);
        showToast('Complaint updated successfully.', 'success');
      } else {
        await complaintsApi.createComplaint(dataPayload);
        showToast('Maintenance complaint submitted successfully.', 'success');
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to submit complaint.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isEdit ? 'Edit Maintenance Complaint' : 'Report a Campus Issue'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isEdit ? `Updating ticket #${complaint.id}` : 'Submit an infrastructure or facility issue for campus maintenance.'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Smart Feature: Safety Hazard Banner */}
        {hazardAlert && (
          <div className="alert-hazard">
            <Zap size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Safety Emergency Detected!</strong>
              <div style={{ fontSize: '0.82rem', marginTop: '2px' }}>{hazardAlert.message}</div>
            </div>
          </div>
        )}

        {/* Smart Feature: Duplicate Issue Banner */}
        {duplicateWarning && (
          <div className="alert-duplicate">
            <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Similar Issue Already Reported:</strong>
              <div style={{ fontSize: '0.82rem', marginTop: '2px' }}>
                "{duplicateWarning.complaint_title}" in {duplicateWarning.location} (Status: {duplicateWarning.status}).
                You may still submit if your report is distinct.
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Complaint Title */}
          <div className="form-group">
            <label className="form-label">
              Complaint Title <span className="required">*</span>
            </label>
            <input
              type="text"
              name="complaint_title"
              className="form-control"
              placeholder="e.g. Water leak in Chemistry Lab 2, Broken desk row 3"
              value={formData.complaint_title}
              onChange={handleChange}
            />
            {errors.complaint_title && <div className="form-error">{errors.complaint_title}</div>}
          </div>

          {/* Category and Priority Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">
                Category <span className="required">*</span>
              </label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <div className="form-error">{errors.category}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Priority <span className="required">*</span>
              </label>
              <select
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
              >
                {PRIORITIES.map((prio) => (
                  <option key={prio} value={prio}>
                    {prio}
                  </option>
                ))}
              </select>
              {errors.priority && <div className="form-error">{errors.priority}</div>}
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">
              Location / Room <span className="required">*</span>
            </label>
            <input
              type="text"
              name="location"
              className="form-control"
              placeholder="e.g. Academic Block B, 3rd Floor, Room 302"
              value={formData.location}
              onChange={handleChange}
            />
            {errors.location && <div className="form-error">{errors.location}</div>}
          </div>

          {/* Detailed Description */}
          <div className="form-group">
            <label className="form-label">
              Detailed Description <span className="required">*</span>
            </label>
            <textarea
              name="description"
              className="form-control"
              placeholder="Provide specific details about the issue to help maintenance staff prepare the correct equipment..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
            {errors.description && <div className="form-error">{errors.description}</div>}
          </div>

          {/* Optional Attachment Image */}
          <div className="form-group">
            <label className="form-label">Optional Photo / Attachment</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: '#f1f5f9',
                  border: '1px dashed #94a3b8',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <Upload size={16} />
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
              </label>

              {imagePreview && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.78rem' }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
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
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: '150px' }}
            >
              {loading ? (
                <span>Submitting...</span>
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Submit Complaint'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
