import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLeaveById, updateLeave } from '../../services/leaveService';
import './LeavesApproval.scss'; // Adjust path as needed

const LeavesApprovalDetail = () => {
    const { id } = useParams(); // leave-request ID
    const navigate = useNavigate();
    const [leave, setLeave] = useState(null);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLeave = async () => {
            try {
                const data = await getLeaveById(id);
                console.log('Fetched leave data:', data); // DEBUG
                setLeave(data);
            } catch (error) {
                console.error('Error fetching leave:', error);
            }
        };
        fetchLeave();
    }, [id]);

    const handleAction = async (status) => {
        setLoading(true);
        try {
            await updateLeave(id, { status, note });
            alert(`Leave ${status}`);
            navigate('/manager/leaves-approval'); // Redirect back to list
        } catch (error) {
            console.error('Update failed:', error?.response?.data || error.message);
            alert('Error updating leave status.');
        } finally {
            setLoading(false);
        }
    };

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                weekday: 'long',  // Add this
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };


    if (!leave) return <div className="leave-page">Loading leave request...</div>;

    return (
        <div className="leave-page">
            <button
                onClick={() => navigate(-1)}
                className="back-button"
            >
                &larr; Back
            </button>

            <header className="leave-header">
                <h2>Leave Request Details</h2>
            </header>

            <section className="leave-form-box">
                {/* Row 1: Employee Name, Date Created */}
                <div className="details-section-grid">
                    <div>
                        <strong>Employee Name</strong>
                        <p>{leave.user?.name || leave.employee_name || 'N/A'}</p>
                    </div>
                    <div >
                        <strong>Date Created</strong>
                        <p>{formatDate(leave.created_at)}</p>
                    </div>
                </div>

                {/* Row 2: Leave Type, Start Date, End Date, Days, Status */}
                <div className="details-section-grid">
                    <div className="detail-item-box">
                        <strong>Leave Type</strong>
                        <p>{leave.leave_type?.name || leave.leave_type_name || 'N/A'}</p>
                    </div>
                    <div className="detail-item-box">
                        <strong>Start Date</strong>
                        <p>{formatDate(leave.start_date)}</p>
                    </div>
                    <div className="detail-item-box">
                        <strong>End Date</strong>
                        <p>{formatDate(leave.end_date)}</p>
                    </div>
                  </div>
                  <div className="details-section-grid">
                    <div className="detail-item-box">
                        <strong>Days</strong>
                        <p>{leave.days}</p>
                    </div>
                    <div className="detail-item-box">
                        <strong>Status</strong>
                        <span className={`status-badge ${
                            leave.status === 'Pending' ? 'bg-yellow-500' :
                            leave.status === 'Approved' ? 'bg-green-600' :
                            'bg-red-500'
                        }`}>
                            {leave.status}
                        </span>
                    </div>
                </div>

                {/* Row 3: Attachment (if exists) */}
                {leave.attachment && (
                    <div className="details-section-grid">
                        <div className="detail-item-box"> {/* Use detail-item-box for attachment too */}
                            <strong>Attachment</strong>
                            <a
                                href={leave.attachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="view-attachment-button"
                            >
                                View Attachment
                            </a>
                        </div>
                    </div>
                )}

                {/* Message (full row) */}
                {leave.message && (
                    <div className="full-row-section">
                        <span className="section-label">Message:</span>
                        <p>{leave.message}</p>
                    </div>
                )}

                {/* Note (full row) */}
                <div className="full-row-section">
                    <label htmlFor="note" className="section-label">Additional note (optional):</label>
                    <textarea
                        id="note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        className="form-textarea"
                        placeholder="Write a note explaining your decision..."
                    />
                </div>

                {/* Approve/Reject Buttons (centered, full row) */}
                <div className="action-buttons-container">
                    <button
                        onClick={() => handleAction('Rejected')}
                        disabled={loading}
                        className="btn-reject"
                    >
                        Reject
                    </button>
                    <button
                        onClick={() => handleAction('Approved')}
                        disabled={loading}
                        className="btn-approve"
                    >
                        Approve
                    </button>
                </div>
            </section>
        </div>
    );
};

export default LeavesApprovalDetail;