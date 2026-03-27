interface SectionCardProps {
  title?: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}

export default function SectionCard({ title, subtitle, className = "", children }: SectionCardProps) {
  return (
    <div className={`bg-white border border-gray-100 rounded-2xl shadow-sm ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-100">
          {title && <h2 className="text-base font-semibold text-gray-900">{title}</h2>}
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
