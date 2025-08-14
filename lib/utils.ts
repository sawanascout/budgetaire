import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to format currency in FCFA (XAF for Central African CFA franc)
export function formatCurrency(amount: number, currency = "XAF", locale = "fr-CM") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0, // No decimal places for XAF
    maximumFractionDigits: 0,
  }).format(amount)
}
