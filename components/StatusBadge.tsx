interface StatusBadgeProps {
  status: string;
  label?: string;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending" },
  approved: { bg: "bg-green-100", text: "text-green-700", label: "Approved" },
  rejected: { bg: "bg-red-100", text: "text-red-700", label: "Rejected" },
  active: { bg: "bg-green-100", text: "text-green-700", label: "Active" },
  in_transit: { bg: "bg-blue-100", text: "text-blue-700", label: "In Transit" },
  completed: { bg: "bg-gray-100", text: "text-gray-700", label: "Completed" },
  cancelled: { bg: "bg-gray-100", text: "text-gray-500", label: "Cancelled" },
  pending_admin_approval: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending Approval" },
  approved_pending_setup: { bg: "bg-blue-100", text: "text-blue-700", label: "Pending Setup" },
  pending_final_approval: { bg: "bg-purple-100", text: "text-purple-700", label: "Under Review" },
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { bg: "bg-gray-100", text: "text-gray-600", label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {label ?? config.label}
    </span>
  );
}
