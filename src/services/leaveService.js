import api from './axios';

// --- Functions for Leave Types ---
const LEAVE_TYPE_URL = '/leave-types/'; 

export const getLeaveTypes = async () => {
    const res = await api.get(LEAVE_TYPE_URL);
    return res.data;
};

export const addLeaveTypes = async (data) => {
    const res = await api.post(LEAVE_TYPE_URL, data);
    return res.data;
};

export const updateLeaveTypes = async (id, data) => {
    const res = await api.put(`${LEAVE_TYPE_URL}${id}/`, data);
    return res.data;
};

export const deleteLeaveTypes = async (id) => {
    const res = await api.delete(`${LEAVE_TYPE_URL}${id}/`);
    return res.data;
};

// --- Functions for Leave Requests ---
const LEAVE_REQUEST_URL = '/leave-requests/';

export const getLeave = async () => {
    const res = await api.get(LEAVE_REQUEST_URL);
    return res.data;
};

export const addLeave = async (data) => {
    const res = await api.post(LEAVE_REQUEST_URL, data, {
        headers: { 
            'Content-Type': 'multipart/form-data',
        }
    });
    return res.data;
};

export const updateLeave = async (id, data) => {
    const token = localStorage.getItem('access_token');
    const res = await api.patch(`${LEAVE_REQUEST_URL}${id}/`, data, {
        headers: { Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json', }
        
    });
    return res.data;
};


export const deleteLeave = async (id) => {
    const res = await api.delete(`${LEAVE_REQUEST_URL}${id}/`);
    return res.data;
};

export const getLeaveById = async (id) => {
    const res = await api.get(`${LEAVE_REQUEST_URL}${id}/`);
    return res.data;
};

// --- Functions for Leave Settings Configuration (These are new) ---
const LEAVE_SETTINGS_URL = '/leave-settings/';

export const getLeaveSettings = async () => {
    const res = await api.get(LEAVE_SETTINGS_URL);
    return res.data;
};

export const updateLeaveSettings = async (data) => {
    const res = await api.put(LEAVE_SETTINGS_URL, data);
    return res.data;
};

