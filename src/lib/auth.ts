/**
 * Authentication API utilities
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  error?: string;
}

/**
 * Login user with email and password
 */
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Login failed. Please check your credentials.',
      };
    }

    return {
      success: true,
      token: data.token,
      user: data.user,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
    };
  }
};

/**
 * Get stored auth token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Logout user
 */
export const logout = (): void => {
  localStorage.removeItem('authToken');
};

