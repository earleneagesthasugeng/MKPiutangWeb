import { cn } from "@/lib/cn";
import type { DebtStatus } from "@/generated/prisma/client";

const labels: Record<DebtStatus, string> = {
  UNPAID: "UNPAID",
  PARTIAL: "PARTIAL",
  PAID: "PAID",
};

const classes: Record<DebtStatus, string> = {
  UNPAID: "bg-status-unpaid text-white",
  PARTIAL: "bg-status-partial-bg text-status-partial",
  PAID: "bg-status-paid text-white",
};

export function StatusBadge({
  status,
  className,
}: {
  status: DebtStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide",
        classes[status],
        className
      )}
    >
      {labels[status]}
    </span>
  );
}
