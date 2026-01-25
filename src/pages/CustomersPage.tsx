import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { customersService, type CustomerListItem } from "@/services/customers.service";

export function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter states
  const [nationalIdFilter, setNationalIdFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [fullNameFilter, setFullNameFilter] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadCustomers();
  }, [currentPage, nationalIdFilter, phoneFilter, fullNameFilter]);

  // Reset page when filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [nationalIdFilter, phoneFilter, fullNameFilter]);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(nationalIdFilter && { nationalId: nationalIdFilter }),
        ...(phoneFilter && { phone: phoneFilter }),
        ...(fullNameFilter && { fullName: fullNameFilter }),
      };
      const response = await customersService.listCustomers(params);
      setCustomers(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to list customers:", error);
      alert("Error al cargar los clientes");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const clearFilters = () => {
    setNationalIdFilter("");
    setPhoneFilter("");
    setFullNameFilter("");
  };

  const hasActiveFilters = nationalIdFilter || phoneFilter || fullNameFilter;

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Clientes</h2>
          <p className="text-slate-400">Gestiona y visualiza todos los clientes registrados.</p>
        </div>
      </header>

      {/* Controls & Table */}
      <div className="flex flex-col gap-6">
        {/* Filters */}
        <div className="flex flex-col gap-4 bg-card-dark border border-border-subtle p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300">Filtros de búsqueda</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">badge</span>
              <input
                type="text"
                placeholder="Cédula..."
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-background-dark border border-border-subtle text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary/50 text-sm transition-colors"
                value={nationalIdFilter}
                onChange={(e) => setNationalIdFilter(e.target.value)}
              />
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">phone</span>
              <input
                type="text"
                placeholder="Teléfono..."
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-background-dark border border-border-subtle text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary/50 text-sm transition-colors"
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
              />
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">person</span>
              <input
                type="text"
                placeholder="Nombre completo..."
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-background-dark border border-border-subtle text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary/50 text-sm transition-colors"
                value={fullNameFilter}
                onChange={(e) => setFullNameFilter(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border-subtle bg-card-dark shadow-inner-glow overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-border-subtle/50 bg-white/[0.02]">
                  <th className="px-6 py-4 font-semibold">Cédula</th>
                  <th className="px-6 py-4 font-semibold">Nombre</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Teléfono</th>
                  <th className="px-6 py-4 font-semibold">Fecha Registro</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      Cargando clientes...
                    </td>
                  </tr>
                ) : customers.map((customer) => (
                  <tr key={customer.uid} className="group hover:bg-white/[0.02] border-b border-border-subtle/30 transition-colors last:border-0">
                    <td className="px-6 py-4">
                      <span className="font-mono text-slate-200">{customer.nationalId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-200">{customer.fullName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300">{customer.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300">{customer.phone || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/clientes/${customer.uid}`}
                          className="text-slate-400 hover:text-primary p-2 rounded-full hover:bg-primary/10 transition-colors"
                          title="Ver detalles"
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && customers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No se encontraron clientes.
                    </td>
                  </tr>
                )}
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
