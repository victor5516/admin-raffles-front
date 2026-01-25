import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { paymentMethodsService, type PaymentMethod } from "@/services/payment-methods.service";

export function PaymentMethodsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  // Reset page when filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const data = await paymentMethodsService.listPaymentMethods();
      setPaymentMethods(data);
    } catch (error) {
      console.error("Failed to list payment methods:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (uid: string) => {
    if (!confirm("¿Estás seguro de querer eliminar este método de pago?")) return;
    try {
        await paymentMethodsService.deletePaymentMethod(uid);
        loadPaymentMethods(); // Reload list
    } catch (error) {
        console.error("Failed to delete payment method:", error);
        alert("Error al eliminar el método de pago");
    }
  };

  const filteredMethods = paymentMethods.filter((method) => {
    return method.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredMethods.length / itemsPerPage);
  const paginatedMethods = filteredMethods.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Métodos de Pago</h2>
          <p className="text-slate-400">Administra las cuentas y formas de pago disponibles.</p>
        </div>
        <div className="flex gap-3">
            <Link to="/payment-methods/crear">
                <Button className="gap-2 h-10 px-5 rounded-lg bg-primary hover:bg-primary-dark text-white shadow-glow transition-all text-sm font-medium border-0">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Crear Método de Pago
                </Button>
            </Link>
        </div>
      </header>

      {/* Controls & Table */}
      <div className="flex flex-col gap-6">

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card-dark border border-border-subtle p-1 rounded-xl">
            <div className="relative w-full md:w-80 ml-auto mr-2">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">search</span>
                <input
                    type="text"
                    placeholder="Buscar por nombre..."
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
                            <th className="px-6 py-4 font-semibold w-[300px]">Nombre</th>
                            <th className="px-6 py-4 font-semibold w-[200px]">Titular</th>
                            <th className="px-6 py-4 font-semibold">Monto Mínimo</th>
                            <th className="px-6 py-4 font-semibold">Moneda</th>
                            <th className="px-6 py-4 font-semibold w-[400px]">Datos de Pago</th>
                            <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {isLoading ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                              Cargando métodos de pago...
                            </td>
                          </tr>
                        ) : paginatedMethods.map((method) => (
                                <tr key={method.uid} className="group hover:bg-white/[0.02] border-b border-border-subtle/30 transition-colors last:border-0">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {method.imageUrl ? (
                                                <div className="size-10 rounded-lg bg-slate-800 bg-contain bg-center bg-no-repeat border border-border-subtle shrink-0" style={{ backgroundImage: `url('${method.imageUrl}')` }}></div>
                                            ) : (
                                                <div className={`size-10 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white font-bold text-sm border border-white/10 shrink-0`}>
                                                    {getInitials(method.name)}
                                                </div>
                                            )}
                                            <span className="font-medium text-slate-200">{method.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {method.accountHolderName ? (
                                            <span className="text-slate-300">{method.accountHolderName}</span>
                                        ) : (
                                            <span className="text-slate-500 italic">Sin titular</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-white">{Number(method.minimumPaymentAmount).toFixed(2)} {method.currency}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                            method.currency === "VES"
                                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                : "bg-green-500/10 text-green-400 border-green-500/20"
                                        )}>
                                            {method.currency}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        <div className="flex flex-col gap-1 text-xs">
                                            {Object.entries(method.paymentData || {}).map(([key, value]) => (
                                                <div key={key} className="flex gap-2">
                                                    <span className="font-medium text-slate-500">{key}:</span>
                                                    <span className="text-slate-300">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Edit Button */}
                                            <Link to={`/payment-methods/editar/${method.uid}`} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors" title="Editar">
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </Link>

                                            <button
                                                onClick={() => handleDelete(method.uid)}
                                                className="text-slate-400 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors"
                                                title="Eliminar"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        {!isLoading && filteredMethods.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    No se encontraron métodos de pago.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer / Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border-subtle/50 bg-white/[0.01]">
                <p className="text-xs text-slate-500">
                    Mostrando <span className="font-medium text-slate-300">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredMethods.length)}</span> a <span className="font-medium text-slate-300">{Math.min(currentPage * itemsPerPage, filteredMethods.length)}</span> de <span className="font-medium text-slate-300">{filteredMethods.length}</span> resultados
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
