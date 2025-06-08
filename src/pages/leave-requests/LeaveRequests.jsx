// LeaveRequest.jsx (JSX Only Updated)
import React, { useState, useEffect } from 'react';
import { getLeaveTypes, addLeave } from '../../services/leaveService';
import './LeaveRequests.scss';
import { useNavigate } from 'react-router-dom'; 

const colorMap = [
  '#A259FF', // Marriage leave
  '#00C48C', // Others
  '#FF5C5C', // Emergency Leave
  '#FFC233', // Sick Leave
  '#6C63FF', // Annual Leave
];

const LeaveRequest = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    leave_type: '',
    start_date: '',
    end_date: '',
    message: '',
    attachment: null,
  });

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const res = await getLeaveTypes();
        setLeaveTypes(res);
      } catch (error) {
        // setLeaveTypes([]);
      }
    };
    fetchLeaveTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, attachment: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      // Do NOT reset form here; reset after modal is dismissed
    } catch (err) {
      if (err.response && err.response.data) {
        console.error('Submission error:', err.response.data);
        alert('Failed to submit leave request: ' + JSON.stringify(err.response.data));
      } else {
        console.error('Unknown error:', err);
        alert('Failed to submit leave request.');
      }
    }
  };



  return (
    <div className="leave-page">
      {showSuccessModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-icon">&#10004;</div>
          <h3>Request Sent Successfully</h3>
          <p>Your leave request has been submitted!</p>
          <button
            onClick={() => {
              setShowSuccessModal(false);
              setFormData({ leave_type: '', start_date: '', end_date: '', message: '', attachment: null });
              navigate('/dashboard/employee');
            }}
          >OK</button>
        </div>
      </div>
    )}
      <div className="leave-header">
        <h2>Leave Request</h2>
        <p>Submit, track, or manage your leave applications with ease</p>
      </div>

      <form className="leave-form-box" onSubmit={handleSubmit}>
        {/* Select Request */}
        <div className="form-section">
          <label className="section-label">Select Your Request</label>
          <div className="leave-type-row">
            <select
              name="leave_type"
              className="form-select"
              value={formData.leave_type}
              onChange={handleChange}
              required
            >
              <option value="">Select Leave Type</option>
              {leaveTypes.map((type) => (
                <option key={type.leave_type_id} value={type.leave_type_id}>{type.name}</option>
              ))}
            </select>

            <div className="leave-type-panel">
              <div className="leave-type-row"><span className="leave-dot violet"></span> Marriage Leave</div>
              <div className="leave-type-row"><span className="leave-dot green"></span> Emergency Leave</div>
              <div className="leave-type-row"><span className="leave-dot yellow"></span> Sick Leave</div>
              <div className="leave-type-row"><span className="leave-dot purple"></span> Annual Leave</div>
            </div>
          </div>
        </div>

        {/* Date + File */}
        {/* Date + File */}
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


        {/* Note */}
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
    </div>
  );
};

export default LeaveRequest;
