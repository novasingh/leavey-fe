import React, { useEffect, useState } from 'react';
import notificationService from '../../services/notificationService';
import { Table, Button, Spinner, Alert, Container, Row, Col, Card, Form } from 'react-bootstrap';
import './Notifications.scss';
import authService from '../../services/authService';
import AddNotificationModal from './AddNotificationModal';
import Pagination from '../../components/Pagination';
import CustomLoader from '../../components/CustomLoader';

const PAGE_SIZE = 10;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [readFilter, setReadFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    notificationService.list()
      .then(res => {
        setNotifications(res.data);
        setLoading(false);
        // After loading all notifications, delete them
        res.data.forEach(n => {
          notificationService.delete(n.id);
        });
      })
      .catch(() => {
        setError('Failed to load notifications');
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    await notificationService.delete(id);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Filtering logic
  const filtered = notifications.filter(n => {
    const matchesTitle = n.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter ? n.notif_type === typeFilter : true;
    const matchesRead = readFilter ? (readFilter === 'read' ? n.is_read : !n.is_read) : true;
    return matchesTitle && matchesType && matchesRead;
  });

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset to first page on filter/search change
  useEffect(() => { setCurrentPage(1); }, [search, typeFilter, readFilter]);

  return (
    <Container fluid className="p-4 notifications-page">
      <Row className="align-items-center mb-3">
        <Col>
          <h3 className="mb-0 fw-bold">Notifications</h3>
          <div className="text-muted" style={{ fontSize: '0.95rem' }}>Admin / Notifications</div>
        </Col>
        <Col xs="auto">
          <Button variant="primary" style={{ borderRadius: 20, fontWeight: 500, padding: '8px 24px' }} onClick={() => setShowAddModal(true)}>
            + Add Notification
          </Button>
        </Col>
      </Row>
      <Row className="mb-3 g-2">
        <Col xs={12} sm={6} md={4} className="mb-2">
          <Form.Control
            placeholder="Search by title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Col>
        <Col xs={12} sm={6} md={4} className="mb-2">
          <Form.Select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="leave">Leave</option>
            <option value="holiday">Holiday</option>
            <option value="custom">Custom</option>
            <option value="office">Office</option>
          </Form.Select>
        </Col>
        <Col xs={12} sm={6} md={4} className="mb-2">
          <Form.Select
            value={readFilter}
            onChange={e => setReadFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="read">Read</option>
            <option value="unread">Unread</option>
          </Form.Select>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-borderless align-middle mb-0 text-center">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Message</th>
                      <th>Type</th>
                      <th>Read</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5">
                          <CustomLoader />
                        </td>
                      </tr>
                    ) : paginated.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-5">No notifications found.</td>
                      </tr>
                    ) : (
                      paginated.map(n => (
                        <tr key={n.id}>
                          <td>{n.title}</td>
                          <td>{n.message}</td>
                          <td>{n.notif_type}</td>
                          <td>{n.is_read ? 'Yes' : 'No'}</td>
                          <td>{new Date(n.created_at).toLocaleString()}</td>
                          <td>
                            <Button variant="danger" size="sm" className="custom-btn" onClick={() => handleDelete(n.id)}>Delete</Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {error && <Alert variant="danger">{error}</Alert>}
      <AddNotificationModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        loading={addLoading}
        onSubmit={async (data, setError) => {
          setAddLoading(true);
          try {
            await notificationService.create(data);
            setShowAddModal(false);
            setAddLoading(false);
            // Refresh notifications
            const res = await notificationService.list();
            setNotifications(res.data);
          } catch (err) {
            setAddLoading(false);
            setError('Failed to add notification.');
          }
        }}
      />
    </Container>
  );
};

export default Notifications;
