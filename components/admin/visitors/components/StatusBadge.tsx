import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

interface StatusBadgeProps {
  isCompleted: boolean;
  completedText?: string;
  incompletedText?: string;
  variant?: "disinfection" | "consent";
}

export function StatusBadge({
  isCompleted,
  completedText = "완료",
  incompletedText = "미완료",
  variant = "disinfection",
}: StatusBadgeProps) {
  if (isCompleted) {
    const colorClass =
      variant === "consent"
        ? "bg-blue-100 text-blue-800 border-blue-300"
        : "bg-emerald-100 text-emerald-800 border-emerald-300";

    return (
      <Badge
        className={`${colorClass} text-xs font-semibold whitespace-nowrap inline-flex items-center gap-1.5 min-w-fit px-3 py-1 hover:bg-opacity-80`}
      >
        <CheckCircle className="w-3 h-3 flex-shrink-0" />
        <span>{completedText}</span>
      </Badge>
    );
  }

  const colorClass =
    variant === "consent"
      ? "bg-gray-100 text-gray-800 border-gray-300"
      : "bg-red-100 text-red-800 border-red-300";

  return (
    <Badge
      className={`${colorClass} text-xs font-semibold whitespace-nowrap inline-flex items-center gap-1.5 min-w-fit px-3 py-1 hover:bg-opacity-80`}
    >
      <XCircle className="w-3 h-3 flex-shrink-0" />
      <span>{incompletedText}</span>
    </Badge>
  );
}
