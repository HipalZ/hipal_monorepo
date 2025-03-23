// lib/theme-utils.ts
import { cn } from "@/lib/utils"

type ThemeType = "default" | "hotel"

interface ThemeClassOptions {
  base?: string
  defaultClasses?: string
  hotelClasses?: string
}

export function getThemeClasses({ 
  base = "", 
  defaultClasses = "", 
  hotelClasses = "" 
}: ThemeClassOptions, theme: ThemeType = "default") {
  if (theme === "hotel") {
    return cn(base, hotelClasses)
  }
  return cn(base, defaultClasses)
}