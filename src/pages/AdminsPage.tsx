import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { adminsService, type AdminListItem } from "@/services/admins.service";
import { AdminRole } from "@/services/auth.service";

export function AdminsPage() {
  const [admins, setAdmins] = useState<AdminListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setIsLoading(true);
      const data = await adminsService.getAll();
      setAdmins(data);
    } catch (error) {
      console.error("Failed to load admins:", error);
      alert("Error al cargar los administradores");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (uid: string, email: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar al administrador ${email}?`)) {
      return;
    }

    try {
      await adminsService.delete(uid);
      await loadAdmins();
    } catch (error) {
      console.error("Failed to delete admin:", error);
      alert("Error al eliminar el administrador");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getRoleLabel = (role: AdminRole) => {
    return role === AdminRole.SUPER_ADMIN ? 'Super Admin' : 'Verificador';
  };

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Administradores</h2>
          <p className="text-slate-400">Gestiona y visualiza todos los administradores del sistema.</p>
        </div>
        <button
          onClick={() => navigate('/admins/crear')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium text-sm transition-colors shadow-glow"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Crear Administrador
        </button>
      </header>

      {/* Table */}
      <div className="rounded-xl border border-border-subtle bg-card-dark shadow-inner-glow overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-border-subtle/50 bg-white/[0.02]">
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Rol</th>
                <th className="px-6 py-4 font-semibold">Fecha de Creación</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Cargando administradores...
                  </td>
                </tr>
              ) : admins.map((admin) => (
                <tr key={admin.uid} className="group hover:bg-white/[0.02] border-b border-border-subtle/30 transition-colors last:border-0">
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-200">{admin.full_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-300">{admin.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      admin.role === AdminRole.SUPER_ADMIN
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-slate-700/50 text-slate-300 border border-slate-600/50"
                    )}>
                      {getRoleLabel(admin.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {formatDate(admin.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admins/editar/${admin.uid}`}
                        className="text-slate-400 hover:text-primary p-2 rounded-full hover:bg-primary/10 transition-colors"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(admin.uid, admin.email)}
                        className="text-slate-400 hover:text-red-400 p-2 rounded-full hover:bg-red-400/10 transition-colors"
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && admins.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No se encontraron administradores.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
