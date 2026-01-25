import { fetchApi } from './api';

export interface PaymentMethod {
  uid: string;
  name: string;
  accountHolderName?: string;
  imageUrl?: string;
  paymentData: Record<string, string | number>;
  minimumPaymentAmount: number;
  currency: string;
}

export interface CreatePaymentMethodDto {
  name: string;
  accountHolderName?: string;
  payment_data: Record<string, string | number>;
  minimum_payment_amount: number;
  currency_id: string;
  // image handled separately
}

export interface UpdatePaymentMethodDto extends Partial<CreatePaymentMethodDto> {}

export const paymentMethodsService = {
  async listPaymentMethods() {
    return fetchApi<PaymentMethod[]>('/payment-methods');
  },

  async getPaymentMethod(uid: string) {
    return fetchApi<PaymentMethod>(`/payment-methods/${uid}`);
  },

  async createPaymentMethod(data: CreatePaymentMethodDto, imageFile?: File) {
    const formData = new FormData();

    formData.append('name', data.name);
    if (data.accountHolderName) {
      formData.append('account_holder_name', data.accountHolderName);
    }
    // Backend expects payment_data as a stringified JSON if it's sent via FormData with file
    // Or it might handle it differently. Checking controller...
    // Controller: if (createDto.payment_data && typeof createDto.payment_data === 'string') JSON.parse...
    // So we should stringify it.
    formData.append('payment_data', JSON.stringify(data.payment_data));
    formData.append('minimum_payment_amount', data.minimum_payment_amount.toString());
    formData.append('currency_id', data.currency_id);

    if (imageFile) {
      formData.append('image', imageFile);
    }

    return fetchApi<PaymentMethod>('/payment-methods', {
      method: 'POST',
      body: formData,
    });
  },

  async updatePaymentMethod(uid: string, data: UpdatePaymentMethodDto, imageFile?: File) {
    const formData = new FormData();

    if (data.name) formData.append('name', data.name);
    if (data.accountHolderName) formData.append('account_holder_name', data.accountHolderName);
    if (data.payment_data) formData.append('payment_data', JSON.stringify(data.payment_data));
    if (data.minimum_payment_amount !== undefined) {
      formData.append('minimum_payment_amount', data.minimum_payment_amount.toString());
    }
    if (data.currency_id) formData.append('currency_id', data.currency_id);

    if (imageFile) {
      formData.append('image', imageFile);
    }

    return fetchApi<PaymentMethod>(`/payment-methods/${uid}`, {
      method: 'PUT',
      body: formData,
    });
  },

  async deletePaymentMethod(uid: string) {
    return fetchApi<void>(`/payment-methods/${uid}`, {
      method: 'DELETE',
    });
  }
};
