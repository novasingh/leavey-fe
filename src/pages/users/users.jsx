import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import './Users.scss';
import { FaPlus } from 'react-icons/fa';

import { getUsers, deleteUser } from '../../services/userService';
import { getDepartments } from '../../services/departmentService';
import { getRoles } from '../../services/roleService';

import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import SuccessModal from '../modal/SuccessModal';
import DeleteConfirmationModal from '../modal/DeleteConfirmationModal';
import CustomLoader from '../../components/CustomLoader';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  }, []);

  // Fetch departments and roles
  useEffect(() => {
    getDepartments().then(setDepartments);
    getRoles().then(setRoles);
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

  // Filtering logic
  const filteredUsers = users.filter(user => {
    const nameMatch = `${user.first_name} ${user.last_name}`.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase());
    const roleMatch = !roleFilter || user.role_details?.name === roleFilter;
    const deptMatch = !departmentFilter || user.department?.name === departmentFilter;
    const statusMatch = !statusFilter || (statusFilter === 'active' ? user.is_active : !user.is_active);
    return nameMatch && roleMatch && deptMatch && statusMatch;
  });

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <Container fluid className="p-4 role-management-page">
      <Row className="align-items-center mb-3">
        <Col>
          <h3 className="mb-0 fw-bold">User Management</h3>
          <div className="text-muted" style={{ fontSize: '0.95rem' }}>settings / User Management</div>
        </Col>
        <Col xs="auto">
          <button className="btn btn-primary" style={{ borderRadius: 20, fontWeight: 500, padding: '8px 24px' }} onClick={() => setShowAddModal(true)}>
            <FaPlus className="me-2" /> Add New User
          </button>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={3} className="mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or email"
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </Col>
        <Col md={3} className="mb-2">
          <select className="form-select" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }}>
            <option value="">All Roles</option>
            {roles.map(role => (
              <option key={role.id} value={role.name}>{role.name}</option>
            ))}
          </select>
        </Col>
        <Col md={3} className="mb-2">
          <select className="form-select" value={departmentFilter} onChange={e => { setDepartmentFilter(e.target.value); setCurrentPage(1); }}>
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.name}>{dept.name}</option>
            ))}
          </select>
        </Col>
        <Col md={3} className="mb-2">
          <select className="form-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
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
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-5">
                          <CustomLoader />
                        </td>
                      </tr>
                    ) : currentUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">No users found.</td>
                      </tr>
                    ) : (
                      currentUsers.map((user) => (
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pagination */}
      <Row className="mt-3">
        <Col>
          <nav>
            <ul className="pagination justify-content-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <li key={page} className={`page-item${page === currentPage ? ' active' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(page)}>{page}</button>
                </li>
              ))}
            </ul>
          </nav>
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

export default Users;