import { fetchApi } from './api';
import { AdminRole } from './auth.service';

export interface AdminListItem {
  uid: string;
  email: string;
  full_name: string;
  role: AdminRole;
  createdAt: string;
}

export interface CreateAdminData {
  email: string;
  password: string;
  fullName: string;
  role: AdminRole;
}

export interface UpdateAdminData {
  email?: string;
  password?: string;
  fullName?: string;
  role?: AdminRole;
}

export const adminsService = {
  async getAll(): Promise<AdminListItem[]> {
    return fetchApi<AdminListItem[]>('/admins');
  },

  async getOne(uid: string): Promise<AdminListItem> {
    return fetchApi<AdminListItem>(`/admins/${uid}`);
  },

  async create(data: CreateAdminData): Promise<AdminListItem> {
    return fetchApi<AdminListItem>('/admins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(uid: string, data: UpdateAdminData): Promise<AdminListItem> {
    return fetchApi<AdminListItem>(`/admins/${uid}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(uid: string): Promise<void> {
    return fetchApi<void>(`/admins/${uid}`, {
      method: 'DELETE',
    });
  },
};
