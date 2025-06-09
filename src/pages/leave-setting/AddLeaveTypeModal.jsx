import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { addLeaveTypes } from '../../services/leaveService'; // Use the renamed function

const AddLeaveTypeModal = ({ show, onClose, onLeaveTypeAdded }) => {
    const [formData, setFormData] = useState({ name: '', days: '', description: '' , color: ''});
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await addLeaveTypes(formData);
            onLeaveTypeAdded(); // This will trigger a success message and refresh
        } catch (err) {
            console.error("Error adding leave type:", err);
            setError("Failed to add leave type. Please check the details.");
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered contentClassName="rounded-5 border-0">
            <Modal.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                    <h4 className="fw-bold" style={{ color: '#5B4B8A' }}>Add New Leave Type</h4>
                </div>
                <Form onSubmit={handleSubmit}>
                    {error && <p className="text-danger text-center">{error}</p>}
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Leave Name</Form.Label>
                        <Form.Control type="text" name="name" placeholder="e.g., Annual Leave" onChange={handleChange} required style={{ borderRadius: 12 }} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Days</Form.Label>
                        <Form.Control type="number" name="days" placeholder="e.g., 12" onChange={handleChange} required style={{ borderRadius: 12 }} />
                    </Form.Group>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Description</Form.Label>
                        <Form.Control as="textarea" name="description" rows={3} placeholder="Enter a short description" onChange={handleChange} style={{ borderRadius: 12 }} />
                    </Form.Group>
                    <Form.Group className="mb-5">
                        <Form.Label className="fw-bold">Color</Form.Label>
                        <Form.Control type="textarea" name="color" placeholder="e.g., #ffffff" onChange={handleChange} required style={{ borderRadius: 12 }} />
                    </Form.Group>
                    <div className="d-flex justify-content-between mt-4">
                        <Button variant="danger" onClick={onClose} style={{ borderRadius: 20, minWidth: 120, fontWeight: 500 }}>Cancel</Button>
                        <Button type="submit" style={{ borderRadius: 20, minWidth: 120, fontWeight: 500, backgroundColor: '#5B4B8A', border: 'none' }}>Add</Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddLeaveTypeModal;