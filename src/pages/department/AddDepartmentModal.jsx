import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

import { getManagers, addDepartment } from '../../services/departmentService';

const AddDepartmentModal = ({ show, onClose, onDepartmentAdded }) => {
    const [form, setForm] = useState({
        name: '',
        manager: '',
    });
    const [managers, setManagers] = useState([]);

    useEffect(() => {
        if (show) {
            const fetchManagers = async () => {
                try {
                    const data = await getManagers();

                    if (Array.isArray(data)) {
                        setManagers(data);
                    } else {
                        console.warn("Data from getManagers was not an array:", data);
                        setManagers([]);
                    }
                } catch (error) {
                    console.error('Error fetching managers:', error);
                    setManagers([]);
                }
            };
            fetchManagers();
        }
    }, [show]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newDepartment = await addDepartment(form);
            onDepartmentAdded(newDepartment);
            onClose();
        } catch (error) {
            console.error('Error adding department:', error);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered contentClassName="add-department-modal rounded-5">
            <Modal.Body className="p-4" style={{ borderRadius: 20 }}>
                <div className="text-center mb-4">
                    <div style={{ color: '#5B4B8A', fontWeight: 700, fontSize: 22 }}>Add New Department</div>
                </div>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3 d-flex align-items-center">
                        <Form.Label className="fw-bold mb-0 me-2" style={{ minWidth: 170 }}>Department Name:</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Input Department Name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            style={{ borderRadius: 8, fontSize: 15 }}
                        />
                    </Form.Group>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold mb-2">Assign Manager</Form.Label>
                        <Form.Control
                            as="select"
                            name="manager"
                            value={form.manager}
                            onChange={handleChange}
                            required
                            style={{ borderRadius: 8, fontSize: 15 }}
                        >
                            <option value="">Select a Manager</option>
                            {managers.map((manager) => (
                                <option key={manager.id} value={manager.id}>
                                    {manager.full_name}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <div className="d-flex justify-content-between mt-4">
                        <Button variant="danger" onClick={onClose} style={{ borderRadius: 20, minWidth: 110, fontWeight: 500, fontSize: 16 }}>Cancel</Button>
                        <Button type="submit" variant="primary" style={{ borderRadius: 20, minWidth: 110, fontWeight: 500, fontSize: 16 }}>Add</Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddDepartmentModal;

