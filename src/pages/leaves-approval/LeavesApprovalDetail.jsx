import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, StatusBadge } from '../../components';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { getLeaveById, updateLeave } from '../../services/leaveService';

const LeaveRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeave();
  }, []);

  const fetchLeave = async () => {
    try {
      const data = await getLeaveById(id);
      setLeave(data);
    } catch (err) {
      console.error('Error fetching leave request:', err);
      setError('Failed to load leave request.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (status) => {
    try {
      setUpdating(true);
      await updateLeave(id, { status });
      navigate('/leave-approval');
    } catch (err) {
      console.error('Error updating leave status:', err);
      setError('Failed to update leave status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Spinner animation="border" />;

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="leave-request-detail">
      <Card title={`Leave Request #${leave.id}`}>
        <p><strong>Employee:</strong> {leave.employee_name}</p>
        <p><strong>Type:</strong> {leave.leave_type_name}</p>
        <p><strong>From:</strong> {new Date(leave.start_date).toLocaleDateString()}</p>
        <p><strong>To:</strong> {new Date(leave.end_date).toLocaleDateString()}</p>
        <p><strong>Days:</strong> {leave.days}</p>
        <p><strong>Note:</strong> {leave.note || '—'}</p>
        <p><strong>Status:</strong> <StatusBadge status={leave.status} /></p>
        <p><strong>Submitted At:</strong> {new Date(leave.created_at).toLocaleString()}</p>

        {leave.attachment && (
          <p>
            <strong>Attachment:</strong>{' '}
            <a href={leave.attachment} target="_blank" rel="noopener noreferrer">View</a>
          </p>
        )}

        {leave.status === 'Pending' && (
          <div className="d-flex gap-2 mt-3">
            <Button
              variant="success"
              onClick={() => handleAction('Approved')}
              disabled={updating}
            >
              {updating ? 'Approving...' : 'Approve'}
            </Button>
            <Button
              variant="danger"
              onClick={() => handleAction('Rejected')}
              disabled={updating}
            >
              {updating ? 'Rejecting...' : 'Reject'}
            </Button>
          </div>
        )}

        <Button
          variant="secondary"
          className="mt-3"
          onClick={() => navigate('/leave-approval')}
        >
          Back
        </Button>
      </Card>
    </div>
  );
};

export default LeaveRequestDetail;
