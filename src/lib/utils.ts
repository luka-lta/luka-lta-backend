import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(date))
}

export const splitAvatarUrl = (avatarUrl: null|string|undefined): string|undefined => {
  const avatarPath = avatarUrl;
  return  avatarPath
      ? `https://api.luka-lta.dev/api/v1/avatar/${avatarPath.split('/').pop()}`
      : undefined;
}