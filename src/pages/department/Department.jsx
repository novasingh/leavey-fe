import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import './Department.scss';
import { FaPlus } from 'react-icons/fa';
import AddDepartmentModal from './AddDepartmentModal';
import EditDepartmentModal from './EditDepartmentModal';
import SuccessModal from '../modal/SuccessModal';
import DeleteConfirmationModal from '../modal/DeleteConfirmationModal';
import { getDepartments, deleteDepartment } from '../../services/departmentService';

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [departmentToEdit, setDepartmentToEdit] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [departmentToDelete, setDepartmentToDelete] = useState(null);

  const fetchDepartments = useCallback(async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleEditClick = (department) => {
    setDepartmentToEdit(department);
    setShowEditModal(true);
  };

  const handleDeleteClick = (department) => {
    setDepartmentToDelete(department);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (idToDelete) => {
    if (!idToDelete) {
      console.error("Delete failed: The department ID was not provided.");
      setShowDeleteModal(false);
      return;
    }
    try {
      await deleteDepartment(idToDelete);
      fetchDepartments();
      setShowDeleteModal(false);
      setSuccessMessage("Department deleted successfully");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error deleting department:", error);
      setShowDeleteModal(false);
    }
  };

  const handleAddSuccess = useCallback(() => {
    setShowAddModal(false);
    fetchDepartments();
    setSuccessMessage("Data added successfully");
    setShowSuccessModal(true);
  }, [fetchDepartments]);

  const handleEditSuccess = () => {
    setShowEditModal(false);
    fetchDepartments();
    setSuccessMessage("Data updated successfully");
    setShowSuccessModal(true);
  };

  return (
    <Container fluid className="p-4 department-management-page">
      <Row className="align-items-center mb-3">
        <Col>
          <h3 className="mb-0 fw-bold">Department Management</h3>
          <div className="text-muted" style={{ fontSize: '0.95rem' }}>settings / Department Management</div>
        </Col>
        <Col xs="auto">
          <button className="btn btn-primary" style={{ borderRadius: 20, fontWeight: 500, padding: '8px 24px' }}
            onClick={() => setShowAddModal(true)}>
            <FaPlus className="me-2" /> Add New Department
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
                      <th>Department Name</th>
                      <th>Manager Assigned</th>
                      <th>Number of Employees</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments?.map((dept) => (
                      <tr key={dept.id}>
                        <td><b>{dept.name}</b></td>
                        <td>{dept.manager_name}</td>
                        <td>{dept.total_employees}</td>
                        <td>
                          <Button
                            variant="success"
                            size="sm"
                            className="me-2 custom-btn"
                            onClick={() => handleEditClick(dept)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="custom-btn"
                            onClick={() => handleDeleteClick(dept)}
                          >
                            Delete
                          </Button>
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

      <AddDepartmentModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onDepartmentAdded={handleAddSuccess}
      />

      <EditDepartmentModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        departmentToEdit={departmentToEdit}
        onDepartmentUpdated={handleEditSuccess}
      />

      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />

      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => handleConfirmDelete(departmentToDelete?.id)}
        title="Delete Department"
        message={`Are you sure you want to delete the "${departmentToDelete?.name}" department?`}
      />
    </Container>
  );
};

export default Department;
