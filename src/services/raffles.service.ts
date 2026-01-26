import { fetchApi } from './api';

export enum RaffleStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
}

export interface CreateRaffleDto {
  title: string;
  description?: string;
  digits_length?: number;
  ticket_price: number;
  total_tickets: number;
  deadline: string;
  min_tickets_per_purchase?: number;
  status?: RaffleStatus;
  // image handled separately
}

export interface UpdateRaffleDto extends Partial<Omit<CreateRaffleDto, 'image_url'>> {
  // mapped types usually handle optionality, but explicit here for clarity
}

export interface RaffleListItem {
  uid: string;
  title: string;
  description: string;
  digitsLength: number;
  ticketPrice: number;
  totalTickets: number;
  minTicketsPerPurchase?: number;
  imageUrl: string;
  deadline: string;
  status: RaffleStatus;
  createdAt: string;
  // Efficient fields
  tickets_sold: number;
  percentage_sold: number;
}

export const rafflesService = {
  async getRaffle(uid: string) {
    return fetchApi<RaffleListItem>(`/raffles/${uid}`);
  },

  async createRaffle(data: CreateRaffleDto, imageFile?: File) {
    const formData = new FormData();

    // Append all DTO fields
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.digits_length) formData.append('digits_length', data.digits_length.toString());
    formData.append('ticket_price', data.ticket_price.toString());
    formData.append('total_tickets', data.total_tickets.toString());
    formData.append('deadline', data.deadline);
    if (data.min_tickets_per_purchase !== undefined) formData.append('min_tickets_per_purchase', data.min_tickets_per_purchase.toString());
    if (data.status) formData.append('status', data.status);

    // Append image if present
    if (imageFile) {
      formData.append('image', imageFile);
    }

    return fetchApi<RaffleListItem>('/raffles', {
      method: 'POST',
      body: formData,
    });
  },

  async listRaffles() {
    return fetchApi<RaffleListItem[]>('/raffles');
  },

  async updateRaffle(uid: string, data: UpdateRaffleDto, imageFile?: File) {
    const formData = new FormData();

    if (data.title) formData.append('title', data.title);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.digits_length) formData.append('digits_length', data.digits_length.toString());
    if (data.ticket_price) formData.append('ticket_price', data.ticket_price.toString());
    if (data.total_tickets) formData.append('total_tickets', data.total_tickets.toString());
    if (data.deadline) formData.append('deadline', data.deadline);
    if (data.min_tickets_per_purchase !== undefined) formData.append('min_tickets_per_purchase', data.min_tickets_per_purchase.toString());
    if (data.status) formData.append('status', data.status);

    if (imageFile) {
      formData.append('image', imageFile);
    }

    return fetchApi<RaffleListItem>(`/raffles/${uid}`, {
      method: 'PUT',
      body: formData,
    });
  }
};
