import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { AdminRole } from '@/services/auth.service';

interface NavItem {
  to: string;
  icon: string;
  label: string;
  end?: boolean;
  allowedRoles: AdminRole[];
}

const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    icon: 'dashboard',
    label: 'Panel',
    end: true,
    allowedRoles: [AdminRole.SUPER_ADMIN, AdminRole.VERIFIER],
  },
  {
    to: '/rifas',
    icon: 'confirmation_number',
    label: 'Rifas',
    allowedRoles: [AdminRole.SUPER_ADMIN],
  },
  {
    to: '/ordenes',
    icon: 'receipt_long',
    label: 'Ordenes',
    allowedRoles: [AdminRole.SUPER_ADMIN, AdminRole.VERIFIER],
  },
  {
    to: '/clientes',
    icon: 'people',
    label: 'Clientes',
    allowedRoles: [AdminRole.SUPER_ADMIN],
  },
  {
    to: '/payment-methods',
    icon: 'payments',
    label: 'Métodos de pago',
    allowedRoles: [AdminRole.SUPER_ADMIN],
  },
  {
    to: '/divisas',
    icon: 'currency_exchange',
    label: 'Divisas',
    allowedRoles: [AdminRole.SUPER_ADMIN],
  },
  {
    to: '/admins',
    icon: 'admin_panel_settings',
    label: 'Administradores',
    allowedRoles: [AdminRole.SUPER_ADMIN],
  },
];

export function Sidebar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  // Filter nav items based on user role
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!user?.role) return false;
    return item.allowedRoles.includes(user.role);
  });

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
          {visibleNavItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              end={item.end}
            />
          ))}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-6 border-t border-border-subtle flex flex-col gap-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 w-full text-left"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-medium text-sm">Cerrar sesión</span>
        </button>

        <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-card-dark border border-border-subtle">
          <div className="size-9 rounded-full bg-slate-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '20px' }}>person</span>
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.full_name || 'Admin'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
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
