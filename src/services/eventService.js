import api from './axios';

const API_URL = '/events/';

export const getEvents = async () => {
    const token = localStorage.getItem('access_token');
    const res = await api.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const addEvent = async (data) => {
    const token = localStorage.getItem('access_token');
    const res = await api.post(API_URL, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const updateEvent = async (id, data) => {
    const token = localStorage.getItem('access_token');
    const res = await api.put(`${API_URL}${id}/`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const deleteEvent = async (id) => {
    const token = localStorage.getItem('access_token');
    const res = await api.delete(`${API_URL}${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};
