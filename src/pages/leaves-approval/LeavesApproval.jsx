import React, { useCallback, useEffect, useState } from 'react';
import { Card, Table, StatusBadge } from '../../components';
import { Button, Modal, Container, Row, Col } from 'react-bootstrap';
import { getLeave } from '../../services/leaveService';
import { getUsers } from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import CustomLoader from '../../components/CustomLoader';
import './LeavesApproval.scss';

const LeaveApproval = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [tab, setTab] = useState('Pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

    const applyFilter = useCallback(status => {
    if (status === 'All') {
      setFilteredRequests(leaveRequests);
    } else {
      setFilteredRequests(leaveRequests.filter(lr => lr.status === status));
    }
  }, [leaveRequests]);


  useEffect(() => {
    setLoading(true);
    fetchLeaveRequests().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    applyFilter(tab);
  }, [tab, leaveRequests, applyFilter]);

  const fetchLeaveRequests = async () => {
    try {
      const [users, leaves] = await Promise.all([getUsers(), getLeave()]);
      const localUser = JSON.parse(localStorage.getItem('user'));

      if (!localUser?.department?.id) return;

      const deptUsers = users.filter(u => u.department?.id === localUser.department.id);
      const deptNames = deptUsers.map(u => `${u.first_name} ${u.last_name}`);

      const formatted = leaves
        .filter(item => deptNames.includes(item.employee_name))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(item => ({
          id: item.request_id,
          employee: item.employee_name,
          type: item.leave_type_name,
          from: new Date(item.start_date).toLocaleDateString(),
          to: new Date(item.end_date).toLocaleDateString(),
          days: item.days,
          note: item.note,
          status: item.status,
          submitted: new Date(item.created_at).toLocaleDateString(),
        }));

      setLeaveRequests(formatted);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };


  const handleRowClick = row => {
    if (row.status === 'Pending') {
      navigate(`/leave-requests/${row.id}`);
    } else {
      setSelectedRequest(row);
      setShowModal(true);
    }
  };

  const generatePDF = async () => {
    const element = document.getElementById('approval-pdf-content');
    if (!element) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF();
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save(`leave-request-${selectedRequest?.id}.pdf`);
  };

  const columns = [
    { key: 'employee', title: 'Employee' },
    { key: 'type', title: 'Leave Type' },
    { key: 'from', title: 'From' },
    { key: 'to', title: 'To' },
    { key: 'days', title: 'Days' },
    {
      key: 'status',
      title: 'Status',
      render: row => <StatusBadge status={row.status} />
    },
    {
      key: 'action',
      title: '',
      render: row => (
        <Button
          size="sm"
          variant={row.status === 'Pending' ? 'primary' : 'outline-primary'}
          onClick={() => handleRowClick(row)}
        >
          View
        </Button>
      )
    }
  ];

  return (
    <Container className="my-5">
      {loading && <CustomLoader />}
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Leave Approval Requests</h3>
            <div>
              {['Pending', 'All'].map(status => {
                const isPending = status === 'Pending';
                const isActive = tab === status;
                const variant = isActive
                  ? isPending ? 'warning' : 'primary'
                  : isPending ? 'outline-warning' : 'outline-primary';

                const buttonStyle = {
                  color: isPending && isActive ? 'white' : undefined,
                };
                return (
                  <Button
                    key={status}
                    size="sm"
                    className="me-2"
                    variant={variant}
                    onClick={() => setTab(status)}
                    style={buttonStyle}
                  >
                    {isPending ? 'Pending for Approval' : 'All'}
                  </Button>
                );
              })}
              <Button variant="outline-dark" size="sm" onClick={fetchLeaveRequests}>
                Refresh
              </Button>
            </div>
          </div>
          <Card>
            <div className="p-3">
              {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
                  <CustomLoader />
                </div>
              ) : (
                <Table columns={columns} data={filteredRequests} onRowClick={handleRowClick} />
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="md">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-semibold text-primary">Leave Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-white">
          {selectedRequest && (
            <div id="approval-pdf-content" className="px-3 py-2 rounded border shadow-sm bg-white">
              <div className="mb-2"><strong>Name: </strong>{selectedRequest.employee}</div>
              <div className="mb-2"><strong>Leave Type:</strong> {selectedRequest.type}</div>
              <div className="mb-2"><strong>Date Range:</strong> {selectedRequest.from} to {selectedRequest.to}</div>
              <div className="mb-2"><strong>Total Days:</strong> {selectedRequest.days}</div>
              <div className="mb-2"><strong>Status:</strong> <StatusBadge status={selectedRequest.status} /></div>
              <div className="mb-2"><strong>Submitted:</strong> {selectedRequest.submitted}</div>
              {selectedRequest.note && (
                <div className="mb-2"><strong>Note:</strong> {selectedRequest.note}</div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light d-flex justify-content-between">
          <Button variant="outline-secondary" onClick={generatePDF}>
            Download PDF
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default LeaveApproval;
