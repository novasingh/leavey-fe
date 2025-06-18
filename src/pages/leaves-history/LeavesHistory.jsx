import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getLeaveById,
  updateLeave,
  deleteLeave,
  getLeave,
  getLeaveTypes
} from '../../services/leaveService';
import {
  Button,
  Container
} from 'react-bootstrap';
import SuccessModal from '../modal/SuccessModal';
import DeleteConfirmationModal from '../modal/DeleteConfirmationModal';
import '../leave-requests/LeaveRequests.scss';

const LeavesHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [usedLeave, setUsedLeave] = useState({});
  const [formData, setFormData] = useState({
    leave_type: '',
    start_date: '',
    end_date: '',
    message: '',
    attachment: null,
  });
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [types, allRequests, currentLeave] = await Promise.all([
          getLeaveTypes(),
          getLeave(),
          getLeaveById(id),
        ]);
        setLeaveTypes(types);

        // Pre-fill form
        setFormData({
          leave_type: currentLeave.leave_type || '',
          start_date: currentLeave.start_date || '',
          end_date: currentLeave.end_date || '',
          message: currentLeave.message || '',
          attachment: null,
        });

        // Calculate used leave excluding current edited leave
        const usage = {};
        (allRequests || []).forEach(lr => {
          if (lr.status === 'Approved' && String(lr.leave_request_id) !== String(id)) {
            const type = lr.leave_type_name;
            usage[type] = (usage[type] || 0) + Number(lr.days || 0);
          }
        });
        setUsedLeave(usage);

      } catch (err) {
        console.error('Error loading leave history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start), e = new Date(end);
    s.setHours(12,0,0,0); e.setHours(12,0,0,0);
    return Math.ceil((e - s) / (1000*60*60*24)) + 1;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleFile = e => {
    setFormData(prev => ({ ...prev, attachment: e.target.files[0] || null }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('leave_type', formData.leave_type);
      payload.append('start_date', formData.start_date);
      payload.append('end_date', formData.end_date);
      payload.append('message', formData.message);
      if (formData.attachment) payload.append('attachment', formData.attachment);
      await updateLeave(id, payload);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save changes.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLeave(id);
      navigate('/my-leaves');
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete request.');
    }
  };

  return (
    <div className="leave-page">
      <SuccessModal
        show={showSuccessModal}
        title="Saved!"
        message="Your leave request has been updated."
        onClose={() => navigate('/my-leaves')}
      />

      <DeleteConfirmationModal
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Leave Request"
        message="Are you sure you want to delete this leave request?"
      />

      <div className="leave-header">
        <h2>Edit Leave Request</h2>
        <p>Modify your leave request details below.</p>
      </div>

      <div className="leave-request-container">
        {/* Form Box */}
        <form className="leave-form-box" onSubmit={handleSubmit}>
          {/* Leave Type */}
          <div className="form-section">
            <label className="section-label">Select Your Request</label>
            <select
              name="leave_type"
              className="form-select"
              value={formData.leave_type}
              onChange={handleChange}
              required
            >
              <option value="">Select Leave Type</option>
              {leaveTypes.map(type => (
                <option key={type.leave_type_id} value={type.leave_type_id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dates + Upload */}
          <div className="form-section">
            <div className="section-row">
              <label className="section-label">
                <i className="fas fa-calendar-alt"></i> Date
              </label>
              <label className="section-label">
                <i className="fas fa-upload"></i> Upload Documents
              </label>
            </div>
            <div className="date-input-group">
              <input
                type="date"
                className="form-date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
              <input
                type="date"
                className="form-date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
              <div className="upload-group">
                <div className="styled-upload-box">
                  {formData.attachment
                    ? formData.attachment.name
                    : 'No file uploaded'}
                </div>
                <button
                  type="button"
                  className="add-btn"
                  onClick={() =>
                    document.getElementById('hidden-file-input').click()
                  }
                >
                  Add
                </button>
                <input
                  type="file"
                  id="hidden-file-input"
                  className="upload-input-hidden"
                  onChange={handleFile}
                />
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="form-section">
            <label className="section-label">
              <i className="fas fa-sticky-note"></i> Add Note
            </label>
            <textarea
              className="form-textarea"
              name="message"
              value={formData.message}
              onChange={handleChange}
            />
          </div>

          {/* Submit */}
          <button className="full-width" type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>

        {/* Leave-type balance panel */}
        <div className="leave-type-box">
          <div className="leave-type-panel">
            {leaveTypes.map(type => {
              const used = usedLeave[type.name] || 0;
              const remaining = (type.days || 0) - used;
              return (
                <div className="leave-type-row" key={type.leave_type_id}>
                  <div className="leave-type-name">
                    <span className="leave-dot" style={{ backgroundColor: type.color }} />
                    {type.name}
                  </div>
                  <span className="leave-balance-tag">
                    {remaining} day{remaining !== 1 ? 's' : ''} left
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeavesHistory;
