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

export const dashboardService = {
  async getDashboardOverview() {
    return fetchApi<DashboardOverviewResponse>("/dashboard/overview");
  },
};

