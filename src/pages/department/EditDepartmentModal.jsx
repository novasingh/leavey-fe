import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import EmojiPicker from 'emoji-picker-react';
import { updateDepartment } from '../../services/departmentService';
import Select from 'react-select';
import { getUsers } from '../../services/userService';

const EditDepartmentModal = ({ show, onClose, onDepartmentUpdated, departmentToEdit }) => {
    const [form, setForm] = useState({ name: '', manager: null, description: '', icon: '' });
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [managers, setManagers] = useState([]);

    useEffect(() => {
        const fetchManagers = async () => {
            try {
                const users = await getUsers();
                let managerUsers = users.filter(u => u.role_details?.name?.toLowerCase() === 'manager');
                // Always include the current manager if editing and not in the list
                if (departmentToEdit && departmentToEdit.manager) {
                    const alreadyIncluded = managerUsers.some(u => u.id === departmentToEdit.manager);
                    if (!alreadyIncluded) {
                        const currentManager = users.find(u => u.id === departmentToEdit.manager);
                        if (currentManager) {
                            managerUsers = [currentManager, ...managerUsers];
                        }
                    }
                }
                setManagers(managerUsers.map(u => ({
                    value: u.id,
                    label: `${u.first_name} ${u.last_name} (${u.email})`
                })));
            } catch {
                setManagers([]);
            }
        };
        fetchManagers();
    }, [departmentToEdit]);

    useEffect(() => {
        if (departmentToEdit) {
            setForm({
                name: departmentToEdit.name || '',
                manager: departmentToEdit.manager ? {
                    value: departmentToEdit.manager,
                    label: departmentToEdit.manager_name || ''
                } : null,
                description: departmentToEdit.description || '',
                icon: departmentToEdit.icon || ''
            });
        }
    }, [departmentToEdit]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleManagerChange = (selected) => {
        setForm({ ...form, manager: selected });
    };

    const onEmojiClick = (emojiObject) => {
        setForm(prevForm => ({ ...prevForm, icon: emojiObject.emoji }));
        setShowEmojiPicker(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!departmentToEdit) return;
        try {
            const payload = { ...form, manager: form.manager ? form.manager.value : null };
            await updateDepartment(departmentToEdit.id, payload);
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
                        <Form.Label className="fw-bold">Manager:</Form.Label>
                        <Select
                            options={managers}
                            value={form.manager}
                            onChange={handleManagerChange}
                            placeholder="Select manager by name or email..."
                            isClearable
                            isSearchable
                            classNamePrefix="react-select"
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