import { MetricCard } from "@/components/dashboard/MetricCard";
import { ActiveRaffles } from "@/components/dashboard/ActiveRaffles";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback } from "react";
import { dashboardService, type DashboardOverviewResponse } from "@/services/dashboard.service";
import { currenciesService, type Currency } from "@/services/currencies.service";

export function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<string | null>(null);
  const [currenciesLoaded, setCurrenciesLoaded] = useState(false);

  // Load currencies on mount
  useEffect(() => {
    let isMounted = true;

    async function loadCurrencies() {
      try {
        const data = await currenciesService.listCurrencies();
        if (!isMounted) return;
        setCurrencies(data);

        // Default to USD (symbol === "USD"), fallback to first currency
        const usdCurrency = data.find((c) => c.symbol === "USD");
        const defaultCurrency = usdCurrency ?? data[0];
        if (defaultCurrency) {
          setSelectedCurrencyId(defaultCurrency.uid);
        }
        setCurrenciesLoaded(true);
      } catch (e) {
        console.error("Failed to load currencies:", e);
        if (!isMounted) return;
        setCurrenciesLoaded(true); // Allow dashboard to load even if currencies fail
      }
    }

    loadCurrencies();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load dashboard when selectedCurrencyId changes (and currencies are loaded)
  const loadDashboard = useCallback(async (currencyId: string | null) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardOverview(currencyId ?? undefined);
      setOverview(data);
    } catch (e) {
      console.error("Failed to load dashboard overview:", e);
      setError(e instanceof Error ? e.message : "Error al cargar el dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currenciesLoaded) return;
    loadDashboard(selectedCurrencyId);
  }, [selectedCurrencyId, currenciesLoaded, loadDashboard]);

  const formatPercent = (value: number) => {
    const rounded = Math.round(Number.isFinite(value) ? value : 0);
    if (rounded === 0) return "0%";
    return `${rounded > 0 ? "+" : ""}${rounded}%`;
  };

  const formatCount = useMemo(() => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }), []);

  const selectedCurrency = useMemo(
    () => currencies.find((c) => c.uid === selectedCurrencyId),
    [currencies, selectedCurrencyId],
  );

  const formatRevenue = useCallback(
    (value: number) => {
      const formatted = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
      const symbol = selectedCurrency?.symbol ?? "$";
      return `${symbol} ${formatted}`;
    },
    [selectedCurrency],
  );

  const metrics = overview?.metrics;

  if (isLoading && !overview) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Resumen del panel</h2>
          <p className="text-slate-400">Bienvenido de nuevo, esto es lo que ocurre hoy.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 h-10 px-5 rounded-lg border-border-subtle bg-card-dark text-slate-300 hover:text-white hover:border-slate-600 transition-colors text-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Exportar datos
          </Button>
          <Link to="/rifas/crear">
            <Button className="gap-2 h-10 px-5 rounded-lg bg-primary hover:bg-primary-dark text-white shadow-glow transition-all text-sm font-medium border-0">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Crear rifa
            </Button>
          </Link>
        </div>
      </header>

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Ingresos totales"
          value={formatRevenue(metrics?.revenue.current ?? 0)}
          change={formatPercent(metrics?.revenue.changePercent ?? 0)}
          isPositive={metrics?.revenue.isPositive}
          icon="payments"
          iconColor="text-accent-gold"
          iconBg="bg-accent-gold/10"
          decoration={
            <div className="absolute -right-4 top-8 w-24 h-16 opacity-10">
              <svg className="stroke-accent-gold fill-none stroke-2" viewBox="0 0 100 50">
                <path d="M0,50 Q25,40 50,20 T100,5"></path>
              </svg>
            </div>
          }
          footer={
            <select
              value={selectedCurrencyId ?? ""}
              onChange={(e) => setSelectedCurrencyId(e.target.value || null)}
              className="w-full h-8 rounded-md border border-border-subtle bg-background-dark px-2 py-1 text-xs ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors text-slate-200"
            >
              {currencies.map((currency) => (
                <option key={currency.uid} value={currency.uid}>
                  {currency.symbol} - {currency.name}
                </option>
              ))}
            </select>
          }
        />
        <MetricCard
          title="Boletos vendidos"
          value={formatCount.format(metrics?.ticketsSold.current ?? 0)}
          change={formatPercent(metrics?.ticketsSold.changePercent ?? 0)}
          isPositive={metrics?.ticketsSold.isPositive}
          icon="local_activity"
          iconColor="text-primary"
          iconBg="bg-primary/10"
        />
        <MetricCard
          title="Rifas activas"
          value={formatCount.format(metrics?.activeRaffles.current ?? 0)}
          change={formatPercent(metrics?.activeRaffles.changePercent ?? 0)}
          isPositive={metrics?.activeRaffles.isPositive}
          icon="play_circle"
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10"
        />
        <MetricCard
          title="Participantes totales"
          value={formatCount.format(metrics?.participants.current ?? 0)}
          change={formatPercent(metrics?.participants.changePercent ?? 0)}
          isPositive={metrics?.participants.isPositive}
          icon="group"
          iconColor="text-purple-400"
          iconBg="bg-purple-500/10"
        />
      </div>

      {/* Bento Grid for Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Raffles Section (Span 2) */}
        <ActiveRaffles items={overview?.activeRaffles ?? []} />

        {/* Right Column: Recent Activity & Winner Widget */}
        <div className="flex flex-col gap-6">
          <RecentActivity />
        </div>
      </div>
    </>
  );
}
