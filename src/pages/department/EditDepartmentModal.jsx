import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { getManagers, updateDepartment } from '../../services/departmentService';

const EditDepartmentModal = ({ show, onClose, onDepartmentUpdated, departmentToEdit }) => {

    const [form, setForm] = useState({ name: '', manager: '', description: '' });
    const [managers, setManagers] = useState([]);

    useEffect(() => {
        if (show) {
            const fetchManagers = async () => {
                try {
                    const data = await getManagers();
                    if (Array.isArray(data)) {
                        setManagers(data);
                    }
                } catch (error) {
                    console.error('Error fetching managers:', error);
                }
            };
            fetchManagers();
        }
    }, [show]);

    useEffect(() => {
        if (departmentToEdit) {

            setForm({
                name: departmentToEdit.name || '',
                manager: departmentToEdit.manager || '',
                description: departmentToEdit.description || ''
            });
        }
    }, [departmentToEdit]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!departmentToEdit) return;

        try {

            const updatedDepartment = await updateDepartment(departmentToEdit.id, form);
            onDepartmentUpdated(updatedDepartment);
            onClose();
        } catch (error) {
            console.error('Error updating department:', error);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered contentClassName="rounded-5">
            <Modal.Body className="p-4">
                <div className="text-center mb-4">
                    <div style={{ color: '#5B4B8A', fontWeight: 700, fontSize: 22 }}>Edit Department</div>
                </div>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Department Name: </Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Input Department Name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>


                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Description: </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Enter a short description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Assign Manager:</Form.Label>
                        <Form.Select
                            name="manager"
                            value={form.manager}
                            onChange={handleChange}
                            required
                            style={{ borderRadius: 12 }}
                        >
                            <option value="">Select a Manager</option>
                            {managers.map((manager) => (
                                <option key={manager.id} value={manager.id}>
                                    {manager.full_name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <div className="d-flex justify-content-between mt-4">
                        <Button variant="danger" onClick={onClose} style={{ borderRadius: 20, minWidth: 110, fontWeight: 500, fontSize: 16 }}>Cancel</Button>
                        <Button type="submit" variant="primary" style={{ borderRadius: 20, minWidth: 110, fontWeight: 500, fontSize: 16 }}>Save Changes</Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EditDepartmentModal;