import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import './Role.scss';
import { FaPlus } from 'react-icons/fa';

import { getRoles, addRole, updateRole, deleteRole, getAllPermissions } from '../../services/roleService';

import AddEditRoleModal from './AddEditRoleModal';
import SuccessModal from '../../pages/modal/SuccessModal';
import DeleteConfirmationModal from '../../pages/modal/DeleteConfirmationModal';
import CustomLoader from '../../components/CustomLoader';

const Role = () => {
  const [roles, setRoles] = useState([]);
  const [permissionsAll, setPermissionsAll] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const rolesPerPage = 10;

  // Fetch roles and permissions
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRoles();
      setRoles(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setLoading(false);
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    try {
      const data = await getAllPermissions();
      setPermissionsAll(data);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [fetchRoles, fetchPermissions]);

  const handleEditClick = (role) => {
    setRoleToEdit(role);
    setShowEditModal(true);
  };

  const handleDeleteClick = (role) => {
    setRoleToDelete(role);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (roleId) => {
    if (!roleId) return;
    try {
      await deleteRole(roleId);
      setShowDeleteModal(false);
      setSuccessMessage("Role deleted successfully");
      setShowSuccessModal(true);
      fetchRoles();
    } catch (error) {
      console.error("Error deleting role:", error);
    }
  };

  const handleSuccess = (message) => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSuccessMessage(message);
    setShowSuccessModal(true);
    fetchRoles();
  };

  // Filtered and paginated roles
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(search.toLowerCase())
  );
  const indexOfLastRole = currentPage * rolesPerPage;
  const indexOfFirstRole = indexOfLastRole - rolesPerPage;
  const currentRoles = filteredRoles.slice(indexOfFirstRole, indexOfLastRole);
  const totalPages = Math.ceil(filteredRoles.length / rolesPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <Container fluid className="p-4 role-management-page">
      <Row className="align-items-center mb-3">
        <Col>
          <h3 className="mb-0 fw-bold">Role Management</h3>
          <div className="text-muted" style={{ fontSize: '0.95rem' }}>settings / Role Management</div>
        </Col>
        <Col xs="12" md="4" className="mb-2 mb-md-0">
          <input
            type="text"
            className="form-control"
            placeholder="Search by role name"
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </Col>
        <Col xs="auto">
          <button className="btn btn-primary" style={{ borderRadius: 20, fontWeight: 500, padding: '8px 24px' }} onClick={() => setShowAddModal(true)}>
            <FaPlus className="me-2" /> Add New Role
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
                      <th>Permissions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="3" className="text-center py-5">
                          <CustomLoader />
                        </td>
                      </tr>
                    ) : filteredRoles.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center text-muted">No roles found.</td>
                      </tr>
                    ) : (
                      currentRoles.map((role) => (
                        <tr key={role.id}>
                          <td><b>{role.name}</b></td>
                          <td>
                            {role.permissions?.length > 0 ? (
                              <div className="d-flex flex-wrap gap-1 justify-content-center">
                                {role.permissions.map((perm, idx) => (
                                  <span key={perm || idx} className="badge bg-primary text-light m-1">
                                    {typeof perm === 'string' ? perm : (perm.name || perm.id || perm)}
                                  </span>
                                ))}
                              </div>
                            ) : 'No permissions'}
                          </td>
                          <td>
                            <Button variant="success" size="sm" className="me-2 custom-btn" onClick={() => handleEditClick(role)}>Edit</Button>
                            <Button variant="danger" size="sm" className="custom-btn" onClick={() => handleDeleteClick(role)}>Delete</Button>
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

      {/* --- Modals --- */}
      <AddEditRoleModal
        show={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setRoleToEdit(null);
        }}
        onSubmit={async (data) => {
          try {
            if (showAddModal) {
              await addRole({ ...data, permissions: data.permissions });
              handleSuccess('Role added successfully');
            } else if (showEditModal && roleToEdit) {
              await updateRole(roleToEdit.id, { ...data, permissions: data.permissions });
              handleSuccess('Role updated successfully');
            }
          } catch (err) {
            // handle error
          }
        }}
        permissionsAll={permissionsAll}
        initialData={showEditModal ? roleToEdit : undefined}
      />
      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />
      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => handleConfirmDelete(roleToDelete?.id)}
        title="Delete Role"
        message={`Are you sure you want to delete the role "${roleToDelete?.name}"?`}
      />

      {/* Pagination */}
      {filteredRoles.length > rolesPerPage && (
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
      )}
    </Container>
  );
};

export default Role;