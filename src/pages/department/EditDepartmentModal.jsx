import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import EmojiPicker from 'emoji-picker-react';
import { updateDepartment } from '../../services/departmentService';

const EditDepartmentModal = ({ show, onClose, onDepartmentUpdated, departmentToEdit }) => {

    const [form, setForm] = useState({ name: '', manager: '', description: '', icon: '' });
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    useEffect(() => {
        if (departmentToEdit) {

            setForm({
                name: departmentToEdit.name || '',
                manager: departmentToEdit.manager || '',
                description: departmentToEdit.description || '',
                icon: departmentToEdit.icon || ''
            });
        }
    }, [departmentToEdit]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const onEmojiClick = (emojiObject) => {
        setForm(prevForm => ({ ...prevForm, icon: emojiObject.emoji }));
        setShowEmojiPicker(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!departmentToEdit) return;

        try {

            await updateDepartment(departmentToEdit.id, form);
            onDepartmentUpdated();
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
                    <Form.Group className="mb-3 d-flex align-items-center">
                        <Form.Label className="fw-bold mb-0 me-3" style={{ flex: '0 0 170px' }}>Department Name:</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Input Department Name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            style={{ borderRadius: 12 }}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <div className="d-flex align-items-center">
                            <Form.Label className="fw-bold mb-0 me-3">Icon:</Form.Label>
                            <Button variant="outline-secondary" onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ borderRadius: 12, height: '38px', minWidth: '120px' }}>
                                {form.icon ? form.icon : 'Choose Icon'}
                            </Button>
                        </div>
                        {showEmojiPicker && (
                            <div className="mt-2">
                                <EmojiPicker onEmojiClick={onEmojiClick} />
                            </div>
                        )}
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
                    <Form.Group className="mb-4 d-flex align-items-center">
                        <Form.Label className="fw-bold mb-0 me-3" style={{ flex: '0 0 170px' }}>Assign Manager:</Form.Label>
                        <Form.Control
                            type="text"
                            readOnly
                            plaintext
                            value={departmentToEdit?.manager_name || 'No Manager Assigned'}
                            className="text-end"
                        />
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