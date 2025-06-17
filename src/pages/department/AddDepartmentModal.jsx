import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import EmojiPicker from 'emoji-picker-react';
import { addDepartment } from '../../services/departmentService';
import Select from 'react-select';
import { getUsers } from '../../services/userService';

const AddDepartmentModal = ({ show, onClose, onDepartmentAdded }) => {
    const [form, setForm] = useState({
        name: '',
        description: '',
        icon: '',
        manager: null,
    });
    const [managers, setManagers] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    useEffect(() => {
        const fetchManagers = async () => {
            try {
                const users = await getUsers();
                const managerUsers = users.filter(u => u.role_details?.name?.toLowerCase() === 'manager');
                setManagers(managerUsers.map(u => ({
                    value: u.id,
                    label: `${u.first_name} ${u.last_name} (${u.email})`
                })));
            } catch (e) {
                setManagers([]);
            }
        };
        fetchManagers();
    }, []);

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
        try {
            const payload = { ...form, manager: form.manager ? form.manager.value : null };
            const newDepartment = await addDepartment(payload);
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
                    <Form.Group className="mb-3 d-flex align-items-center">
                        <Form.Label className="fw-bold mb-0 me-3">Icon:</Form.Label>
                        <Button
                            variant="outline-secondary"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            style={{ borderRadius: 12, height: '38px', minWidth: '100px' }}
                        >
                            {form.icon ? form.icon : 'Choose'}
                        </Button>
                    </Form.Group>
                    {showEmojiPicker && (
                        <div className="d-flex justify-content-center mb-3">
                            <EmojiPicker onEmojiClick={onEmojiClick} />
                        </div>
                    )}
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold mb-2">Manager:</Form.Label>
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
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold mb-2">Description: </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Enter a short description for the department"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            style={{ borderRadius: 8, fontSize: 15 }}
                        />
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