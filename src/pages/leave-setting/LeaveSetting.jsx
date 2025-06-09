import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

// Import all the necessary service functions
import { getLeaveTypes, getLeaveSettings, updateLeaveSettings, deleteLeaveTypes } from '../../services/leaveService';

// Import all the modals
import AddLeaveTypeModal from './AddLeaveTypeModal';
import EditLeaveTypeModal from './EditLeaveTypeModal';
import DeleteConfirmationModal from '../../pages/modal/DeleteConfirmationModal';
import SuccessModal from '../../pages/modal/SuccessModal';

const LeaveSetting = () => {
  // State for the Leave Types table
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [leaveTypeToEdit, setLeaveTypeToEdit] = useState(null);

  // State for the Delete Confirmation and Success modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leaveTypeToDelete, setLeaveTypeToDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // State for the Leave Configuration Form
  const [settings, setSettings] = useState({
    working_hours_start: '09:00',
    working_hours_end: '17:00',
    is_flexible_hours_enabled: false,
    is_weekday_workday: true,
    is_weekend_workday: false,
    cycle_type: 'annual',
  });

  const fetchLeaveData = useCallback(async () => {
    try {
      const typesData = await getLeaveTypes();
      const settingsData = await getLeaveSettings();
      setLeaveTypes(typesData);
      setSettings(settingsData);
    } catch (error) {
      console.error("Error fetching leave settings:", error);
    }
  }, []);

  useEffect(() => {
    fetchLeaveData();
  }, [fetchLeaveData]);

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleConfigSubmit = async () => {
    try {
      await updateLeaveSettings(settings);
      setSuccessMessage('Settings saved successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert('Failed to save settings.');
    }
  };

  const handleSuccess = (message) => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSuccessMessage(message);
    setShowSuccessModal(true);
    fetchLeaveData();
  };

  const handleEditClick = (leaveType) => {
    setLeaveTypeToEdit(leaveType);
    setShowEditModal(true);
  };

  const handleDeleteClick = (leaveType) => {
    setLeaveTypeToDelete(leaveType);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!leaveTypeToDelete) return;
    try {
      await deleteLeaveTypes(leaveTypeToDelete.leave_type_id);
      setShowDeleteModal(false);
      setSuccessMessage('Leave type deleted successfully');
      setShowSuccessModal(true);
      fetchLeaveData();
    } catch (err) {
      console.error("Failed to delete leave type", err);
      alert("Failed to delete leave type.");
    }
  };

  return (
    <Container fluid className="p-4">
      <Row className="align-items-center mb-3">
        <Col>
          <h3 className="mb-0 fw-bold">Leave Setting</h3>
          <div className="text-muted" style={{ fontSize: '0.95rem' }}>settings / Leave Setting</div>
        </Col>
        <Col xs="auto">
          <button className="btn btn-primary" style={{ borderRadius: 20, fontWeight: 500, padding: '8px 24px' }} onClick={() => setShowAddModal(true)}>
            <FaPlus className="me-2" /> Add New Leave
          </button>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <div className="table-responsive">
                <Table className="table-borderless align-middle mb-0 text-center" style={{ minWidth: 900 }}>
                  <thead>
                    <tr>
                      <th>Leave Types</th>
                      <th>Icon</th>
                      <th>Days</th>
                      <th>Description</th>
                      <th>Color</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveTypes.map((lt) => (
                      <tr key={lt.leave_type_id}>
                        <td><span className="fw-semibold ms-1">{lt.name}</span></td>
                        <td><span className="fs-5">{lt.icon}</span></td>
                        <td>{lt.days}</td>
                        <td>{lt.description}</td>
                        <td>{lt.color}</td>
                        <td>
                          <Button size="sm" variant="success" className="me-2 custom-btn" onClick={() => handleEditClick(lt)}>Edit</Button>
                          <Button size="sm" variant="danger" className="custom-btn" onClick={() => handleDeleteClick(lt)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Body>
              <div className="fw-bold mb-3 fs-5">Additional Configuration</div>
              <Row>
                <Col md={4} className="mb-3 mb-md-0">
                  <div className="fw-semibold mb-2">Working Hours</div>
                  <Form>
                    <InputGroup className="mb-2">
                      <Form.Control type="time" name="working_hours_start" value={settings.working_hours_start} onChange={handleSettingsChange} style={{ maxWidth: 110 }} />
                      <InputGroup.Text>to</InputGroup.Text>
                      <Form.Control type="time" name="working_hours_end" value={settings.working_hours_end} onChange={handleSettingsChange} style={{ maxWidth: 110 }} />
                    </InputGroup>
                    <Form.Check type="checkbox" name="is_flexible_hours_enabled" label="Enable Flexible Hours" checked={settings.is_flexible_hours_enabled} onChange={handleSettingsChange} />
                  </Form>
                </Col>
                <Col md={4} className="mb-3 mb-md-0">
                  <div className="fw-semibold mb-2">Working Days</div>
                  <Form>
                    <Form.Check type="checkbox" name="is_weekday_workday" label="Weekday : Monday - Friday" checked={settings.is_weekday_workday} onChange={handleSettingsChange} className="mb-2" />
                    <Form.Check type="checkbox" name="is_weekend_workday" label="Weekend : Saturday - Sunday" checked={settings.is_weekend_workday} onChange={handleSettingsChange} />
                  </Form>
                </Col>
                <Col md={4}>
                  <div className="fw-semibold mb-2">Cycle Type</div>
                  <Form>
                    <Form.Check type="radio" value="annual" label="Annual cycle: January - December" name="cycle_type" checked={settings.cycle_type === 'annual'} onChange={handleSettingsChange} className="mb-2" />
                    <Form.Check type="radio" value="join_date" label="Employee Join Date Anniversary" name="cycle_type" checked={settings.cycle_type === 'join_date'} onChange={handleSettingsChange} />
                  </Form>
                </Col>
              </Row>
              <div className="d-flex justify-content-end mt-4">
                <Button style={{ borderRadius: 20, padding: '8px 32px' }} variant="primary" onClick={handleConfigSubmit}>Save Changes</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <AddLeaveTypeModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onLeaveTypeAdded={() => handleSuccess("Leave Type added successfully")}
      />
      <EditLeaveTypeModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        leaveTypeToEdit={leaveTypeToEdit}
        onLeaveTypeUpdated={() => handleSuccess("Leave Type updated successfully")}
      />
      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />
      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Leave Type"
        message={`Are you sure you want to delete the "${leaveTypeToDelete?.name}" leave type?`}
      />
    </Container>
  );
};

export default LeaveSetting;