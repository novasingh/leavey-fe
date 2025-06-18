import api from './axios';

const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
};

class AuthService {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login/', {
        email,
        password,
      });

      const { access, refresh, user } = response.data;

      // Save tokens and user to localStorage
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, access);
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refresh);
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));

      return { success: true, user, tokens: { access, refresh } };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message ||
          'Login failed. Please try again.',
      };
    }
  }

  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password/', { email });

      return {
        success: true,
        message:
          response.data?.message ||
          'Password reset link has been sent to your email',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.detail ||
          error.response?.data?.email?.[0] ||
          'Failed to send password reset email',
      };
    }
  }

  async resetPassword(token, password, confirmPassword) {
    try {
      const response = await api.post('/auth/password-reset/confirm/', {
        token,
        password,
        confirm_password: confirmPassword,
      });

      return {
        success: true,
        message:
          response.data?.message || 'Password has been reset successfully',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.detail ||
          error.response?.data?.password?.[0] ||
          error.response?.data?.token?.[0] ||
          'Failed to reset password',
      };
    }
  }

  logout() {
    Object.values(AUTH_STORAGE_KEYS).forEach((key) =>
      localStorage.removeItem(key)
    );
  }

  isAuthenticated() {
  // Also check if tokens exist AND user is parsed properly
  const access = this.getAccessToken();
  const user = this.getUser();
  return !!access && !!user;
}

  getUser() {
    try {
      const userStr = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
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
    return this.getUser()?.role_details?.permissions || [];
  }

  hasPermission(permission) {
    return this.getUserPermissions().includes(permission);
  }

  getUserRole() {
    return this.getUser()?.role_details?.name || null;
  }

  // Optional: Refresh token method if using token expiry logic
  async refreshToken() {
    try {
      const refresh = this.getRefreshToken();
      if (!refresh) throw new Error('No refresh token available');

      const response = await api.post('/auth/token/refresh/', {
        refresh,
      });

      const { access } = response.data;
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, access);

      return { success: true, access };
    } catch (error) {
      this.logout(); // Optional: logout on refresh failure
      return {
        success: false,
        error:
          error.response?.data?.detail ||
          error.message ||
          'Failed to refresh session',
      };
    }
  }
}

export default new AuthService();