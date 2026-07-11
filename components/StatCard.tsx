import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: string;
  trend?: string;
  /** Render as a branded gradient hero — use on the primary/first card in a row. */
  highlight?: boolean;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  color = "#06082C",
  trend,
  highlight = false,
}: StatCardProps) {
  if (highlight) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-[#06082C] via-[#0d1036] to-[#141852] rounded-2xl shadow-lg p-5 min-h-[120px] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.15em]">{label}</p>
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Icon size={15} className="text-white/80" />
          </div>
        </div>
        <p className="text-4xl font-bold text-white mt-auto leading-none tabular-nums">{value}</p>
        {trend && <p className="text-xs text-white/50 mt-2">{trend}</p>}
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-sm p-5 min-h-[120px] flex flex-col transition-all hover:shadow-md hover:-translate-y-0.5 animate-slide-up">
      {/* Soft accent glow in the card's colour — adds depth without changing the palette */}
      <div
        className="pointer-events-none absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-[0.07] blur-2xl transition-opacity duration-300 group-hover:opacity-[0.13]"
        style={{ backgroundColor: color }}
      />
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{label}</p>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}18` }}
        >
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <p className="text-4xl font-bold text-gray-900 mt-auto leading-none tabular-nums">{value}</p>
      {trend && <p className="text-xs text-gray-400 mt-2">{trend}</p>}
    </div>
  );
}
