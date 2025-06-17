import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import UserMultiSelect from './UserMultiSelect';

const AddNotificationModal = ({ show, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    notif_type: '',
    user: '',
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUserChange = (selected) => {
    setSelectedUsers(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.title || !formData.message || !formData.notif_type) {
      setError('All fields are required.');
      return;
    }
    let userPayload;
    if (selectedUsers.length === 1 && selectedUsers[0].value === 'all') {
      userPayload = 'all';
    } else if (selectedUsers.length > 0) {
      userPayload = selectedUsers.map(u => u.value);
    } else {
      setError('Please select at least one user.');
      return;
    }
    await onSubmit({ ...formData, user: userPayload }, setError);
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg" contentClassName="rounded-5 border-0">
      <Modal.Body className="p-4 p-md-5">
        <div className="text-center mb-4">
          <h4 className="fw-bold" style={{ color: '#5B4B8A' }}>Add Notification</h4>
        </div>
        <Form onSubmit={handleSubmit}>
          {error && <p className="text-danger text-center">{error}</p>}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              placeholder="Enter notification title"
              value={formData.title}
              onChange={handleChange}
              required
              style={{ borderRadius: 12 }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Message</Form.Label>
            <Form.Control
              as="textarea"
              name="message"
              placeholder="Enter notification message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              required
              style={{ borderRadius: 12 }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Select the notification type</Form.Label>
            <Form.Select
              name="notif_type"
              value={formData.notif_type}
              onChange={handleChange}
              required
              style={{ borderRadius: 12 }}
            >
              <option value="">Select type</option>
              <option value="leave">Leave</option>
              <option value="holiday">Holiday</option>
              <option value="custom">Custom</option>
              <option value="office">Office</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Users</Form.Label>
            <UserMultiSelect value={selectedUsers} onChange={handleUserChange} />
          </Form.Group>
          <div className="d-flex justify-content-between mt-4">
            <Button variant="danger" onClick={onClose} style={{ borderRadius: 20, minWidth: 120, fontWeight: 500 }}>Cancel</Button>
            <Button type="submit" style={{ borderRadius: 20, minWidth: 120, fontWeight: 500, backgroundColor: '#5B4B8A', border: 'none' }} disabled={loading}>
              {loading ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddNotificationModal;
