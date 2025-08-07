import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import type { IBillData } from "@/components/types/hiClientzData.ts"

export const hideMiddleNumbers = (phone: string): string => {
  if (!phone) return ""
  if (phone.length <= 2) return phone
  const firstPart = phone.slice(0, 2)
  const lastPart = phone.slice(-1)
  return `${firstPart}****${lastPart}`
}

export const calculateBillItems = (billItems: IBillData["billItems"]): number => {
  return billItems.reduce((sum, group) => sum + group.items.reduce((qty, item) => qty + item.quantity, 0), 0)
}

export const calculateTotalAmount = (billData: IBillData[]): number => {
  return billData.reduce((sum, bill) => sum + bill.total, 0)
}

export const calculateTotalItems = (billData: IBillData[]): number => {
  return billData.reduce((sum, bill) => sum + calculateBillItems(bill.billItems), 0)
}

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`
}
