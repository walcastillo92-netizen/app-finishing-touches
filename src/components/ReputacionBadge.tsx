import { Star } from "lucide-react";

interface ReputacionBadgeProps {
  promedio: number | null;
  cantidad: number;
  tamano?: "sm" | "md";
  className?: string;
}

export function ReputacionBadge({
  promedio,
  cantidad,
  tamano = "md",
  className = "",
}: ReputacionBadgeProps) {
  if (cantidad < 1 || promedio == null || promedio <= 0) {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground ${className}`}
      >
        Sin valoraciones todavía
      </span>
    );
  }

  const operaciones = cantidad === 1 ? "1 operación" : `${cantidad} operaciones`;
  return (
    <div
      className={`inline-flex items-center gap-1.5 ${tamano === "sm" ? "text-xs" : "text-sm"} ${className}`}
    >
      <span className="inline-flex items-center gap-1 font-bold text-amber-500">
        <Star className={`${tamano === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} fill-amber-500`} />
        {promedio.toFixed(1)}
      </span>
      <span className="text-muted-foreground">({operaciones})</span>
    </div>
  );
}
