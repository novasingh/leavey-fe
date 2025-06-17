import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const AddEditRoleModal = ({ show, onClose, onSubmit, permissionsAll, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    permissions: [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        permissions: initialData.permissions ? initialData.permissions.map(p => p) : [],
      });
    } else {
      setFormData({ name: '', description: '', is_active: true, permissions: [] });
    }
  }, [initialData, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePermissionChange = (id) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(id)
        ? prev.permissions.filter(pid => pid !== id)
        : [...prev.permissions, id],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg" contentClassName="rounded-5 border-0">
      <Modal.Body className="p-4 p-md-5">
        <div className="text-center mb-4">
          <h4 className="fw-bold" style={{ color: '#5B4B8A' }}>{initialData ? 'Edit Role' : 'Add New Role'}</h4>
        </div>
        <Form onSubmit={handleSubmit}>
          {/* Error message placeholder if needed */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Name *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder="Enter role name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={1}
              maxLength={50}
              style={{ borderRadius: 12 }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              placeholder="Enter description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              style={{ borderRadius: 12 }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Is Active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              style={{ borderRadius: 12 }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Permissions</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {permissionsAll?.permissions?.map(perm => {
                let permId, permName;
                if (typeof perm === 'string') {
                  permId = perm;
                  permName = perm;
                } else {
                  permId = perm.id || perm.key || perm;
                  permName = perm.name || perm.label || permId;
                }
                return (
                  <Form.Check
                    key={permId}
                    type="checkbox"
                    label={permName}
                    checked={formData.permissions.includes(permId)}
                    onChange={() => handlePermissionChange(permId)}
                    style={{ borderRadius: 12 }}
                  />
                );
              })}
            </div>
          </Form.Group>
          <div className="d-flex justify-content-between mt-4">
            <Button variant="danger" onClick={onClose} style={{ borderRadius: 20, minWidth: 120, fontWeight: 500 }}>Cancel</Button>
            <Button type="submit" style={{ borderRadius: 20, minWidth: 120, fontWeight: 500, backgroundColor: '#5B4B8A', border: 'none' }}>{initialData ? 'Update' : 'Add'}</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddEditRoleModal;
