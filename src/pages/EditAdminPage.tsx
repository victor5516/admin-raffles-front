import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { adminsService } from "@/services/admins.service";
import { AdminRole } from "@/services/auth.service";

export function EditAdminPage() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: AdminRole.VERIFIER as AdminRole,
  });

  useEffect(() => {
    if (uid) {
      loadAdmin(uid);
    }
  }, [uid]);

  const loadAdmin = async (id: string) => {
    try {
      setIsLoading(true);
      const admin = await adminsService.getOne(id);
      setFormData({
        email: admin.email,
        password: "",
        fullName: admin.full_name,
        role: admin.role,
      });
    } catch (error) {
      console.error("Failed to load admin:", error);
      alert("Error al cargar el administrador");
      navigate("/admins");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uid) return;

    if (!formData.email || !formData.fullName) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      setIsSubmitting(true);
      const updateData: { email?: string; password?: string; fullName?: string; role?: AdminRole } = {
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
      };

      // Only include password if it was provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      await adminsService.update(uid, updateData);
      navigate("/admins");
    } catch (error) {
      console.error("Failed to update admin:", error);
      alert("Error al actualizar el administrador");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Cargando datos...</div>
      </div>
    );
  }

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/admins" className="text-slate-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">Editar Administrador</h2>
          </div>
          <p className="text-slate-400 ml-7">Modifica los detalles del administrador.</p>
        </div>
      </header>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-card-dark border border-border-subtle p-6 rounded-xl">
          <div className="flex flex-col gap-2">
            <label htmlFor="fullName" className="text-sm font-medium text-slate-300">
              Nombre Completo *
            </label>
            <input
              type="text"
              id="fullName"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="h-10 px-4 rounded-lg bg-background-dark border border-border-subtle text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary/50 text-sm transition-colors"
              placeholder="Juan Pérez"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-300">
              Email *
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-10 px-4 rounded-lg bg-background-dark border border-border-subtle text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary/50 text-sm transition-colors"
              placeholder="admin@example.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-300">
              Contraseña (dejar vacío para no cambiar)
            </label>
            <input
              type="password"
              id="password"
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="h-10 px-4 rounded-lg bg-background-dark border border-border-subtle text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary/50 text-sm transition-colors"
              placeholder="Mínimo 6 caracteres (opcional)"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="role" className="text-sm font-medium text-slate-300">
              Rol *
            </label>
            <select
              id="role"
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRole })}
              className="h-10 px-4 rounded-lg bg-background-dark border border-border-subtle text-slate-200 focus:outline-none focus:border-primary/50 text-sm transition-colors"
            >
              <option value={AdminRole.VERIFIER}>Verificador</option>
              <option value={AdminRole.SUPER_ADMIN}>Super Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium text-sm transition-colors shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                  Guardando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">check</span>
                  Guardar Cambios
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admins")}
              className="px-6 py-2 rounded-lg border border-border-subtle bg-transparent text-slate-300 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
