import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: "pending" | "approved" | "rejected";
  className?: string;
};

const statusConfig = {
  pending: {
    background: "bg-amber-50",
    text: "text-amber-700"
  },
  approved: {
    background: "bg-green-50",
    text: "text-green-700"
  },
  rejected: {
    background: "bg-red-50",
    text: "text-red-700"
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span 
      className={cn(
        "inline-block px-2 py-1 rounded-full text-xs font-medium",
        config.background,
        config.text,
        className
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
