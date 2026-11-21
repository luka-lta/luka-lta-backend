import { cn } from "@/lib/utils.ts";
import { formatCents } from "@/feature/business-documents/money.ts";

interface Props {
  cents: number;
  className?: string;
}

/** Euro-Betrag mit tabellarischen Ziffern; negative Beträge in Warnfarbe. */
export function MoneyText({ cents, className }: Props) {
  return <span className={cn("tabular-nums", cents < 0 && "text-destructive", className)}>{formatCents(cents)}</span>;
}
