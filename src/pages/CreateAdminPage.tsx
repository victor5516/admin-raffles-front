import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminsService } from "@/services/admins.service";
import { AdminRole } from "@/services/auth.service";

export function CreateAdminPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: AdminRole.VERIFIER as AdminRole,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.fullName) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      setIsSubmitting(true);
      await adminsService.create({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
      });
      navigate("/admins");
    } catch (error) {
      console.error("Failed to create admin:", error);
      alert("Error al crear el administrador");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/admins" className="text-slate-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">Crear Administrador</h2>
          </div>
          <p className="text-slate-400 ml-7">Agrega un nuevo administrador o verificador al sistema.</p>
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
              Contraseña *
            </label>
            <input
              type="password"
              id="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="h-10 px-4 rounded-lg bg-background-dark border border-border-subtle text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary/50 text-sm transition-colors"
              placeholder="Mínimo 6 caracteres"
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
                  Creando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">check</span>
                  Crear Administrador
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
