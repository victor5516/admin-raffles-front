import { useState, useEffect } from 'react';
import { dashboardService, type TopCustomer } from '@/services/dashboard.service';
import { rafflesService, type RaffleListItem } from '@/services/raffles.service';

export function RecentActivity() {
  const [raffles, setRaffles] = useState<RaffleListItem[]>([]);
  const [selectedRaffleId, setSelectedRaffleId] = useState<string>('');
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRaffles();
  }, []);

  useEffect(() => {
    if (selectedRaffleId) {
      loadTopCustomers(selectedRaffleId);
    }
  }, [selectedRaffleId]);

  const loadRaffles = async () => {
    try {
      const data = await rafflesService.listRaffles();
      setRaffles(data);
      if (data.length > 0) {
        setSelectedRaffleId(data[0].uid);
      }
    } catch (error) {
      console.error('Error loading raffles:', error);
    }
  };

  const loadTopCustomers = async (raffleId: string) => {
    setIsLoading(true);
    try {
      const data = await dashboardService.getTopCustomers(raffleId);
      setTopCustomers(data);
    } catch (error) {
      console.error('Error loading top customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0: // Gold
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/50',
          text: 'text-yellow-500',
          icon: 'trophy',
        };
      case 1: // Silver
        return {
          bg: 'bg-slate-300/10',
          border: 'border-slate-300/50',
          text: 'text-slate-300',
          icon: 'military_tech',
        };
      case 2: // Bronze
        return {
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/50',
          text: 'text-orange-500',
          icon: 'military_tech',
        };
      default:
        return {
          bg: 'bg-card-dark',
          border: 'border-border-subtle',
          text: 'text-slate-400',
          icon: 'person',
        };
    }
  };

  return (
    <div className="rounded-xl border border-border-subtle bg-card-dark flex flex-col flex-1 shadow-inner-glow h-full overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-border-subtle">
        <h3 className="font-display text-lg font-bold text-white">Top Compradores</h3>
        <select
          value={selectedRaffleId}
          onChange={(e) => setSelectedRaffleId(e.target.value)}
          className="bg-card-dark border border-border-subtle rounded-lg text-sm text-slate-300 px-3 py-1.5 focus:outline-none focus:border-brand-primary max-w-[200px]"
        >
          {raffles.map((raffle) => (
            <option key={raffle.uid} value={raffle.uid}>
              {raffle.title}
            </option>
          ))}
        </select>
      </div>
      <div className="p-6 flex flex-col gap-4 overflow-y-auto flex-1 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <span className="material-symbols-outlined animate-spin text-slate-500">progress_activity</span>
          </div>
        ) : topCustomers.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No hay datos disponibles para esta rifa</p>
          </div>
        ) : (
          topCustomers.map((customer, index) => {
            const style = getRankStyle(index);
            return (
              <div key={customer.uid} className={`flex items-center gap-4 p-3 rounded-lg border ${style.border} ${style.bg} transition-all hover:bg-opacity-20`}>
                <div className={`size-8 rounded-full flex items-center justify-center ${style.text} bg-black/20 flex-shrink-0`}>
                  <span className="material-symbols-outlined text-[20px]">{style.icon}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{customer.name}</p>
                  <p className="text-xs text-slate-400 truncate">{customer.email}</p>
                </div>

                <div className="flex flex-col items-end flex-shrink-0">
                  <span className={`font-mono font-bold ${index < 3 ? style.text : 'text-white'}`}>
                    {customer.totalTickets}
                  </span>
                  <span className="text-xs text-slate-500">tickets</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
