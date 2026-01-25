import { fetchApi } from './api';

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  VERIFIER = 'verifier',
}

export interface Admin {
  email: string;
  full_name: string;
  role: AdminRole;
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

  async logout(): Promise<void> {
    try {
      await fetchApi('/admins/logout', {
        method: 'POST',
        skipUnauthorizedRedirect: true,
      });
    } catch {
      // Continue with local logout even if server call fails
    } finally {
      localStorage.removeItem('raffleadmin_token');
      localStorage.removeItem('raffleadmin_user');
      window.location.href = '/login';
    }
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
