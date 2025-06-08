import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import './Role.scss';
import { FaPlus } from 'react-icons/fa';

import { getUsers, deleteUser } from '../../services/userService';

import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import SuccessModal from '../../pages/modal/SuccessModal';
import DeleteConfirmationModal from '../../pages/modal/DeleteConfirmationModal';

const Role = () => {
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditClick = (user) => {
    setUserToEdit(user);
    setShowEditModal(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (userId) => {
    if (!userId) return;
    try {
      await deleteUser(userId);
      setShowDeleteModal(false);
      setSuccessMessage("User deleted successfully");
      setShowSuccessModal(true);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleSuccess = (message) => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSuccessMessage(message);
    setShowSuccessModal(true);
    fetchUsers();
  };

  return (
    <Container fluid className="p-4 role-management-page">
      <Row className="align-items-center mb-3">
        <Col>
          <h3 className="mb-0 fw-bold">Role Management</h3>
          <div className="text-muted" style={{ fontSize: '0.95rem' }}>settings / Role Management</div>
        </Col>
        <Col xs="auto">
          <button className="btn btn-primary" style={{ borderRadius: 20, fontWeight: 500, padding: '8px 24px' }} onClick={() => setShowAddModal(true)}>
            <FaPlus className="me-2" /> Add New User
          </button>
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
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td><b>{`${user.first_name} ${user.last_name}`}</b></td>
                        <td>{user.email}</td>
                        <td>{user.role_details?.name || 'N/A'}</td>
                        <td>{user.department?.name || 'N/A'}</td>
                        <td>
                          <span className={`badge bg-${user.is_active ? 'success' : 'secondary'}`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <Button variant="success" size="sm" className="me-2 custom-btn" onClick={() => handleEditClick(user)}>Edit</Button>
                          <Button variant="danger" size="sm" className="custom-btn" onClick={() => handleDeleteClick(user)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- Modals --- */}
      <AddUserModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onUserAdded={() => handleSuccess("User added successfully")}
      />
      <EditUserModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        userToEdit={userToEdit}
        onUserUpdated={() => handleSuccess("User updated successfully")}
      />
      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />
      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => handleConfirmDelete(userToDelete?.id)}
        title="Delete User"
        message={`Are you sure you want to delete the user "${userToDelete?.first_name} ${userToDelete?.last_name}"?`}
      />
    </Container>
  );
};

export default Role;