import React, { useEffect, useState } from 'react';
import { Card, Table, StatusBadge } from '../../components';
import { Button } from 'react-bootstrap';
import { getLeave } from '../../services/leaveService';
import { useNavigate } from 'react-router-dom';

const LeaveApproval = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const data = await getLeave();
      const formatted = data.map(item => ({
        id: item.id,
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
      title: 'View',
      render: row => (
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate(`/leave-requests/${row.id}`)}
        >
          View
        </Button>
      )
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



// import React, { useEffect, useState } from 'react';
// import { Card, Table, StatusBadge } from '../../components';
// import { Button, Spinner } from 'react-bootstrap';
// import { getLeave, updateLeave } from '../../services/leaveService';

// const LeaveApproval = () => {
//   const [leaveRequests, setLeaveRequests] = useState([]);
//   const [updatingId, setUpdatingId] = useState(null);

//   useEffect(() => {
//     fetchLeaveRequests();
//   }, []);

//   const fetchLeaveRequests = async () => {
//     try {
//       const data = await getLeave();
//       const formatted = data.map(item => ({
//         id: item.id,
//         employee: item.employee_name || 'Unknown',
//         type: item.leave_type_name,
//         from: item.start_date,
//         to: item.end_date,
//         days: item.days,
//         note: item.note,
//         status: item.status,
//         created: new Date(item.created_at).toLocaleDateString(),
//       }));
//       setLeaveRequests(formatted);
//     } catch (err) {
//       console.error('Error fetching leave requests:', err);
//     }
//   };

//   const handleAction = async (id, status) => {
//     try {
//       setUpdatingId(id);
//       await updateLeave(id, { status });
//       await fetchLeaveRequests();
//     } catch (err) {
//       console.error(`Failed to update status to ${status}:`, err);
//     } finally {
//       setUpdatingId(null);
//     }
//   };

//   const columns = [
//     { key: 'employee', title: 'Employee' },
//     { key: 'type', title: 'Leave Type' },
//     { key: 'from', title: 'From', render: row => new Date(row.from).toLocaleDateString() },
//     { key: 'to', title: 'To', render: row => new Date(row.to).toLocaleDateString() },
//     { key: 'days', title: 'Days' },
//     { key: 'note', title: 'Note' },
//     {
//       key: 'status',
//       title: 'Status',
//       render: row => <StatusBadge status={row.status} />
//     },
//     {
//       key: 'actions',
//       title: 'Actions',
//       render: row => (
//         row.status === 'Pending' ? (
//           updatingId === row.id ? (
//             <Spinner animation="border" size="sm" />
//           ) : (
//             <div className="d-flex gap-2">
//               <Button
//                 variant="success"
//                 size="sm"
//                 onClick={() => handleAction(row.id, 'Approved')}
//               >
//                 Approve
//               </Button>
//               <Button
//                 variant="danger"
//                 size="sm"
//                 onClick={() => handleAction(row.id, 'Rejected')}
//               >
//                 Reject
//               </Button>
//             </div>
//           )
//         ) : (
//           <span className="text-muted">—</span>
//         )
//       )
//     }
//   ];

//   return (
//     <div className="leave-approval-page">
//       <Card
//         title="Leave Approval Requests"
//         count={leaveRequests.length}
//       >
//         <Table
//           columns={columns}
//           data={leaveRequests}
//           onRowClick={row => console.log('Clicked:', row)}
//         />
//       </Card>
//     </div>
//   );
// };

// export default LeaveApproval;
