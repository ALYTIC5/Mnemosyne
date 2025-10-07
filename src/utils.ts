// src/utils.ts
import { format, subDays } from "date-fns";

export function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    days.push(format(subDays(new Date(), i), "yyyy-MM-dd"));
  }
  return days;
}

export function shortLabel(iso: string) {
  // e.g., "Mon", "Tue"
  return format(new Date(iso), "EEE");
}
