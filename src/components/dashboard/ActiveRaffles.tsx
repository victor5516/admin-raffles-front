import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { DashboardActiveRaffle } from "@/services/dashboard.service";

const avatarGradients = [
  "from-orange-400 to-red-500",
  "from-blue-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-purple-400 to-fuchsia-500",
  "from-cyan-400 to-blue-500",
  "from-slate-400 to-slate-600",
  "from-amber-400 to-yellow-500",
];

function getInitials(title: string) {
  const words = title
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "--";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ActiveRaffles({ items }: { items: DashboardActiveRaffle[] }) {
  return (
    <div className="lg:col-span-2 rounded-xl border border-border-subtle bg-card-dark flex flex-col shadow-inner-glow">
      <div className="flex items-center justify-between p-6 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">gavel</span>
          <h3 className="font-display text-lg font-bold text-white">Rifas activas</h3>
        </div>
        <Link
          className="text-xs font-semibold text-primary hover:text-primary-dark uppercase tracking-wider"
          to="/rifas"
        >
          Ver todas
        </Link>
      </div>
      <div className="p-0 overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-border-subtle/50">
              <th className="px-6 py-4 font-semibold">Nombre de la rifa</th>
              <th className="px-6 py-4 font-semibold">Fecha de finalización</th>
              <th className="px-6 py-4 font-semibold w-1/3">Progreso de ventas</th>
              <th className="px-6 py-4 font-semibold text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {items.map((raffle, index) => {
              const initials = getInitials(raffle.title);
              const initialsColor = avatarGradients[index % avatarGradients.length];
              const percent = Math.max(0, Math.min(100, Math.round(raffle.percentageSold ?? 0)));

              return (
              <tr key={raffle.uid} className="group hover:bg-white/[0.02] border-b border-border-subtle/30 transition-colors last:border-0">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`size-8 rounded bg-gradient-to-tr ${initialsColor} flex items-center justify-center text-white font-bold text-xs`}>
                      {initials}
                    </div>
                    <span className="font-medium text-slate-200">{raffle.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-400">{formatDate(raffle.deadline)}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">
                        {raffle.ticketsSold} {raffle.ticketsSold === 1 ? "vendido" : "vendidos"}
                      </span>
                      <span className={percent > 0 ? "text-primary font-bold" : "text-slate-500 font-bold"}>{percent}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-700/50 overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-auto py-1.5 px-3 text-xs border-border-subtle text-slate-400 hover:text-white hover:border-slate-500 bg-transparent hover:bg-transparent"
                  >
                    <Link to={`/ordenes?raffleId=${raffle.uid}`}>Ver compras</Link>
                  </Button>
                </td>
              </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  No hay rifas activas por el momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
