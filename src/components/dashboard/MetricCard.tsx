import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive?: boolean; // Optional, if null/undefined handle differently? HTML logic: positive=emerald, neutral=slate
  icon: string;
  iconColor: string;
  iconBg: string;
  decoration?: React.ReactNode;
}

export function MetricCard({ title, value, change, isPositive, icon, iconColor, iconBg, decoration }: MetricCardProps) {
  const isNeutral = isPositive === undefined || change === "0%";

  return (
    <div className="relative overflow-hidden rounded-xl border border-border-subtle bg-card-dark p-6 group hover:border-primary/30 transition-colors shadow-inner-glow">
      {decoration}
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2 rounded-lg", iconBg, iconColor)}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <span className={cn("flex items-center text-xs font-medium px-2 py-1 rounded-full",
          !isNeutral ? "text-emerald-400 bg-emerald-400/10" : "text-slate-400 bg-slate-400/10"
        )}>
          {/* HTML logic for icon inside badge */}
          {!isNeutral && <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span>}
          {change}
        </span>
      </div>
      <div className="flex flex-col gap-1 relative z-10">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <h3 className={cn("font-display text-2xl font-bold tracking-tight", title === "Ingresos totales" ? "text-accent-gold" : "text-white")}>{value}</h3>
      </div>
    </div>
  );
}
