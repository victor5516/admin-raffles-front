import { fetchApi } from './api';
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
  ticketNumber?: number;
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
    if (params.ticketNumber !== undefined) query.append('ticketNumber', params.ticketNumber.toString());
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
};
