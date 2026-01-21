import { fetchApi } from './api';

export interface Currency {
  uid: string;
  name: string;
  symbol: string;
  value: number;
  createdAt: string;
}

export interface CreateCurrencyDto {
  name: string;
  symbol: string;
  value: number;
}

export interface UpdateCurrencyDto extends Partial<CreateCurrencyDto> {}

export const currenciesService = {
  async listCurrencies() {
    return fetchApi<Currency[]>('/currencies');
  },

  async getCurrency(uid: string) {
    return fetchApi<Currency>(`/currencies/${uid}`);
  },

  async createCurrency(data: CreateCurrencyDto) {
    return fetchApi<Currency>('/currencies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCurrency(uid: string, data: UpdateCurrencyDto) {
    return fetchApi<Currency>(`/currencies/${uid}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteCurrency(uid: string) {
    return fetchApi<void>(`/currencies/${uid}`, {
      method: 'DELETE',
    });
  },
};
