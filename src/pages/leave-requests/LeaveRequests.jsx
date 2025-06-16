import React, { useState, useEffect } from 'react';
import { getLeaveTypes, getLeave, addLeave } from '../../services/leaveService';
import './LeaveRequests.scss';
import { useNavigate } from 'react-router-dom';
import SuccessModal from '../modal/SuccessModal';

const LeaveRequest = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [usedLeave, setUsedLeave] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    leave_type: '',
    start_date: '',
    end_date: '',
    message: '',
    attachment: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [types, requests] = await Promise.all([getLeaveTypes(), getLeave()]);
        setLeaveTypes(types);
        setLeaveRequests(requests);

        const usage = {};
        (requests || []).forEach(lr => {
          if (lr.status === 'Approved') {
            const type = lr.leave_type_name;
            usage[type] = (usage[type] || 0) + Number(lr.days || 0);
          }
        });

        setUsedLeave(usage);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    startDate.setHours(12, 0, 0, 0);
    endDate.setHours(12, 0, 0, 0);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, attachment: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedLeaveType = leaveTypes.find(type =>
      String(type.leave_type_id) === String(formData.leave_type)
    );

    if (!selectedLeaveType) {
      setErrorMessage('Please select a valid leave type.');
      setShowErrorModal(true);
      return;
    }

    const requestedDays = calculateDays(formData.start_date, formData.end_date);
    const allowedDays = selectedLeaveType.days;
    const usedDays = usedLeave[selectedLeaveType.name] || 0;
    const remaining = allowedDays - usedDays;

    if (requestedDays > remaining) {
      setErrorMessage(`Requested ${requestedDays} days exceeds your balance for ${selectedLeaveType.name}. You have ${remaining} day(s) left.`);
      setShowErrorModal(true);
      return;
    }

    const data = new FormData();
    data.append('leave_type', formData.leave_type);
    data.append('start_date', formData.start_date);
    data.append('end_date', formData.end_date);
    data.append('message', formData.message);
    if (formData.attachment) {
      data.append('attachment', formData.attachment);
    }

    try {
      await addLeave(data);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Submit error:', err);
      setErrorMessage('Failed to submit leave request.');
      setShowErrorModal(true);
    }
  };

  return (
    <div className="leave-page">
      {/* Success Modal */}
      <SuccessModal
        show={showSuccessModal}
        title="Request Sent Successfully"
        message="Your leave request has been submitted!"
        onClose={() => {
          setShowSuccessModal(false);
          setFormData({
            leave_type: '',
            start_date: '',
            end_date: '',
            message: '',
            attachment: null,
          });
          navigate('/my-leaves');
        }}
      />

      {/* Error Modal */}
      {showErrorModal && (
        <div className="modal-overlay">
          <div className="modal-content error-modal">
            <div className="modal-icon error-icon">&#x2716;</div>
            <h3>Error</h3>
            <p>{errorMessage}</p>
            <button onClick={() => setShowErrorModal(false)}>Close</button>
          </div>
        </div>
      )}

      <div className="leave-header">
        <h2>Leave Request</h2>
        <p>Submit, track, or manage your leave applications with ease</p>
      </div>

      <div className="leave-request-container">
        <form className="leave-form-box" onSubmit={handleSubmit}>
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
              {leaveTypes.map(type => {
                const used = usedLeave[type.name] || 0;
                const balance = type.days - used;
                return (
                  <option key={type.leave_type_id} value={type.leave_type_id}>
                    {type.name} ({balance} left)
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-section">
            <div className="section-row">
              <label className="section-label"><i className="fas fa-calendar-alt"></i> Date</label>
              <label className="section-label"><i className="fas fa-upload"></i> Upload Documents</label>
            </div>

            <div className="date-input-group">
              <input
                type="date"
                className="form-date with-icon"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
              <input
                type="date"
                className="form-date with-icon"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
              <div className="upload-group">
                <div className="styled-upload-box">
                  {formData.attachment ? (
                    <span>{formData.attachment.name}</span>
                  ) : (
                    <span className="placeholder-text">No file uploaded</span>
                  )}
                </div>
                <button
                  type="button"
                  className="add-btn"
                  onClick={() => document.getElementById('hidden-file-input').click()}
                >
                  Add
                </button>
                <input
                  type="file"
                  id="hidden-file-input"
                  className="upload-input-hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <label className="section-label"><i className="fas fa-sticky-note"></i> Add Note</label>
            <textarea
              className="form-textarea"
              placeholder="Note"
              name="message"
              value={formData.message}
              onChange={handleChange}
            />
          </div>

          <button className="full-width" type="submit">Submit</button>
        </form>

        <div className="leave-type-box">
          <div className="leave-type-panel">
            {leaveTypes.map(type => {
              const used = usedLeave[type.name] || 0;
              const balance = Math.max(0, type.days - used);
              return (
                <div className="leave-type-row" key={type.leave_type_id}>
                  <div className="leave-type-name">
                    <span className="leave-dot" style={{ backgroundColor: type.color }}></span>
                    {type.name}
                  </div>
                  <span className="leave-balance-tag">{balance} days</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequest;
