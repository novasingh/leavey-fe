import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { addUser } from '../../services/userService';
import { getRoles } from '../../services/roleService';
import { getDepartments } from '../../services/departmentService';

const AddUserModal = ({ show, onClose, onUserAdded }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirm_password: '',
        role: '',
        department: '',
    });
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (show) {
            // Fetch roles and departments for the dropdowns
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
    }, [show]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirm_password) {
            setError("Passwords do not match.");
            return;
        }

        const payload = {
            ...formData,
            username: formData.email.split('@')[0],
        };

        try {
            await addUser(payload);
            onUserAdded();
        } catch (err) {
            console.error("Error adding user:", err);
            const errorData = err.response?.data;
            if (errorData) {
                if (errorData.username) setError(`Username error: ${errorData.username[0]}`);
                else if (errorData.email) setError(`Email error: ${errorData.email[0]}`);
                else if (errorData.password) setError(`Password error: ${errorData.password[0]}`);
                else setError('An unexpected error occurred.');
            } else {
                setError('Failed to add user.');
            }
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered size="lg" contentClassName="rounded-5 border-0">
            <Modal.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                    <h4 className="fw-bold" style={{ color: '#5B4B8A' }}>Add New User</h4>
                </div>
                <Form onSubmit={handleSubmit}>
                    {error && <p className="text-danger text-center">{error}</p>}
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">First Name</Form.Label>
                                <Form.Control type="text" name="first_name" placeholder="Enter first name" onChange={handleChange} required style={{ borderRadius: 12 }} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Last Name</Form.Label>
                                <Form.Control type="text" name="last_name" placeholder="Enter last name" onChange={handleChange} required style={{ borderRadius: 12 }} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Email</Form.Label>
                        <Form.Control type="email" name="email" placeholder="Enter email address" onChange={handleChange} required style={{ borderRadius: 12 }} />
                    </Form.Group>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Password</Form.Label>
                                <Form.Control type="password" name="password" placeholder="Enter password" onChange={handleChange} required style={{ borderRadius: 12 }} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Confirm Password</Form.Label>
                                <Form.Control type="password" name="confirm_password" placeholder="Confirm password" onChange={handleChange} required style={{ borderRadius: 12 }} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Role</Form.Label>
                                <Form.Select name="role" onChange={handleChange} required style={{ borderRadius: 12 }}>
                                    <option value="">Select a Role</option>
                                    {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Department</Form.Label>
                                <Form.Select name="department" onChange={handleChange} required style={{ borderRadius: 12 }}>
                                    <option value="">Select a Department</option>
                                    {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    <div className="d-flex justify-content-between mt-4">
                        <Button variant="danger" onClick={onClose} style={{ borderRadius: 20, minWidth: 120, fontWeight: 500 }}>Cancel</Button>
                        <Button type="submit" style={{ borderRadius: 20, minWidth: 120, fontWeight: 500, backgroundColor: '#5B4B8A', border: 'none' }}>Add</Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddUserModal;