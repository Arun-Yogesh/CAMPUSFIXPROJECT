import React, { useState, useEffect } from 'react';
import { X, UserPlus, Shield } from 'lucide-react';
import { staffApi } from '../api/staff';

const AVAILABILITY_CHOICES = ['Available', 'Busy', 'On Leave'];

export const StaffModal = ({ isOpen, onClose, staffMember, onSuccess, showToast }) => {
  const isEdit = Boolean(staffMember);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Electrical Maintenance',
    specialization: 'Electrical Systems & Wiring',
    availability: 'Available',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (staffMember) {
      setFormData({
        name: staffMember.name || '',
        email: staffMember.email || '',
        phone: staffMember.phone || '',
        department: staffMember.department || '',
        specialization: staffMember.specialization || '',
        availability: staffMember.availability || 'Available',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        department: 'General Maintenance',
        specialization: 'General Repairs & Plumbing',
        availability: 'Available',
      });
    }
    setErrors({});
  }, [staffMember, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required.';
    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = 'Valid email address is required.';
    }
    if (!formData.phone.trim() || formData.phone.length < 7) {
      newErrors.phone = 'Valid phone number is required.';
    }
    if (!formData.department.trim()) newErrors.department = 'Department is required.';
    if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEdit) {
        await staffApi.updateStaff(staffMember.id, formData);
        showToast('Staff member updated successfully.', 'success');
      } else {
        await staffApi.createStaff(formData);
        showToast('Maintenance technician registered successfully.', 'success');
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to save staff record.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#ede9fe', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isEdit ? 'Edit Maintenance Staff' : 'Add Maintenance Staff'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {isEdit ? `Updating ${staffMember.name}` : 'Register a new maintenance engineer or technician.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name <span className="required">*</span></label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="e.g. Michael Vance"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Email Address <span className="required">*</span></label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="staff@campusfix.edu"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone <span className="required">*</span></label>
              <input
                type="text"
                name="phone"
                className="form-control"
                placeholder="+1-555-0133"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && <div className="form-error">{errors.phone}</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Department <span className="required">*</span></label>
              <input
                type="text"
                name="department"
                className="form-control"
                placeholder="e.g. Civil & Plumbing"
                value={formData.department}
                onChange={handleChange}
              />
              {errors.department && <div className="form-error">{errors.department}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Availability <span className="required">*</span></label>
              <select
                name="availability"
                className="form-select"
                value={formData.availability}
                onChange={handleChange}
              >
                {AVAILABILITY_CHOICES.map((choice) => (
                  <option key={choice} value={choice}>
                    {choice}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Specialization / Trade <span className="required">*</span></label>
            <input
              type="text"
              name="specialization"
              className="form-control"
              placeholder="e.g. Electrical Wiring, Water Supply & Drainage, HVAC"
              value={formData.specialization}
              onChange={handleChange}
            />
            {errors.specialization && <div className="form-error">{errors.specialization}</div>}
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
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: '130px' }}
            >
              {loading ? 'Saving...' : isEdit ? 'Update Staff' : 'Add Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
