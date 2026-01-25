import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { purchasesService, type Purchase, PurchaseStatus } from "@/services/purchases.service";
import { paymentMethodsService, type PaymentMethod } from "@/services/payment-methods.service";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function OrdersTablePage() {
  const { currency } = useParams();
  const [searchParams] = useSearchParams();
  const raffleId = searchParams.get('raffleId');

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Payment methods for filter
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<PurchaseStatus | "">("");
  const [nationalIdFilter, setNationalIdFilter] = useState("");
  const [ticketNumberFilter, setTicketNumberFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [customerNameFilter, setCustomerNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(total / itemsPerPage);

  // Modals state
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [viewAi, setViewAi] = useState<any | null>(null);
  const [viewTickets, setViewTickets] = useState<{ tickets: number[], customerName: string } | null>(null);

  // Inline Editing State (Notes)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const editInputRef = useRef<HTMLInputElement>(null);

  // Track if initial load has completed
  const isInitialLoadRef = useRef(true);

  // Load payment methods filtered by currency
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const allMethods = await paymentMethodsService.listPaymentMethods();
        // Filter by current currency
        const filtered = currency
          ? allMethods.filter((pm) => pm.currency === currency)
          : allMethods;
        setPaymentMethods(filtered);
      } catch (error) {
        console.error("Failed to load payment methods:", error);
      }
    };
    loadPaymentMethods();
  }, [currency]);

  const getCurrencyLabel = (paymentMethod?: Purchase["paymentMethod"]) => {
    if (!paymentMethod?.currency) return "-";
    return typeof paymentMethod.currency === "string"
      ? paymentMethod.currency
      : paymentMethod.currency.symbol;
  };

  const loadPurchases = useCallback(async (silent = false) => {
    try {
      // Only show loading spinner on initial load or explicit reloads (not polling)
      if (!silent) {
        setIsLoading(true);
      }
      const data = await purchasesService.listPurchases({
        currency,
        raffleId: raffleId || undefined,
        status: statusFilter || undefined,
        nationalId: nationalIdFilter || undefined,
        paymentMethodId: paymentMethodFilter || undefined,
        ticketNumber: ticketNumberFilter ? Number(ticketNumberFilter) : undefined,
        customerName: customerNameFilter || undefined,
        email: emailFilter || undefined,
        phone: phoneFilter || undefined,
        dateFrom: dateFromFilter || undefined,
        dateTo: dateToFilter || undefined,
        page: currentPage,
        limit: itemsPerPage
      });
      setPurchases(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to list purchases:", error);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
      isInitialLoadRef.current = false;
    }
  }, [currency, raffleId, currentPage, statusFilter, nationalIdFilter, paymentMethodFilter, ticketNumberFilter, customerNameFilter, emailFilter, phoneFilter, dateFromFilter, dateToFilter]);

  // Initial load and when filters/pagination change
  useEffect(() => {
    loadPurchases(false);
  }, [loadPurchases]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  // Polling every 5 seconds (silent refresh - no loading flicker)
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadPurchases(true);
    }, 100000);

    return () => clearInterval(intervalId);
  }, [loadPurchases]);

  const handleStatusUpdate = async (uid: string, newStatus: PurchaseStatus) => {
    if (!confirm(`¿Estás seguro de cambiar el estado a ${newStatus}?`)) return;
    try {
      await purchasesService.updatePurchaseStatus(uid, newStatus);
      loadPurchases();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Error al actualizar el estado");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await purchasesService.exportPurchases({
        currency,
        raffleId: raffleId || undefined,
        status: statusFilter || undefined,
        nationalId: nationalIdFilter || undefined,
        paymentMethodId: paymentMethodFilter || undefined,
        ticketNumber: ticketNumberFilter ? Number(ticketNumberFilter) : undefined,
        customerName: customerNameFilter || undefined,
        email: emailFilter || undefined,
        phone: phoneFilter || undefined,
        dateFrom: dateFromFilter || undefined,
        dateTo: dateToFilter || undefined,
      });
    } catch (error) {
      console.error("Failed to export:", error);
      alert("Error al exportar las órdenes");
    } finally {
      setIsExporting(false);
    }
  };

  const handleStartEdit = (purchase: Purchase) => {
    setEditingId(purchase.uid);
    setEditValue(purchase.notes || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      // Optimistic update
      setPurchases(prev => prev.map(p =>
        p.uid === editingId ? { ...p, notes: editValue } : p
      ));

      await purchasesService.updatePurchase(editingId, {
        notes: editValue
      });

      setEditingId(null);
    } catch (error) {
      console.error("Failed to update note:", error);
      alert("Error al actualizar la nota. Se revertirán los cambios.");
      loadPurchases(); // Revert changes on error
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              to={raffleId ? `/ordenes?raffleId=${raffleId}` : "/ordenes"}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
            >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Volver a divisas
            </Link>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
            Ordenes ({currency})
          </h2>
          {purchases.length > 0 && purchases[0].raffle?.title && <p className="text-slate-400 text-sm mt-1">Rifa: {purchases[0].raffle.title}</p>}
        </div>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          {isExporting ? "Exportando..." : "Descargar Excel"}
        </Button>
      </header>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 bg-card-dark border border-border-subtle p-4 rounded-xl">
        <div>
            <label className="text-xs text-slate-500 mb-1 block">Estado</label>
            <select
                className="w-full h-10 px-3 rounded-lg bg-background-dark border border-border-subtle text-slate-200 text-sm focus:outline-none focus:border-primary/50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
            >
                <option value="">Todos</option>
                <option value={PurchaseStatus.PENDING}>Pendiente</option>
                <option value={PurchaseStatus.VERIFIED}>Verificado</option>
                <option value={PurchaseStatus.REJECTED}>Rechazado</option>
                <option value={PurchaseStatus.MANUAL_REVIEW}>Revisión Manual</option>
            </select>
        </div>
        <div>
            <label className="text-xs text-slate-500 mb-1 block">Método de Pago</label>
            <select
                className="w-full h-10 px-3 rounded-lg bg-background-dark border border-border-subtle text-slate-200 text-sm focus:outline-none focus:border-primary/50"
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
            >
                <option value="">Todos</option>
                {paymentMethods.map((pm) => (
                    <option key={pm.uid} value={pm.uid}>{pm.name}</option>
                ))}
            </select>
        </div>
        <div>
            <label className="text-xs text-slate-500 mb-1 block">Cédula</label>
            <input
                type="text"
                className="w-full h-10 px-3 rounded-lg bg-background-dark border border-border-subtle text-slate-200 text-sm focus:outline-none focus:border-primary/50"
                placeholder="Buscar por cédula..."
                value={nationalIdFilter}
                onChange={(e) => setNationalIdFilter(e.target.value)}
            />
        </div>
         <div>
            <label className="text-xs text-slate-500 mb-1 block">Número de Ticket</label>
            <input
                type="number"
                className="w-full h-10 px-3 rounded-lg bg-background-dark border border-border-subtle text-slate-200 text-sm focus:outline-none focus:border-primary/50"
                placeholder="Buscar por ticket..."
                value={ticketNumberFilter}
                onChange={(e) => setTicketNumberFilter(e.target.value)}
            />
        </div>
        <div>
            <label className="text-xs text-slate-500 mb-1 block">Nombre Participante</label>
            <input
                type="text"
                className="w-full h-10 px-3 rounded-lg bg-background-dark border border-border-subtle text-slate-200 text-sm focus:outline-none focus:border-primary/50"
                placeholder="Buscar por nombre..."
                value={customerNameFilter}
                onChange={(e) => setCustomerNameFilter(e.target.value)}
            />
        </div>
        <div>
            <label className="text-xs text-slate-500 mb-1 block">Email</label>
            <input
                type="text"
                className="w-full h-10 px-3 rounded-lg bg-background-dark border border-border-subtle text-slate-200 text-sm focus:outline-none focus:border-primary/50"
                placeholder="Buscar por email..."
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
            />
        </div>
        <div>
            <label className="text-xs text-slate-500 mb-1 block">Teléfono</label>
            <input
                type="text"
                className="w-full h-10 px-3 rounded-lg bg-background-dark border border-border-subtle text-slate-200 text-sm focus:outline-none focus:border-primary/50"
                placeholder="Buscar por teléfono..."
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
            />
        </div>
        <div>
            <label className="text-xs text-slate-500 mb-1 block">Fecha Desde</label>
            <input
                type="date"
                className="w-full h-10 px-3 rounded-lg bg-background-dark border border-border-subtle text-slate-200 text-sm focus:outline-none focus:border-primary/50"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
            />
        </div>
        <div>
            <label className="text-xs text-slate-500 mb-1 block">Fecha Hasta</label>
            <input
                type="date"
                className="w-full h-10 px-3 rounded-lg bg-background-dark border border-border-subtle text-slate-200 text-sm focus:outline-none focus:border-primary/50"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
            />
        </div>
        <div className="flex items-end">
            <Button
                onClick={() => {
                    setStatusFilter("");
                    setPaymentMethodFilter("");
                    setNationalIdFilter("");
                    setTicketNumberFilter("");
                    setCustomerNameFilter("");
                    setEmailFilter("");
                    setPhoneFilter("");
                    setDateFromFilter("");
                    setDateToFilter("");
                }}
                variant="outline"
                className="w-full h-10 border-border-subtle text-slate-400 hover:text-white"
            >
                Limpiar Filtros
            </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border-subtle bg-card-dark shadow-inner-glow overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                    <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-border-subtle/50 bg-white/[0.02]">
                        <th className="px-6 py-4 font-semibold">Participante</th>
                        <th className="px-6 py-4 font-semibold">Vendedor</th>
                        <th className="px-6 py-4 font-semibold">Método de Pago</th>
                        <th className="px-6 py-4 font-semibold">Referencia</th>
                        <th className="px-6 py-4 font-semibold">Tickets / Valor</th>
                        <th className="px-6 py-4 font-semibold">Estado</th>
                        <th className="px-6 py-4 font-semibold">Fecha Compra</th>
                        <th className="px-6 py-4 font-semibold">Fecha Verificación</th>
                        <th className="px-6 py-4 font-semibold">Números</th>
                        <th className="px-6 py-4 font-semibold">Notas</th>
                        <th className="px-6 py-4 font-semibold text-right sticky right-0 bg-card-dark border-l border-border-subtle/50">Acciones</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {isLoading ? (
                        <tr><td colSpan={11} className="px-6 py-12 text-center text-slate-500">Cargando ordenes...</td></tr>
                    ) : purchases.length === 0 ? (
                        <tr><td colSpan={11} className="px-6 py-12 text-center text-slate-500">No se encontraron ordenes.</td></tr>
                    ) : purchases.map((purchase) => (
                        <tr key={purchase.uid} className="group hover:bg-white/[0.02] border-b border-border-subtle/30 transition-colors last:border-0">
                            {/* Participante: Cliente, Cédula y Contacto fusionados */}
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium text-slate-200">{purchase.customer.fullName}</span>
                                    <span className="text-slate-300 font-mono text-xs">C.I: {purchase.customer.nationalId}</span>
                                    <div className="flex flex-col text-xs">
                                        <span className="text-slate-400">{purchase.customer.email}</span>
                                        <span className="text-slate-500">{purchase.customer.phone}</span>
                                    </div>
                                </div>
                            </td>
                            {/* Vendedor: accountHolderName del paymentMethod */}
                            <td className="px-6 py-4 text-slate-300">
                                {purchase.paymentMethod?.accountHolderName || '-'}
                            </td>
                            {/* Método de Pago */}
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="text-slate-300">{purchase.paymentMethod?.name || '-'}</span>
                                    {/* AI Comparison for Payment Method - simplistic check */}
                                    {purchase.aiAnalysisResult && purchase.aiAnalysisResult.bank && (
                                         <span className="text-[10px] text-slate-500">
                                            IA: {purchase.aiAnalysisResult.bank}
                                        </span>
                                    )}
                                </div>
                            </td>
                            {/* Referencia */}
                            <td className="px-6 py-4 font-mono text-xs">
                                <div className="flex flex-col gap-1">
                                    <span className="text-slate-400">{purchase.bankReference}</span>
                                    {purchase.aiAnalysisResult && (
                                        <span className={cn("text-[10px] flex items-center gap-1",
                                            (purchase.aiAnalysisResult.reference && purchase.bankReference &&
                                                (String(purchase.aiAnalysisResult.reference).includes(String(purchase.bankReference)) ||
                                                 String(purchase.bankReference).includes(String(purchase.aiAnalysisResult.reference))))
                                                ? "text-emerald-400"
                                                : "text-red-400"
                                        )}>
                                            <span className="material-symbols-outlined text-[10px]">
                                                {(purchase.aiAnalysisResult.reference && purchase.bankReference &&
                                                    (String(purchase.aiAnalysisResult.reference).includes(String(purchase.bankReference)) ||
                                                     String(purchase.bankReference).includes(String(purchase.aiAnalysisResult.reference))))
                                                    ? 'check'
                                                    : 'close'}
                                            </span>
                                            IA: {purchase.aiAnalysisResult.reference || 'N/A'}
                                        </span>
                                    )}
                                </div>
                            </td>
                            {/* Tickets / Valor */}
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium text-white">{purchase.ticketQuantity} tickets</span>
                                    <span className="text-xs text-slate-400">{Number(purchase.totalAmount).toFixed(2)} {getCurrencyLabel(purchase.paymentMethod)}</span>
                                    {purchase.aiAnalysisResult && (
                                        <span className={cn("text-[10px] flex items-center gap-1",
                                            purchase.aiAnalysisResult.amount && Math.abs(Number(purchase.aiAnalysisResult.amount) - Number(purchase.totalAmount)) < 1 ? "text-emerald-400" : "text-red-400"
                                        )}>
                                            <span className="material-symbols-outlined text-[10px]">{purchase.aiAnalysisResult.amount && Math.abs(Number(purchase.aiAnalysisResult.amount) - Number(purchase.totalAmount)) < 1 ? 'check' : 'close'}</span>
                                            IA: {purchase.aiAnalysisResult.amount || 'N/A'}
                                        </span>
                                    )}
                                </div>
                            </td>
                            {/* Estado */}
                            <td className="px-6 py-4">
                                <StatusBadge status={purchase.status} />
                            </td>
                            {/* Fecha Compra */}
                            <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(purchase.submittedAt)}</td>
                            {/* Fecha Verificación */}
                            <td className="px-6 py-4 text-slate-500 text-xs">
                                {purchase.verifiedAt ? formatDate(purchase.verifiedAt) : '-'}
                            </td>
                            {/* Números: Lista de números de tickets comprados */}
                            <td className="px-6 py-4">
                                {purchase.ticketNumbers && purchase.ticketNumbers.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {purchase.ticketNumbers.slice(0, 5).map((num) => (
                                            <span key={num} className="inline-block px-1.5 py-0.5 bg-primary/10 border border-primary/20 rounded text-xs font-mono text-primary">
                                                {String(num).padStart(3, '0')}
                                            </span>
                                        ))}
                                        {purchase.ticketNumbers.length > 5 && (
                                            <span className="inline-block px-1.5 py-0.5 text-xs text-slate-500">
                                                +{purchase.ticketNumbers.length - 5}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-slate-600 text-xs">-</span>
                                )}
                            </td>
                            {/* Notas */}
                            <td className="px-6 py-4">
                                {editingId === purchase.uid ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            ref={editInputRef}
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            onBlur={handleSaveEdit}
                                            className="h-8 w-40 bg-background-dark border-primary/50 text-white text-xs"
                                            placeholder="Añadir nota..."
                                        />
                                    </div>
                                ) : (
                                    <div
                                        onDoubleClick={() => handleStartEdit(purchase)}
                                        className="cursor-pointer hover:bg-white/5 px-2 py-1 -ml-2 rounded transition-colors min-h-[2rem] flex items-center max-w-[200px]"
                                        title="Doble click para editar nota"
                                    >
                                        {purchase.notes ? (
                                            <span className="text-xs text-slate-300 truncate block">{purchase.notes}</span>
                                        ) : (
                                            <span className="text-xs text-slate-600 italic">Sin notas...</span>
                                        )}
                                        <span className="material-symbols-outlined text-[14px] text-slate-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
                                    </div>
                                )}
                            </td>
                            {/* Acciones */}
                            <td className="px-6 py-4 text-right sticky right-0 bg-card-dark border-l border-border-subtle/50 group-hover:bg-[#1a1f2e] transition-colors">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => setViewImage(purchase.paymentScreenshotUrl)}
                                        className="text-slate-400 hover:text-blue-400 p-1.5 rounded hover:bg-blue-500/10 transition-colors"
                                        title="Ver Comprobante"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">image</span>
                                    </button>

                                    {purchase.status === PurchaseStatus.VERIFIED && purchase.ticketNumbers && purchase.ticketNumbers.length > 0 && (
                                        <button
                                            onClick={() => setViewTickets({
                                                tickets: purchase.ticketNumbers!,
                                                customerName: purchase.customer.fullName
                                            })}
                                            className="text-slate-400 hover:text-primary p-1.5 rounded hover:bg-primary/10 transition-colors"
                                            title="Ver Tickets"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                                        </button>
                                    )}

                                    {(purchase.status === PurchaseStatus.PENDING || purchase.status === PurchaseStatus.MANUAL_REVIEW) && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(purchase.uid, PurchaseStatus.VERIFIED)}
                                                className="text-slate-400 hover:text-emerald-400 p-1.5 rounded hover:bg-emerald-500/10 transition-colors"
                                                title="Verificar"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(purchase.uid, PurchaseStatus.REJECTED)}
                                                className="text-slate-400 hover:text-red-400 p-1.5 rounded hover:bg-red-500/10 transition-colors"
                                                title="Rechazar"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">cancel</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
         {/* Footer / Pagination */}
         <div className="flex items-center justify-between px-6 py-4 border-t border-border-subtle/50 bg-white/[0.01]">
                <p className="text-xs text-slate-500">
                    Mostrando <span className="font-medium text-slate-300">{Math.min((currentPage - 1) * itemsPerPage + 1, total)}</span> a <span className="font-medium text-slate-300">{Math.min(currentPage * itemsPerPage, total)}</span> de <span className="font-medium text-slate-300">{total}</span> resultados
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="size-8 flex items-center justify-center rounded-lg border border-border-subtle bg-transparent text-slate-400 hover:text-white hover:bg-white/5 hover:border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                    </button>
                    <span className="flex items-center text-xs text-slate-400 px-2">
                        Página {currentPage} de {totalPages || 1}
                    </span>
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

      {/* Image Modal */}
      {viewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setViewImage(null)}>
            <div className="relative max-w-4xl max-h-[90vh] overflow-auto rounded-xl bg-card-dark border border-border-subtle p-2">
                <img src={viewImage} alt="Comprobante" className="max-w-full h-auto rounded-lg" />
                <button
                    onClick={() => setViewImage(null)}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
        </div>
      )}

      {/* AI Result Modal */}
      {viewAi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setViewAi(null)}>
            <div className="relative w-full max-w-lg rounded-xl bg-card-dark border border-border-subtle p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Análisis de IA</h3>
                    <button onClick={() => setViewAi(null)} className="text-slate-400 hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="bg-background-dark p-4 rounded-lg overflow-auto max-h-[60vh]">
                    <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                        {JSON.stringify(viewAi, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
      )}

      {/* Tickets Modal */}
      {viewTickets && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setViewTickets(null)}>
            <div className="relative w-full max-w-md rounded-xl bg-card-dark border border-border-subtle p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white">Tickets Asignados</h3>
                        <p className="text-sm text-slate-400 mt-1">{viewTickets.customerName}</p>
                    </div>
                    <button onClick={() => setViewTickets(null)} className="text-slate-400 hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="bg-background-dark p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-primary">confirmation_number</span>
                        <span className="text-sm text-slate-400">{viewTickets.tickets.length} ticket(s) asignado(s)</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {viewTickets.tickets.map((ticket) => (
                            <div
                                key={ticket}
                                className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center"
                            >
                                <span className="text-lg font-bold text-primary font-mono">
                                    {String(ticket).padStart(3, '0')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  );
}

function StatusBadge({ status }: { status: PurchaseStatus }) {
    let styles = "bg-slate-500/10 text-slate-400 border-slate-500/20";
    let icon = "circle";
    let label = status;

    if (status === PurchaseStatus.VERIFIED) {
        styles = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        icon = "check_circle";
        label = "Verificado" as any;
    } else if (status === PurchaseStatus.PENDING) {
        styles = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
        icon = "schedule";
        label = "Pendiente" as any;
    } else if (status === PurchaseStatus.REJECTED) {
        styles = "bg-red-500/10 text-red-400 border-red-500/20";
        icon = "cancel";
        label = "Rechazado" as any;
    } else if (status === PurchaseStatus.MANUAL_REVIEW) {
        styles = "bg-blue-500/10 text-blue-400 border-blue-500/20";
        icon = "person_search";
        label = "Revisión Manual" as any;
    }

    return (
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize", styles)}>
            <span className="material-symbols-outlined text-[12px]">{icon}</span>
            {label}
        </span>
    );
}
