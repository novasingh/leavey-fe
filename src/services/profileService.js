import api from './axios';

const PROFILE_URL = '/profile/';

export const getProfile = async () => {
    const res = await api.get(PROFILE_URL);
    return res.data;
};

export const updateProfile = async (profileData) => {
    const res = await api.put(PROFILE_URL, profileData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    if (res.data) {
        try {
            const existingUser = JSON.parse(localStorage.getItem('user')) || {};
            const updatedUser = { ...existingUser, ...res.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.dispatchEvent(new CustomEvent('profileUpdated'));
        } catch (error) {
            console.error("Failed to update user in localStorage", error);
        }
    }

    return res.data;
};

