import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import EmojiPicker from 'emoji-picker-react';
import { updateLeaveTypes } from '../../services/leaveService';

const EditLeaveTypeModal = ({ show, onClose, onLeaveTypeUpdated, leaveTypeToEdit }) => {
    const [formData, setFormData] = useState({ name: '', days: '', description: '', icon: '', color: '' });
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (leaveTypeToEdit) {
            setFormData({
                name: leaveTypeToEdit.name || '',
                days: leaveTypeToEdit.days || '',
                description: leaveTypeToEdit.description || '',
                color: leaveTypeToEdit.color || '',
            });
        }
    }, [leaveTypeToEdit]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onEmojiClick = (emojiObject) => {
        setFormData(prev => ({ ...prev, icon: emojiObject.emoji }));
        setShowEmojiPicker(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!leaveTypeToEdit) return;
        try {
            await updateLeaveTypes(leaveTypeToEdit.leave_type_id, formData);
            onLeaveTypeUpdated();
        } catch (err) {
            console.error("Error updating leave type:", err);
            setError("Failed to update leave type.");
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered size="lg" contentClassName="rounded-5 border-0">
            <Modal.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                    <h4 className="fw-bold" style={{ color: '#5B4B8A' }}>Edit Leave Type</h4>
                </div>
                <Form onSubmit={handleSubmit}>
                    {error && <p className="text-danger text-center">{error}</p>}
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Leave Name:</Form.Label>
                        <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required style={{ borderRadius: 12 }} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Icon:</Form.Label>
                        <Button variant="outline-secondary" className="w-100" onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ borderRadius: 12, height: '38px' }}>
                            {formData.icon ? formData.icon : 'Choose'}
                        </Button>
                    </Form.Group>
                    {showEmojiPicker && (
                        <div className="d-flex justify-content-center mb-3">
                            <EmojiPicker onEmojiClick={onEmojiClick} />
                        </div>
                    )}
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Days:</Form.Label>
                        <Form.Control type="number" name="days" value={formData.days} onChange={handleChange} required style={{ borderRadius: 12 }} />
                    </Form.Group>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Description:</Form.Label>
                        <Form.Control as="textarea" name="description" value={formData.description} rows={3} onChange={handleChange} style={{ borderRadius: 12 }} />
                    </Form.Group>
                    <Form.Group className="mb-5">
                        <Form.Label className="fw-bold">Color:</Form.Label>
                        <Form.Control type="text" name="color" value={formData.color} onChange={handleChange} required style={{ borderRadius: 12 }} />
                    </Form.Group>
                    <div className="d-flex justify-content-between mt-4">
                        <Button variant="danger" onClick={onClose} style={{ borderRadius: 20, minWidth: 120, fontWeight: 500 }}>Cancel</Button>
                        <Button type="submit" style={{ borderRadius: 20, minWidth: 120, fontWeight: 500, backgroundColor: '#5B4B8A', border: 'none' }}>Save Changes</Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EditLeaveTypeModal;
