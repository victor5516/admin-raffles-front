import { fetchApi } from "./api";

export type DashboardMetric = {
  current: number;
  previous: number;
  changePercent: number;
  isPositive: boolean;
};

export type DashboardActiveRaffle = {
  uid: string;
  title: string;
  deadline: string;
  ticketsSold: number;
  percentageSold: number;
};

export type DashboardOverviewResponse = {
  metrics: {
    revenue: DashboardMetric;
    ticketsSold: DashboardMetric;
    activeRaffles: DashboardMetric;
    participants: DashboardMetric;
  };
  activeRaffles: DashboardActiveRaffle[];
};

export type TopCustomer = {
  uid: string;
  name: string;
  email: string;
  totalTickets: number;
};

export const dashboardService = {
  async getDashboardOverview(currencyId?: string) {
    const params = new URLSearchParams();
    if (currencyId) params.set("currencyId", currencyId);
    const query = params.toString();
    return fetchApi<DashboardOverviewResponse>(`/dashboard/overview${query ? `?${query}` : ""}`);
  },

  async getTopCustomers(raffleId: string) {
    return fetchApi<TopCustomer[]>(`/dashboard/top-customers/${raffleId}`);
  },
};

