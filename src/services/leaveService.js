import api from './axios';

// LEAVE SERVICES (for LeaveType and LeaveRequest)
const LEAVE_TYPE_URL = '/leave-types/';
const LEAVE_REQUEST_URL = '/leave-requests/';

export const getLeaveTypes = async () => {
    const token = localStorage.getItem('access_token');
    const res = await api.get(LEAVE_TYPE_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const addLeaveTypes= async (data) => {
    const token = localStorage.getItem('access_token');
    const res = await api.post(LEAVE_TYPE_URL, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const updateLeaveTypes = async (id, data) => {
    const token = localStorage.getItem('access_token');
    const res = await api.put(`${LEAVE_TYPE_URL}${id}/`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const deleteLeaveTypes = async (id) => {
    const token = localStorage.getItem('access_token');
    const res = await api.delete(`${LEAVE_TYPE_URL}${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

// LEAVE REQUEST SERVICES
export const getLeave = async () => {
    const token = localStorage.getItem('access_token');
    const res = await api.get(LEAVE_REQUEST_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const addLeave = async (data) => {
    const token = localStorage.getItem('access_token');
    const res = await api.post(LEAVE_REQUEST_URL, data, {
        headers: { 
            
             'Authorization': `Bearer ${token}`,
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
    const token = localStorage.getItem('access_token');
    const res = await api.delete(`${LEAVE_REQUEST_URL}${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const getLeaveById = async (id) => {
  const token = localStorage.getItem('access_token');
  const res = await api.get(`${LEAVE_REQUEST_URL}${id}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};



