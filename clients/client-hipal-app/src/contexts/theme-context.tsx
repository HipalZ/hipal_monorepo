// contexts/theme-context.tsx
"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type ThemeType = "default" | "hotel"

interface ThemeContextType {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children, defaultTheme = "default" }: { children: ReactNode, defaultTheme?: ThemeType }) {
  const [theme, setTheme] = useState<ThemeType>(defaultTheme)

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}