import { useRef } from "react";
import { toast } from "sonner";

interface UndoToastOptions {
  message: string;
  undoLabel?: string;
  duration?: number;
  onConfirm: () => Promise<void>;
  onError?: (label: string) => void;
}

export function useUndoToast() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function trigger({ message, undoLabel = "Undo", duration = 4000, onConfirm, onError }: UndoToastOptions) {
    let cancelled = false;

    const toastId = toast(message, {
      duration,
      action: {
        label: undoLabel,
        onClick: () => {
          cancelled = true;
          if (timerRef.current) clearTimeout(timerRef.current);
          toast.dismiss(toastId);
        },
      },
    });

    timerRef.current = setTimeout(async () => {
      if (cancelled) return;
      try {
        await onConfirm();
      } catch {
        onError?.(message);
      }
    }, duration);
  }

  return { trigger };
}
