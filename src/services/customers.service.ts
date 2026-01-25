import { fetchApi } from './api';

export interface Customer {
  uid: string;
  nationalId: string;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

export interface CustomerListItem extends Customer {}

export interface CustomerDetail extends Customer {
  raffles: Array<{
    raffle: {
      uid: string;
      title: string;
      description: string | null;
      ticketPrice: number;
      totalTickets: number;
      deadline: string;
      status: string;
      imageUrl: string | null;
      createdAt: string;
    };
    tickets: Array<{
      uid: string;
      ticketNumber: number;
      assignedAt: string;
      purchaseId: string;
    }>;
    purchaseCount: number;
  }>;
}

export interface FilterCustomersParams {
  nationalId?: string;
  phone?: string;
  fullName?: string;
  page?: number;
  limit?: number;
}

export interface CustomersListResponse {
  data: CustomerListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateCustomerDto {
  fullName?: string;
  email?: string;
  phone?: string;
}

export const customersService = {
  async listCustomers(params?: FilterCustomersParams) {
    const queryParams = new URLSearchParams();
    if (params?.nationalId) queryParams.append('nationalId', params.nationalId);
    if (params?.phone) queryParams.append('phone', params.phone);
    if (params?.fullName) queryParams.append('fullName', params.fullName);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/customers${queryString ? `?${queryString}` : ''}`;

    return fetchApi<CustomersListResponse>(endpoint);
  },

  async getCustomer(uid: string) {
    return fetchApi<CustomerDetail>(`/customers/${uid}`);
  },

  async updateCustomer(uid: string, data: UpdateCustomerDto) {
    return fetchApi<Customer>(`/customers/${uid}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
