import { fetchApi, API_URL } from './api';
import { type RaffleListItem } from './raffles.service';

export enum PurchaseStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  MANUAL_REVIEW = 'manual_review',
}

export interface Purchase {
  uid: string;
  raffleId: string;
  raffle?: RaffleListItem;
  customerId: string;
  customer: {
    uid: string;
    fullName: string;
    email: string;
    phone: string;
    nationalId: string;
  };
  paymentMethodId: string;
  paymentMethod?: {
    uid: string;
    name: string;
    accountHolderName?: string;
    currency:
    | string
    | {
        uid: string;
        name: string;
        symbol: string;
        value: string;
        createdAt: string;
      };
    imageUrl?: string;
  };
  ticketQuantity: number;
  paymentScreenshotUrl: string;
  bankReference: string;
  notes?: string;
  status: PurchaseStatus;
  totalAmount: number;
  aiAnalysisResult?: any;
  submittedAt: string;
  verifiedAt?: string;
  tickets?: { ticketNumber: number }[];
  ticketNumbers?: number[];
}

export interface ListPurchasesParams {
  raffleId?: string;
  currency?: string;
  status?: PurchaseStatus;
  nationalId?: string;
  paymentMethodId?: string;
  ticketNumber?: number;
  customerName?: string;
  email?: string;
  phone?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ListPurchasesResponse {
  items: Purchase[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const purchasesService = {
  async listPurchases(params: ListPurchasesParams = {}) {
    const query = new URLSearchParams();
    if (params.raffleId) query.append('raffleId', params.raffleId);
    if (params.currency) query.append('currency', params.currency);
    if (params.status) query.append('status', params.status);
    if (params.nationalId) query.append('nationalId', params.nationalId);
    if (params.paymentMethodId) query.append('paymentMethodId', params.paymentMethodId);
    if (params.ticketNumber !== undefined) query.append('ticketNumber', params.ticketNumber.toString());
    if (params.customerName) query.append('customerName', params.customerName);
    if (params.email) query.append('email', params.email);
    if (params.phone) query.append('phone', params.phone);
    if (params.dateFrom) query.append('dateFrom', params.dateFrom);
    if (params.dateTo) query.append('dateTo', params.dateTo);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    return fetchApi<ListPurchasesResponse>(`/purchases?${query.toString()}`);
  },

  async getPurchase(uid: string) {
    return fetchApi<Purchase>(`/purchases/${uid}`);
  },

  async updatePurchaseStatus(uid: string, status: PurchaseStatus) {
    return fetchApi<Purchase>(`/purchases/${uid}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async updatePurchase(uid: string, data: Partial<Purchase>) {
    return fetchApi<Purchase>(`/purchases/${uid}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async exportPurchases(params: Omit<ListPurchasesParams, 'page' | 'limit'>) {
    const token = localStorage.getItem('raffleadmin_token');

    const response = await fetch(`${API_URL}/purchases/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        raffleId: params.raffleId,
        currency: params.currency,
        status: params.status,
        nationalId: params.nationalId,
        paymentMethodId: params.paymentMethodId,
        ticketNumber: params.ticketNumber,
        customerName: params.customerName,
        email: params.email,
        phone: params.phone,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
      }),
    });

    if (response.status === 401) {
      localStorage.removeItem('raffleadmin_token');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al exportar');
    }

    // Get the blob and trigger download
    const blob = await response.blob();
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `ordenes-${params.currency || 'todas'}-${new Date().toISOString().slice(0, 10)}.xlsx`;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match) {
        filename = match[1];
      }
    }

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
