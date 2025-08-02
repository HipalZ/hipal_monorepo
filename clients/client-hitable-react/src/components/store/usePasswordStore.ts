import { create } from "zustand"

interface PasswordState {
  isVerified: boolean
  showAllNumbers: boolean
  revealedNumbers: Set<string>
  verifyPassword: (password: string) => boolean
  setShowAllNumbers: (show: boolean) => void
  addRevealedNumber: (phone: string) => void
  resetVerification: () => void
}

export const usePasswordStore = create<PasswordState>((set, get) => ({
  isVerified: false,
  showAllNumbers: false,
  revealedNumbers: new Set(),

  verifyPassword: (password: string) => {
    const isCorrect = password === "admin123"
    set({ isVerified: isCorrect })
    return isCorrect
  },

  setShowAllNumbers: (show: boolean) => {
    set({ showAllNumbers: show })
    if (show) {
      set({ isVerified: true })
    }
  },

  addRevealedNumber: (phone: string) => {
    const { revealedNumbers } = get()
    const newRevealed = new Set(revealedNumbers)
    newRevealed.add(phone)
    set({ revealedNumbers: newRevealed })
  },

  resetVerification: () => {
    set({ isVerified: false, showAllNumbers: false, revealedNumbers: new Set() })
  },
}))
