import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: string;
  trend?: string;
}

export default function StatCard({ label, value, icon: Icon, color = "#06082C", trend }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && <p className="text-xs text-gray-400 mt-1">{trend}</p>}
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}18` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
      </div>
    </div>
  );
}
