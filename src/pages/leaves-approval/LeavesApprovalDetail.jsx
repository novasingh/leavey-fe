import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLeave, updateLeave } from '../../services/leaveService'; // Adjust path as needed

const LeavesApprovalDetail = () => {
  const { id } = useParams(); // leave-request ID
  const navigate = useNavigate();
  const [leave, setLeave] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLeave = async () => {
      const data = await getLeave(id);
      setLeave(data);
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
      console.error(error);
      alert('Error updating leave status.');
    } finally {
      setLoading(false);
    }
  };

  if (!leave) return <div>Loading leave request...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded">
      <button onClick={() => navigate(-1)} className="text-blue-500 mb-4">&larr; Back</button>
      <h2 className="text-2xl font-bold mb-4">Leave Request Details</h2>

      <div className="space-y-2 text-gray-700">
        <p><strong>Employee Name:</strong> {leave.user?.name || 'N/A'}</p>
        <p><strong>Leave Type:</strong> {leave.leave_type?.name}</p>
        <p><strong>From:</strong> {leave.start_date}</p>
        <p><strong>To:</strong> {leave.end_date}</p>
        <p><strong>Days:</strong> {leave.days}</p>
        <p><strong>Status:</strong> 
          <span className={`ml-2 px-2 py-1 rounded text-white text-sm ${
            leave.status === 'Pending' ? 'bg-yellow-500' :
            leave.status === 'Approved' ? 'bg-green-600' :
            'bg-red-500'
          }`}>
            {leave.status}
          </span>
        </p>
        {leave.message && <p><strong>Message:</strong> {leave.message}</p>}
        {leave.attachment && (
          <p>
            <strong>Attachment:</strong> 
            <a href={leave.attachment} target="_blank" rel="noopener noreferrer" className="text-blue-600 ml-2">
              View Attachment
            </a>
          </p>
        )}
      </div>

      <hr className="my-6" />

      <div>
        <label className="block mb-2 font-medium">Note to Employee (optional):</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 p-2 rounded"
          placeholder="Write a note explaining your decision..."
        />
      </div>

      <div className="mt-4 flex gap-4">
        <button
          onClick={() => handleAction('Rejected')}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Reject
        </button>
        <button
          onClick={() => handleAction('Approved')}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Approve
        </button>
      </div>
    </div>
  );
};

export default LeavesApprovalDetail;
