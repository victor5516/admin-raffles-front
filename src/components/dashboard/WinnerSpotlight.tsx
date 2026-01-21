import { winnerSpotlight } from "@/data/mock";

export function WinnerSpotlight() {
  return (
    <div className="rounded-xl border border-accent-gold/30 bg-gradient-to-br from-card-dark to-[#38331d] p-6 relative overflow-hidden group">
      {/* Shine effect */}
      <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 group-hover:animate-shine pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="uppercase tracking-widest text-[10px] font-bold text-accent-gold">Último ganador</span>
        <span className="material-symbols-outlined text-accent-gold">trophy</span>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <div
          className="size-12 rounded-full border-2 border-accent-gold bg-slate-800 bg-cover bg-center shadow-[0_0_15px_rgba(255,215,0,0.3)]"
          style={{ backgroundImage: `url('${winnerSpotlight.avatar}')` }}
        ></div>
        <div>
          <p className="font-display font-bold text-white text-lg">{winnerSpotlight.name}</p>
          <p className="text-xs text-accent-gold/80">Ganó "{winnerSpotlight.prize}"</p>
        </div>
      </div>

      {/* Confetti decoration (SVG) */}
      <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
        <svg fill="none" height="100" viewBox="0 0 100 100" width="100" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 90 L20 80 M30 95 L35 85 M50 90 L60 70 M80 85 L90 75" stroke="#FFD700" strokeLinecap="round" strokeWidth="2"></path>
          <circle cx="20" cy="70" fill="#FFD700" r="2"></circle>
          <circle cx="70" cy="80" fill="#FFD700" r="3"></circle>
          <rect fill="#FFD700" height="4" transform="rotate(45 40 60)" width="4" x="40" y="60"></rect>
        </svg>
      </div>
    </div>
  );
}
