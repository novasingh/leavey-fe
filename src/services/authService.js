import api from './axios';

const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user'
};

class AuthService {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login/', {
        email,
        password
      });

      const { access, refresh, user } = response.data;

      // Store tokens and user info
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, access);
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refresh);
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));

      return { success: true, user, tokens: { access, refresh } };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.detail || 'Login failed'
      };
    }
  }

  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password/', {
        email
      });

      return { 
        success: true, 
        message: response.data?.message || 'Password reset link has been sent to your email'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 
               error.response?.data?.detail || 
               error.response?.data?.email?.[0] ||
               'Failed to send password reset email'
      };
    }
  }

  async resetPassword(token, password, confirmPassword) {
    try {
      const response = await api.post('/auth/reset-password/', {
        token,
        password,
        confirm_password: confirmPassword
      });

      return { 
        success: true, 
        message: response.data?.message || 'Password has been reset successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 
               error.response?.data?.detail ||
               error.response?.data?.password?.[0] ||
               error.response?.data?.token?.[0] ||
               'Failed to reset password'
      };
    }
  }

  logout() {
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
  }

  isAuthenticated() {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    const user = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    return !!(token && user);
  }

  getUser() {
    const userStr = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  getAccessToken() {
    return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  }
  getRefreshToken() {
    return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  }

  getUserPermissions() {
    const user = this.getUser();
    return user?.role_details?.permissions || [];
  }

  hasPermission(permission) {
    const permissions = this.getUserPermissions();
    return permissions.includes(permission);
  }
  getUserRole() {
    const user = this.getUser();
    return user?.role_details?.name || null;
  }
}

export default new AuthService();
