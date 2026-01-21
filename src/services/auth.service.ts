import { fetchApi } from './api';

export interface Admin {
  email: string;
  full_name: string;
}

export interface LoginResponse {
  admin: Admin;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetchApi<LoginResponse>('/admins/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      skipUnauthorizedRedirect: true,
    });

    if (response.token) {
      localStorage.setItem('raffleadmin_token', response.token);
      localStorage.setItem('raffleadmin_user', JSON.stringify(response.admin));
    }

    return response;
  },

  logout() {
    localStorage.removeItem('raffleadmin_token');
    localStorage.removeItem('raffleadmin_user');
    window.location.href = '/login';
  },

  getToken(): string | null {
    return localStorage.getItem('raffleadmin_token');
  },

  getUser(): Admin | null {
    const userStr = localStorage.getItem('raffleadmin_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};
