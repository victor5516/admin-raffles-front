import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { currenciesService, type Currency } from "@/services/currencies.service";

export function CurrenciesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Inline Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const editInputRef = useRef<HTMLInputElement>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadCurrencies();
  }, []);

  // Reset page when filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const loadCurrencies = async () => {
    try {
      setIsLoading(true);
      const data = await currenciesService.listCurrencies();
      setCurrencies(data);
    } catch (error) {
      console.error("Failed to list currencies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (uid: string) => {
    if (!confirm("¿Estás seguro de querer eliminar esta divisa?")) return;
    try {
      await currenciesService.deleteCurrency(uid);
      loadCurrencies(); // Reload list
    } catch (error) {
      console.error("Failed to delete currency:", error);
      alert("Error al eliminar la divisa");
    }
  };

  const handleStartEdit = (currency: Currency) => {
    setEditingId(currency.uid);
    setEditValue(currency.value.toString());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    const numericValue = parseFloat(editValue);
    if (isNaN(numericValue) || numericValue < 0) {
      alert("Por favor ingrese un valor válido.");
      return;
    }

    try {
      // Optimistic update
      setCurrencies(prev => prev.map(c =>
        c.uid === editingId ? { ...c, value: numericValue } : c
      ));

      await currenciesService.updateCurrency(editingId, {
        value: numericValue
      });

      setEditingId(null);
    } catch (error) {
      console.error("Failed to update currency value:", error);
      alert("Error al actualizar el valor. Se revertirán los cambios.");
      loadCurrencies(); // Revert changes on error
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const filteredCurrencies = currencies.filter((currency) => {
    return currency.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredCurrencies.length / itemsPerPage);
  const paginatedCurrencies = filteredCurrencies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Divisas</h2>
          <p className="text-slate-400">Administra las monedas y tasas de cambio disponibles.</p>
        </div>
        <div className="flex gap-3">
            <Link to="/divisas/crear">
                <Button className="gap-2 h-10 px-5 rounded-lg bg-primary hover:bg-primary-dark text-white shadow-glow transition-all text-sm font-medium border-0">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Crear Divisa
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
                            <th className="px-6 py-4 font-semibold">Nombre</th>
                            <th className="px-6 py-4 font-semibold">Símbolo</th>
                            <th className="px-6 py-4 font-semibold">Valor</th>
                            <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {isLoading ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                              Cargando divisas...
                            </td>
                          </tr>
                        ) : paginatedCurrencies.map((currency) => (
                                <tr key={currency.uid} className="group hover:bg-white/[0.02] border-b border-border-subtle/30 transition-colors last:border-0">
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-slate-200">{currency.name}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-slate-700 text-white px-2 py-1 rounded text-xs font-mono">{currency.symbol}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === currency.uid ? (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    ref={editInputRef}
                                                    type="number"
                                                    step="0.000001"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    onBlur={handleSaveEdit}
                                                    className="h-8 w-32 bg-background-dark border-primary/50 text-white"
                                                />
                                                <span className="text-xs text-slate-500 hidden md:inline">Enter para guardar</span>
                                            </div>
                                        ) : (
                                            <div
                                                onDoubleClick={() => handleStartEdit(currency)}
                                                className="cursor-pointer hover:bg-white/5 px-2 py-1 -ml-2 rounded transition-colors"
                                                title="Doble click para editar"
                                            >
                                                <span className="font-medium text-white">{Number(currency.value).toFixed(2)}</span>
                                                <span className="material-symbols-outlined text-[14px] text-slate-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Edit Button */}
                                            <Link to={`/divisas/editar/${currency.uid}`} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors" title="Editar">
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </Link>

                                            <button
                                                onClick={() => handleDelete(currency.uid)}
                                                className="text-slate-400 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors"
                                                title="Eliminar"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        {!isLoading && filteredCurrencies.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    No se encontraron divisas.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer / Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border-subtle/50 bg-white/[0.01]">
                <p className="text-xs text-slate-500">
                    Mostrando <span className="font-medium text-slate-300">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredCurrencies.length)}</span> a <span className="font-medium text-slate-300">{Math.min(currentPage * itemsPerPage, filteredCurrencies.length)}</span> de <span className="font-medium text-slate-300">{filteredCurrencies.length}</span> resultados
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
