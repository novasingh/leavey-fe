// LeaveRequest.jsx
import React, { useState, useEffect } from 'react';
import { getLeaveTypes, addLeave } from '../../services/leaveService';
import './LeaveRequests.scss';
import { useNavigate } from 'react-router-dom';

const LeaveRequest = () => {
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false); // New state for error modal
    const [errorMessage, setErrorMessage] = useState('');     // New state for error message
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        leave_type: '', // This will store the leave_type_id
        start_date: '',
        end_date: '',
        message: '',
        attachment: null,
    });

    useEffect(() => {
        const fetchLeaveTypes = async () => {
            try {
                const res = await getLeaveTypes();
                // Map the response to include days in an accessible way if not already
                // Assuming res is an array of objects like { leave_type_id: 1, name: 'Annual Leave', days: 14 }
                setLeaveTypes(res);
            } catch (error) {
                console.error("Error fetching leave types:", error);
                // setLeaveTypes([]); // Uncomment if you want to explicitly clear on error
            }
        };
        fetchLeaveTypes();
    }, []);

    // Function to calculate days between two dates
    const calculateDays = (start, end) => {
        if (!start || !end) return 0;
        const startDate = new Date(start);
        const endDate = new Date(end);
        // Set both dates to noon to avoid daylight saving issues
        startDate.setHours(12, 0, 0, 0);
        endDate.setHours(12, 0, 0, 0);

        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        // Add 1 to include both the start and end day
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
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

        // 1. Get the selected leave type's details
        const selectedLeaveType = leaveTypes.find(
            type => String(type.leave_type_id) === String(formData.leave_type)
        );

        if (!selectedLeaveType) {
            setErrorMessage("Please select a valid leave type.");
            setShowErrorModal(true);
            return;
        }

        // 2. Calculate the requested days
        const requestedDays = calculateDays(formData.start_date, formData.end_date);
        const allowedDays = selectedLeaveType.days; // Assuming your leaveTypes array has a 'days' property

        // 3. Validate days
        if (requestedDays > allowedDays) {
            setErrorMessage(
                `Your requested leave duration (${requestedDays} days) exceeds the maximum allowed for ${selectedLeaveType.name} (${allowedDays} days).`
            );
            setShowErrorModal(true);
            return; // Stop submission
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
            if (err.response && err.response.data) {
                console.error('Submission error:', err.response.data);
                setErrorMessage('Failed to submit leave request: ' + JSON.stringify(err.response.data));
            } else {
                console.error('Unknown error:', err);
                setErrorMessage('Failed to submit leave request due to an unknown error.');
            }
            setShowErrorModal(true); // Show error modal on submission failure
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

            {showErrorModal && (
                <div className="modal-overlay">
                    <div className="modal-content error-modal">
                        <div className="modal-icon error-icon">&#x2716;</div> {/* Red X icon */}
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
                                <option
                                    key={type.leave_type_id}
                                    value={type.leave_type_id}
                                >
                                    {type.name}
                                </option>
                            ))}
                        </select>


                        <div className="leave-type-panel">
                            {/* Dynamically render these based on leaveTypes data */}
                            {leaveTypes.map((type) => (
                                <div className="leave-type-row" key={type.leave_type_id}>
                                    <span
                                        className="leave-dot"
                                        style={{ backgroundColor: type.color }}
                                    ></span>
                                    <span className="leave-type-name">{type.name} ({type.days} days)</span>
                                </div>
                            ))}

                        </div>
                    </div>
                </div>

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