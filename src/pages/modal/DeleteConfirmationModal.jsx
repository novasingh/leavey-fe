import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DeleteConfirmationModal = ({ show, onClose, onConfirm, title, message }) => {
    return (
        <Modal show={show} onHide={onClose} centered contentClassName="rounded-5 border-0">
            <Modal.Body className="text-center p-4 p-md-5">
                <div className="mb-4">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="32" cy="32" r="32" fill="#FFC107" />
                        <path d="M30 42H34V46H30V42ZM30 18H34V38H30V18Z" fill="white" />
                    </svg>
                </div>

                <h5 className="fw-bold mb-2">{title || 'Delete Department'}</h5>
                <p className="text-muted">{message || 'Are you sure you want to delete this item?'}</p>

                <div className="d-flex justify-content-center mt-4">
                    <Button
                        variant="light"
                        onClick={onClose}
                        className="me-3"
                        style={{ borderRadius: 20, minWidth: 120, fontWeight: 500, border: '1px solid #dee2e6' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        style={{ borderRadius: 20, minWidth: 120, fontWeight: 500, backgroundColor: '#5B4B8A', border: 'none' }}
                    >
                        Yes
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default DeleteConfirmationModal;