import React, { useEffect, useState } from 'react';
import { Card, Table, StatusBadge } from '../../components';
import { Button } from 'react-bootstrap';
import { getLeave } from '../../services/leaveService';
import { useNavigate } from 'react-router-dom';
import './LeavesApproval.scss';

const LeaveApproval = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const data = await getLeave();
      
      console.log('Raw leave data:', data);
      const pendingData = data.filter(item => item.status === 'Pending'); 
      const sortedData = pendingData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      const formatted = pendingData.map(item => ({
        id: item.request_id, // make sure this is here!
        employee: item.employee_name || 'Unknown',
        type: item.leave_type_name,
        from: item.start_date,
        to: item.end_date,
        days: item.days,
        note: item.note,
        status: item.status,
        created: new Date(item.created_at).toLocaleDateString(),
      }));

      setLeaveRequests(formatted);
    } catch (err) {
      console.error('Error fetching leave requests:', err);
    }
  };

  
  const columns = [
    { key: 'employee', title: 'Employee' },
    { key: 'type', title: 'Leave Type' },
    { key: 'from', title: 'From', render: row => new Date(row.from).toLocaleDateString() },
    { key: 'to', title: 'To', render: row => new Date(row.to).toLocaleDateString() },
    { key: 'days', title: 'Days' },
    {
      key: 'status',
      title: 'Status',
      render: row => <StatusBadge status={row.status} />
    },
    {
      key: 'view',
      title: '',
      render: (row) => {
        console.log("Navigating to:", `/leave-requests/${row.id}`); // check value
 // confirm this prints id
        return (
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/leave-requests/${row.id}`)}
          >
            View
          </Button>
        );
      }
    }
];


  return (
    <div className="leave-approval-page">
      <Card
        title="Leave Approval Requests"
        count={leaveRequests.length}
      >
        <Table
          columns={columns}
          data={leaveRequests}
          onRowClick={row => console.log('Clicked:', row)}
          
        />
      </Card>
    </div>
  );
};

export default LeaveApproval;



