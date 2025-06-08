import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { updateUser } from '../../services/userService';
import { getRoles } from '../../services/roleService';
import { getDepartments } from '../../services/departmentService';

const EditUserModal = ({ show, onClose, onUserUpdated, userToEdit }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        role: '',
        department: '',
    });
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (userToEdit) {
            setFormData({
                first_name: userToEdit.first_name || '',
                last_name: userToEdit.last_name || '',
                email: userToEdit.email || '',
                role: userToEdit.role_details?.id || '',
                department: userToEdit.department?.id || '',
            });
        }
        if (show) {
            const fetchData = async () => {
                try {
                    const rolesData = await getRoles();
                    const deptsData = await getDepartments();
                    setRoles(rolesData);
                    setDepartments(deptsData);
                } catch (err) {
                    console.error("Failed to fetch roles or departments", err);
                }
            };
            fetchData();
        }
    }, [userToEdit, show]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!userToEdit) return;

        const payload = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            role: formData.role || null,
            department_id: formData.department || null,
        };

        try {
            await updateUser(userToEdit.id, payload);
            onUserUpdated();
        } catch (err) {
            console.error("Error updating user:", err);
            const errorData = err.response?.data;
            if (errorData) {
                if (errorData.email) setError(`Email error: ${errorData.email[0]}`);
                else if (errorData.role) setError(`Role error: ${errorData.role[0]}`);
                else if (errorData.department_id) setError(`Department error: ${errorData.department_id[0]}`);
                else setError('An unexpected error occurred.');
            } else {
                setError('Failed to update user.');
            }
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered contentClassName="rounded-5 border-0">
            <Modal.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                    <h4 className="fw-bold" style={{ color: '#5B4B8A' }}>Edit User</h4>
                </div>
                <Form onSubmit={handleSubmit}>
                    {error && <p className="text-danger text-center">{error}</p>}
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">First Name</Form.Label>
                                <Form.Control type="text" name="first_name" value={formData.first_name} onChange={handleChange} required style={{ borderRadius: 12 }} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Last Name</Form.Label>
                                <Form.Control type="text" name="last_name" value={formData.last_name} onChange={handleChange} required style={{ borderRadius: 12 }} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Email</Form.Label>
                        <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required style={{ borderRadius: 12 }} />
                    </Form.Group>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Role</Form.Label>
                                <Form.Select name="role" value={formData.role} onChange={handleChange} required style={{ borderRadius: 12 }}>
                                    <option value="">Select a Role</option>
                                    {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Department</Form.Label>
                                <Form.Select name="department" value={formData.department} onChange={handleChange} required style={{ borderRadius: 12 }}>
                                    <option value="">Select a Department</option>
                                    {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    <div className="d-flex justify-content-between mt-4">
                        <Button variant="danger" onClick={onClose} style={{ borderRadius: 20, minWidth: 120, fontWeight: 500 }}>Cancel</Button>
                        <Button type="submit" style={{ borderRadius: 20, minWidth: 120, fontWeight: 500, backgroundColor: '#5B4B8A', border: 'none' }}>Save Changes</Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EditUserModal;