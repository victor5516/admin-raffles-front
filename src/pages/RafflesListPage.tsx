import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { rafflesService, RaffleStatus } from "@/services/raffles.service";
import type { RaffleListItem } from "@/services/raffles.service";

export function RafflesListPage() {
  const [activeTab, setActiveTab] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [raffles, setRaffles] = useState<RaffleListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadRaffles();
  }, []);

  // Reset page when filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const loadRaffles = async () => {
    try {
      setIsLoading(true);
      const data = await rafflesService.listRaffles();
      setRaffles(data);
    } catch (error) {
      console.error("Failed to list raffles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (uid: string, newStatus: RaffleStatus) => {
    if (!confirm("¿Estás seguro de querer cambiar el estado de esta rifa?")) return;
    try {
        await rafflesService.updateRaffle(uid, { status: newStatus });
        loadRaffles(); // Reload list to reflect changes
    } catch (error) {
        console.error("Failed to update raffle:", error);
        alert("Error al actualizar la rifa");
    }
  };

  const filteredRaffles = raffles.filter((raffle) => {
    const matchesTab = activeTab === "Todas" ||
                       (activeTab === "Activas" && raffle.status === RaffleStatus.ACTIVE) ||
                       (activeTab === "Borradores" && raffle.status === RaffleStatus.DRAFT) ||
                       (activeTab === "Finalizadas" && raffle.status === RaffleStatus.CLOSED);

    const matchesSearch = raffle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          raffle.uid.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredRaffles.length / itemsPerPage);
  const paginatedRaffles = filteredRaffles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const tabs = ["Todas", "Activas", "Borradores", "Finalizadas"];

  const getInitials = (title: string) => {
    return title
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Rifas</h2>
          <p className="text-slate-400">Gestiona y monitorea todos tus sorteos activos y finalizados.</p>
        </div>
        <div className="flex gap-3">
            <Link to="/rifas/crear">
                <Button className="gap-2 h-10 px-5 rounded-lg bg-primary hover:bg-primary-dark text-white shadow-glow transition-all text-sm font-medium border-0">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Crear Nueva Rifa
                </Button>
            </Link>
        </div>
      </header>

      {/* Controls & Table */}
      <div className="flex flex-col gap-6">

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card-dark border border-border-subtle p-1 rounded-xl">
            <div className="flex p-1 bg-background-dark/50 rounded-lg w-full md:w-auto overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap",
                            activeTab === tab
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="relative w-full md:w-80 mr-2">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">search</span>
                <input
                    type="text"
                    placeholder="Buscar por título o ID..."
                    className="w-full h-10 pl-10 pr-4 rounded-lg bg-background-dark border border-border-subtle text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary/50 text-sm transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border-subtle bg-card-dark shadow-inner-glow overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-border-subtle/50 bg-white/[0.02]">
                            <th className="px-6 py-4 font-semibold w-[300px]">Producto / Título</th>
                            <th className="px-6 py-4 font-semibold">Precio Ticket</th>
                            <th className="px-6 py-4 font-semibold w-[250px]">Progreso</th>
                            <th className="px-6 py-4 font-semibold">Estado</th>
                            <th className="px-6 py-4 font-semibold">Fecha Límite</th>
                            <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {isLoading ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                              Cargando rifas...
                            </td>
                          </tr>
                        ) : paginatedRaffles.map((raffle) => {
                            // Using real data from backend
                            const percent = Math.round(raffle.percentage_sold || 0);

                            return (
                                <tr key={raffle.uid} className="group hover:bg-white/[0.02] border-b border-border-subtle/30 transition-colors last:border-0">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {raffle.imageUrl ? (
                                                <div className="size-12 rounded-lg bg-slate-800 bg-cover bg-center border border-border-subtle shrink-0" style={{ backgroundImage: `url('${raffle.imageUrl}')` }}></div>
                                            ) : (
                                                <div className={`size-12 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white font-bold text-sm border border-white/10 shrink-0`}>
                                                    {getInitials(raffle.title)}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <h4 className="font-medium text-slate-200 truncate max-w-[200px]">{raffle.title}</h4>
                                                <p className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-[200px]">ID: {raffle.uid}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-white">${Number(raffle.ticketPrice).toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className="text-slate-400">
                                                    <span className="text-slate-200">{raffle.tickets_sold}</span> / {raffle.totalTickets}
                                                </span>
                                                <span className={percent > 0 ? "text-primary" : "text-slate-500"}>{percent}%</span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-slate-700/50 overflow-hidden">
                                                <div className={cn("h-full rounded-full transition-all duration-500", percent >= 100 ? "bg-emerald-500" : "bg-primary")} style={{ width: `${percent}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={raffle.status} />
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        {formatDate(raffle.deadline)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Orders Button */}
                                            <Link to={`/ordenes?raffleId=${raffle.uid}`} className="text-slate-400 hover:text-blue-400 p-2 rounded-full hover:bg-blue-500/10 transition-colors" title="Ver Ordenes">
                                                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                                            </Link>

                                            {/* Edit Button */}
                                            <Link to={`/rifas/editar/${raffle.uid}`} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors" title="Editar">
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </Link>

                                            {/* Finalize/Close Button (only if active) */}
                                            {raffle.status === RaffleStatus.ACTIVE && (
                                                <button
                                                    onClick={() => handleStatusUpdate(raffle.uid, RaffleStatus.CLOSED)}
                                                    className="text-slate-400 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors"
                                                    title="Finalizar Rifa"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">lock</span>
                                                </button>
                                            )}

                                            {/* Reactivate Button (only if closed) */}
                                            {raffle.status === RaffleStatus.CLOSED && (
                                                <button
                                                    onClick={() => handleStatusUpdate(raffle.uid, RaffleStatus.ACTIVE)}
                                                    className="text-slate-400 hover:text-emerald-400 p-2 rounded-full hover:bg-emerald-500/10 transition-colors"
                                                    title="Reactivar Rifa"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">lock_open</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {!isLoading && filteredRaffles.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    No se encontraron rifas que coincidan con los filtros.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer / Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border-subtle/50 bg-white/[0.01]">
                <p className="text-xs text-slate-500">
                    Mostrando <span className="font-medium text-slate-300">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredRaffles.length)}</span> a <span className="font-medium text-slate-300">{Math.min(currentPage * itemsPerPage, filteredRaffles.length)}</span> de <span className="font-medium text-slate-300">{filteredRaffles.length}</span> resultados
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="size-8 flex items-center justify-center rounded-lg border border-border-subtle bg-transparent text-slate-400 hover:text-white hover:bg-white/5 hover:border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Simple logic for showing pages around current page could be added here,
                        // for now showing first 5 or totalPages if less
                        const pageNum = i + 1;
                        return (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={cn(
                                    "size-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all",
                                    currentPage === pageNum
                                        ? "bg-primary text-white shadow-glow"
                                        : "border border-border-subtle bg-transparent text-slate-400 hover:text-white hover:bg-white/5 hover:border-slate-600"
                                )}
                            >
                                {pageNum}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="size-8 flex items-center justify-center rounded-lg border border-border-subtle bg-transparent text-slate-400 hover:text-white hover:bg-white/5 hover:border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: RaffleStatus }) {
    let styles = "bg-slate-500/10 text-slate-400 border-slate-500/20";
    let icon = "circle";
    let label = status;

    if (status === RaffleStatus.ACTIVE) {
        styles = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        icon = "check_circle";
        label = "Activa" as any;
    } else if (status === RaffleStatus.DRAFT) {
        styles = "bg-slate-500/10 text-slate-400 border-slate-500/20";
        icon = "edit_document";
        label = "Borrador" as any;
    } else if (status === RaffleStatus.CLOSED) {
        styles = "bg-red-500/10 text-red-400 border-red-500/20";
        icon = "lock";
        label = "Finalizada" as any;
    }

    return (
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize", styles)}>
            <span className="material-symbols-outlined text-[12px]">{icon}</span>
            {label}
        </span>
    );
}
