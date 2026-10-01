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
            "inline-flex items-center justify-center rounded transition-colors text-muted-foreground/50 hover:text-foreground focus-visible:outline-none",
            className,
          )}
          aria-label="Copy to clipboard"
        >
          <Icon style={{ width: size, height: size }} className={cn(copied && "text-emerald-500")} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{copied ? "Copied!" : "Copy"}</TooltipContent>
    </Tooltip>
  );
}
