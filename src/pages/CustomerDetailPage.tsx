import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { customersService, type CustomerDetail } from "@/services/customers.service";

export function CustomerDetailPage() {
  const { uid } = useParams<{ uid: string }>();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (uid) {
      loadCustomer();
    }
  }, [uid]);

  const loadCustomer = async () => {
    if (!uid) return;
    try {
      setIsLoading(true);
      const data = await customersService.getCustomer(uid);
      setCustomer(data);
    } catch (error) {
      console.error("Failed to load customer:", error);
      alert("Error al cargar los datos del cliente");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Cargando datos del cliente...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Cliente no encontrado</div>
      </div>
    );
  }

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              to="/clientes"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
              Detalles del Cliente
            </h2>
          </div>
          <p className="text-slate-400">Información completa y historial de participaciones.</p>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {/* Customer Info Card */}
        <div className="rounded-xl border border-border-subtle bg-card-dark shadow-inner-glow p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Información del Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Cédula</label>
              <p className="text-slate-200 font-mono">{customer.nationalId}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Nombre Completo</label>
              <p className="text-slate-200 font-medium">{customer.fullName}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Email</label>
              <p className="text-slate-200">{customer.email}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Teléfono</label>
              <p className="text-slate-200">{customer.phone || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Fecha de Registro</label>
              <p className="text-slate-200">{formatDate(customer.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Raffles Section */}
        <div className="rounded-xl border border-border-subtle bg-card-dark shadow-inner-glow overflow-hidden">
          <div className="p-6 border-b border-border-subtle/50">
            <h3 className="text-lg font-semibold text-white">
              Rifas Participadas ({customer.raffles.length})
            </h3>
          </div>

          {customer.raffles.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <span className="material-symbols-outlined text-4xl mb-2 block">confirmation_number</span>
              <p>Este cliente no ha participado en ninguna rifa aún.</p>
            </div>
          ) : (
            <div className="divide-y divide-border-subtle/30">
              {customer.raffles.map((raffleData) => {
                const { raffle, tickets, purchaseCount } = raffleData;
                return (
                  <div key={raffle.uid} className="p-6 hover:bg-white/[0.02] transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start gap-4 mb-4">
                      {/* Raffle Image/Icon */}
                      {raffle.imageUrl ? (
                        <div
                          className="size-20 rounded-lg bg-slate-800 bg-cover bg-center border border-border-subtle shrink-0"
                          style={{ backgroundImage: `url('${raffle.imageUrl}')` }}
                        />
                      ) : (
                        <div className="size-20 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white font-bold text-lg border border-white/10 shrink-0">
                          <span className="material-symbols-outlined text-3xl">confirmation_number</span>
                        </div>
                      )}

                      {/* Raffle Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h4 className="text-lg font-semibold text-white mb-1">{raffle.title}</h4>
                            {raffle.description && (
                              <p className="text-sm text-slate-400 line-clamp-2">{raffle.description}</p>
                            )}
                          </div>
                          {/* <Link
                            to={`/rifas/editar/${raffle.uid}`}
                            className="text-slate-400 hover:text-primary transition-colors shrink-0"
                            title="Ver rifa"
                          >
                            <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                          </Link> */}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Precio Ticket</label>
                            <p className="text-slate-200 font-medium">{formatCurrency(raffle.ticketPrice)}</p>
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Total Tickets</label>
                            <p className="text-slate-200">{raffle.totalTickets}</p>
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Compras</label>
                            <p className="text-slate-200">{purchaseCount}</p>
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Estado</label>
                            <StatusBadge status={raffle.status} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tickets Section */}
                    {tickets.length > 0 ? (
                      <div className="mt-4 pt-4 border-t border-border-subtle/30">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-semibold text-slate-300">
                            Tickets ({tickets.length})
                          </h5>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tickets.map((ticket) => (
                            <div
                              key={ticket.uid}
                              className="px-3 py-1.5 rounded-lg bg-background-dark border border-border-subtle flex items-center gap-2"
                            >
                              <span className="text-xs font-mono text-slate-400">#{ticket.ticketNumber.toString().padStart(raffle.totalTickets.toString().length, '0')}</span>
                              <span className="text-xs text-slate-500">
                                {formatDate(ticket.assignedAt)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 pt-4 border-t border-border-subtle/30">
                        <p className="text-sm text-slate-500">No hay tickets asignados aún.</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  let styles = "bg-slate-500/10 text-slate-400 border-slate-500/20";
  let icon = "circle";
  let label = status;

  if (status === "active") {
    styles = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    icon = "check_circle";
    label = "Activa";
  } else if (status === "draft") {
    styles = "bg-slate-500/10 text-slate-400 border-slate-500/20";
    icon = "edit_document";
    label = "Borrador";
  } else if (status === "closed") {
    styles = "bg-red-500/10 text-red-400 border-red-500/20";
    icon = "lock";
    label = "Finalizada";
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize", styles)}>
      <span className="material-symbols-outlined text-[12px]">{icon}</span>
      {label}
    </span>
  );
}
