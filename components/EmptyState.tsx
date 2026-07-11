import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      {/* Layered icon — a soft disc behind a raised chip reads far less barren than a flat box */}
      <div className="relative mb-5 flex items-center justify-center">
        <div className="absolute w-20 h-20 rounded-full bg-gray-50" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-sm flex items-center justify-center">
          <Icon size={26} className="text-gray-400" strokeWidth={1.75} />
        </div>
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-5 leading-relaxed">{message}</p>
      {action}
    </div>
  );
}
