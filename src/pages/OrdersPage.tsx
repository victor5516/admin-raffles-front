import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { currenciesService, type Currency } from "@/services/currencies.service";
import { rafflesService, type RaffleListItem } from "@/services/raffles.service";
import { purchasesService } from "@/services/purchases.service";

export function OrdersPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [raffles, setRaffles] = useState<RaffleListItem[]>([]);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(false);
  const [isLoadingRaffles, setIsLoadingRaffles] = useState(true);
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const raffleId = searchParams.get('raffleId');

  useEffect(() => {
    loadRaffles();
  }, []);

  useEffect(() => {
    if (raffleId) {
      loadCurrencies();
    }
  }, [raffleId]);

  useEffect(() => {
    if (raffleId && currencies.length > 0) {
      loadOrderCounts();
    } else {
      setOrderCounts({});
    }
  }, [raffleId, currencies]);

  const loadRaffles = async () => {
    try {
      setIsLoadingRaffles(true);
      const data = await rafflesService.listRaffles();
      setRaffles(data);
    } catch (error) {
      console.error("Failed to list raffles:", error);
    } finally {
      setIsLoadingRaffles(false);
    }
  };

  const loadCurrencies = async () => {
    try {
      setIsLoadingCurrencies(true);
      const data = await currenciesService.listCurrencies();
      setCurrencies(data);
    } catch (error) {
      console.error("Failed to list currencies:", error);
    } finally {
      setIsLoadingCurrencies(false);
    }
  };

  const loadOrderCounts = async () => {
    if (!raffleId) return;

    try {
      setIsLoadingCounts(true);
      const counts: Record<string, number> = {};

      // Fetch counts for each currency in parallel
      const countPromises = currencies.map(async (currency) => {
        try {
          const response = await purchasesService.listPurchases({
            raffleId,
            currency: currency.symbol,
            page: 1,
            limit: 1, // We only need the total, not the items
          });
          counts[currency.uid] = response.total;
        } catch (error) {
          console.error(`Failed to load order count for ${currency.symbol}:`, error);
          counts[currency.uid] = 0;
        }
      });

      await Promise.all(countPromises);
      setOrderCounts(counts);
    } catch (error) {
      console.error("Failed to load order counts:", error);
    } finally {
      setIsLoadingCounts(false);
    }
  };

  const handleRaffleClick = (raffleUid: string) => {
    setSearchParams({ raffleId: raffleUid });
  };

  const handleBackToRaffles = () => {
    setSearchParams({});
    setCurrencies([]);
    setOrderCounts({});
  };

  const getRaffleInitials = (title: string) => {
    return title
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const selectedRaffle = raffles.find(r => r.uid === raffleId);

  // Show currencies if a raffle is selected
  if (raffleId) {
    return (
      <>
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <button
              onClick={handleBackToRaffles}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span>Volver a rifas</span>
            </button>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Ordenes</h2>
            <p className="text-slate-400">
              {selectedRaffle
                ? `Selecciona una divisa para ver las transacciones de "${selectedRaffle.title}".`
                : "Selecciona una divisa para ver las transacciones."}
            </p>
          </div>
        </header>

        {isLoadingCurrencies ? (
          <div className="flex justify-center py-12">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currencies.map((currency) => (
              <Link
                key={currency.uid}
                to={`/ordenes/${currency.symbol}?raffleId=${raffleId}`}
                className="group relative overflow-hidden rounded-xl border border-border-subtle bg-card-dark p-6 hover:border-primary/50 transition-all hover:shadow-glow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl font-bold text-primary">{currency.symbol}</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">arrow_forward</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{currency.name}</h3>
                <p className="text-sm text-slate-400 mb-2">Ver ordenes en {currency.name}</p>

                {isLoadingCounts ? (
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                    <span className="text-xs">Cargando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary">
                      {orderCounts[currency.uid] ?? 0} {orderCounts[currency.uid] === 1 ? 'orden' : 'ordenes'}
                    </span>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}

            {currencies.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 bg-card-dark/50 rounded-xl border border-border-subtle border-dashed">
                No hay divisas configuradas en el sistema.
              </div>
            )}
          </div>
        )}
      </>
    );
  }

  // Show raffles first
  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Ordenes</h2>
          <p className="text-slate-400">Selecciona una rifa para ver las transacciones.</p>
        </div>
      </header>

      {isLoadingRaffles ? (
        <div className="flex justify-center py-12">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {raffles.map((raffle) => (
            <button
              key={raffle.uid}
              onClick={() => handleRaffleClick(raffle.uid)}
              className="group relative overflow-hidden rounded-xl border border-border-subtle bg-card-dark p-6 hover:border-primary/50 transition-all hover:shadow-glow text-left w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl font-bold text-primary">{getRaffleInitials(raffle.title)}</span>
                </div>
                <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">arrow_forward</span>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">{raffle.title}</h3>
              <p className="text-sm text-slate-400">Ver ordenes de {raffle.title}</p>

              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}

          {raffles.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-card-dark/50 rounded-xl border border-border-subtle border-dashed">
              No hay rifas configuradas en el sistema.
            </div>
          )}
        </div>
      )}
    </>
  );
}
