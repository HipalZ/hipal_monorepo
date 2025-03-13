import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface AlertHistoryItem {
  id: string
  type: "food" | "service"
  serviceIds?: string[]
  serviceName?: string
  restaurantId?: string
  restaurantName?: string
  timestamp: number
  status: "pending" | "completed" | "cancelled"
  roomId?: string
  roomName?: string
  businessId: string
}

interface AlertHistoryState {
  history: AlertHistoryItem[]
  addToHistory: (item: Omit<AlertHistoryItem, "id" | "timestamp">) => void
  clearHistory: () => void
  updateAlertStatus: (id: string, status: AlertHistoryItem["status"]) => void
}

export const useAlertHistoryStore = create<AlertHistoryState>()(
  persist(
    (set) => ({
      history: [],

      addToHistory: (item) =>
        set((state) => {
          const newItem: AlertHistoryItem = {
            ...item,
            id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            timestamp: Date.now(),
          }

          return {
            history: [newItem, ...state.history],
          }
        }),

      clearHistory: () => set({ history: [] }),

      updateAlertStatus: (id, status) =>
        set((state) => ({
          history: state.history.map((item) => (item.id === id ? { ...item, status } : item)),
        })),
    }),
    {
      name: "alert-history-storage",
      partialize: (state) => ({ history: state.history }),
    },
  ),
)

