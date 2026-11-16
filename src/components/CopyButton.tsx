import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CopyButtonProps {
  value: string;
  className?: string;
  size?: number;
}

export function CopyButton({ value, className, size = 12 }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const Icon = copied ? Check : Copy;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleCopy}
          className={cn(
            "inline-flex items-center justify-center rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
          type="button"
          aria-label={copied ? "Kopiert" : "In Zwischenablage kopieren"}
        >
          <Icon style={{ width: size, height: size }} className={cn(copied && "text-success")} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{copied ? "Kopiert" : "Kopieren"}</TooltipContent>
    </Tooltip>
  );
}
