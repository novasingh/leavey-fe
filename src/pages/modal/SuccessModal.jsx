import React from 'react';
import { Modal } from 'react-bootstrap';

const SuccessModal = ({ show, onClose, title, message }) => {
    return (
        <Modal show={show} onHide={onClose} centered contentClassName="rounded-5 border-0">
            <Modal.Body className="text-center p-4 p-md-5">
                <div className="mb-4">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="32" cy="32" r="32" fill="#28a745" />
                        <path d="M44 24L28 40L20 32" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h5 className="fw-bold mb-2">{title || 'Done!'}</h5>
                <p className="text-muted mb-0">{message}</p>
            </Modal.Body>
        </Modal>
    );
};

export default SuccessModal;
