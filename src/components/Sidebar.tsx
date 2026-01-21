import { userProfile } from '@/data/mock';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-border-subtle bg-background-dark flex flex-col justify-between hidden md:flex h-full">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="size-10 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow">
            <span className="material-symbols-outlined text-white" style={{ fontSize: '24px' }}>confirmation_number</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-lg leading-tight">RaffleAdmin</h1>
            <p className="text-xs text-slate-400 font-medium">Consola v2.0</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          <NavItem to="/" icon="dashboard" label="Panel" end />
          <NavItem to="/rifas" icon="confirmation_number" label="Rifas" />
          <NavItem to="/ordenes" icon="receipt_long" label="Ordenes" />
          <NavItem to="/payment-methods" icon="payments" label="Métodos de pago" />
          <NavItem to="/divisas" icon="currency_exchange" label="Divisas" />
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-6 border-t border-border-subtle flex flex-col gap-1">
        <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200" href="#">
          <span className="material-symbols-outlined">settings</span>
          <span className="font-medium text-sm">Configuración</span>
        </a>

        <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-card-dark border border-border-subtle">
          <div
            className="size-9 rounded-full bg-slate-700 bg-cover bg-center"
            style={{ backgroundImage: `url('${userProfile.avatar}')` }}
          ></div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-medium text-white truncate">{userProfile.name}</p>
            <p className="text-xs text-slate-500 truncate">{userProfile.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, to, end }: { icon: string; label: string; to: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
        isActive
          ? "bg-primary/10 border border-primary/20 text-primary"
          : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
      )}
    >
      {({ isActive }) => (
        <>
          <span
            className="material-symbols-outlined group-hover:scale-110 transition-transform"
            data-weight={isActive ? "fill" : undefined}
          >
            {icon}
          </span>
          <span className="font-medium text-sm">{label}</span>
        </>
      )}
    </NavLink>
  );
}
