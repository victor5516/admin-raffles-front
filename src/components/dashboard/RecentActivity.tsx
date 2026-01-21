import { recentActivity } from "@/data/mock";

export function RecentActivity() {
  return (
    <div className="rounded-xl border border-border-subtle bg-card-dark flex flex-col flex-1 shadow-inner-glow">
      <div className="flex items-center justify-between p-6 border-b border-border-subtle">
        <h3 className="font-display text-lg font-bold text-white">Actividad reciente</h3>
        <button className="text-slate-500 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-[20px]">refresh</span>
        </button>
      </div>
      <div className="p-6 flex flex-col gap-6">
        {recentActivity.map((activity, index) => (
          <div key={activity.id} className="flex gap-4 relative">
            {index !== recentActivity.length - 1 && (
                <div className="absolute top-8 bottom-[-24px] left-[15px] w-px bg-border-subtle"></div>
            )}

            <div className={`relative z-10 size-8 rounded-full ${activity.iconBg} flex items-center justify-center ${activity.iconColor} flex-shrink-0 border ${activity.borderColor || ""}`}>
              <span className="material-symbols-outlined text-[16px]">{activity.icon}</span>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-sm text-slate-300">
                  {activity.type === 'ended' ? (
                      <>
                        {activity.text} <span className="italic text-slate-400">{activity.raffleName}</span>
                      </>
                  ) : activity.type === 'registration' ? (
                      <>{activity.user}</>
                  ) : (
                      <>
                        <span className="font-bold text-white">{activity.user}</span> {activity.action}
                      </>
                  )}
              </p>
              <div className="flex items-center gap-2">
                {activity.amount && (
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">{activity.amount}</span>
                )}
                {activity.handle && (
                    <span className="text-xs text-slate-400">{activity.handle}</span>
                )}
                {activity.status && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${activity.statusColor}`}>{activity.status}</span>
                )}
                <span className="text-xs text-slate-500">{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
