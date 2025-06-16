import React, { useEffect, useState } from 'react';
import { Card, Table, StatusBadge } from '../../components';
import { Button, Container, Row, Col, Modal } from 'react-bootstrap';
import { getLeave, deleteLeave } from '../../services/leaveService';
import DeleteConfirmationModal from '../modal/DeleteConfirmationModal';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './MyLeaves.scss';

const MyLeaves = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTab, setLeaveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const navigate = useNavigate();

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const data = await getLeave();
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const formatted = data.map(item => ({
        id: item.request_id,
        name: item.employee_name,
        type: item.leave_type_name,
        from: new Date(item.start_date).toLocaleDateString(),
        to: new Date(item.end_date).toLocaleDateString(),
        days: item.days,
        status: item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase(),
        submitted: new Date(item.created_at).toLocaleDateString(),
        message: item.message,
      }));
      setLeaveRequests(formatted);
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const handleRowClick = row => {
    setSelectedRequest(row);
    setShowDetailModal(true);
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    if (!selectedRequest?.id) return;
    try {
      await deleteLeave(selectedRequest.id);
      setShowDeleteModal(false);
      setShowDetailModal(false);
      fetchLeaveRequests();
    } catch (err) {
      console.error('Delete failed:', err);
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
    { key: 'type', title: 'Leave Type' },
    { key: 'from', title: 'Start Date' },
    { key: 'to', title: 'End Date' },
    { key: 'days', title: 'Days' },
    {
      key: 'status',
      title: 'Status',
      render: row => <StatusBadge status={row.status} />
    },
    {
      key: 'action',
      title: 'Action',
      render: row => (
        <button
          className="view-button"
          onClick={e => {
            e.stopPropagation();
            handleRowClick(row);
          }}
        >
          View
        </button>
      )
    }
  ];

  const filtered = leaveRequests.filter(lr =>
    leaveTab === 'all' ? true : lr.status === leaveTab
  );

  return (
    <Container className="my-5">
      <Row>
        <Col>
          <div className="leave-header d-flex justify-content-between align-items-center mb-3">
            <h3>My Leave Requests</h3>
            <Button size="lg" className="request-leave-btn" onClick={() => navigate('/leave-requests')}>
              Apply new Leave +
            </Button>
          </div>

          <Card>
            <div className="p-3">
              <div className="mb-3">
                {['all', 'Approved', 'Pending', 'Rejected'].map(status => {
                  const isActive = leaveTab === status;
                  const colorMap = {
                    all: 'primary',
                    Approved: 'success',
                    Pending: 'warning',
                    Rejected: 'danger',
                  };
                  const variant = isActive ? colorMap[status] : `outline-${colorMap[status]}`;
                  return (
                    <Button
                      key={status}
                      size="sm"
                      className="me-2 text-capitalize"
                      variant={variant}
                      onClick={() => setLeaveTab(status)}
                    >
                      {status}
                    </Button>
                  );
                })}
                <Button variant="outline-dark" size="sm" onClick={fetchLeaveRequests}>
                  Refresh
                </Button>
              </div>

              {loading ? (
                <div className="text-center p-4">Loading...</div>
              ) : (
                <div className="scroll-container">
                  <Table columns={columns} data={filtered} onRowClick={handleRowClick} />
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Leave Request Details</Modal.Title>
        </Modal.Header>
         <Modal.Body className="bg-white">
                  {selectedRequest && (
                    <div id="approval-pdf-content" className="px-3 py-2 rounded border shadow-sm bg-white">
                      <div className="mb-2"><strong>Name: </strong>{selectedRequest.name}</div>
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
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={generatePDF}>
            Download PDF
          </Button>
          {selectedRequest?.status === 'Pending' && (
            <>
              <Button variant="outline-danger" onClick={() => setShowDeleteModal(true)}>
                Delete
              </Button>
              <Button variant="primary" onClick={() => navigate(`/leaves-history/${selectedRequest.id}`)}>
                Edit
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reusable DeleteConfirmationModal */}
      {selectedRequest && (
        <DeleteConfirmationModal
          show={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete Leave Request"
          message="Are you sure you want to delete this leave request?"
        />
      )}
    </Container>
  );
};

export default MyLeaves;
