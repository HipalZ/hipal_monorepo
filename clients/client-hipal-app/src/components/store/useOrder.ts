// useOrder.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { JewelleryData } from "@/components/types/businessData";

export type OrderStatus = "IDLE" | "CHECKING" | "SUCCESS" | "FAILED";

interface OrderState {
  hasHydrated: boolean; // gate UI until persist is ready
  orderId: string | null;
  timestamp: number | null;
  orderData: JewelleryData | null;
  status: OrderStatus;

  // actions
  setOrderId: (orderId: string | null) => void;
  saveOrderData: (orderId: string, data: JewelleryData) => void;
  startChecking: () => void; // -> CHECKING
  setSuccess: () => void; // -> SUCCESS
  setFailed: () => void; // -> FAILED
  resetForRetry: () => void; // -> IDLE (keep orderId & data)
  clearAll: () => void; // clear everything (back button, expiry)
}

const ORDER_EXPIRATION_TIME = 15 * 60 * 1000;
let orderTimeoutId: ReturnType<typeof setTimeout> | null = null;

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,

      orderId: null,
      timestamp: null,
      orderData: null,
      status: "IDLE",

      setOrderId: (orderId) => {
        if (orderId === null) {
          get().clearAll();
          return;
        }
        if (orderTimeoutId) clearTimeout(orderTimeoutId);
        orderTimeoutId = setTimeout(
          () => get().clearAll(),
          ORDER_EXPIRATION_TIME,
        );
        set({ orderId, timestamp: Date.now(), status: "IDLE" });
      },

      saveOrderData: (orderId, data) => {
        if (get().orderId === orderId) set({ orderData: data });
      },

      startChecking: () => set({ status: "CHECKING" }),
      setSuccess: () => set({ status: "SUCCESS" }),
      setFailed: () => set({ status: "FAILED" }),

      resetForRetry: () => set({ status: "IDLE" }),

      clearAll: () => {
        if (orderTimeoutId) {
          clearTimeout(orderTimeoutId);
          orderTimeoutId = null;
        }
        set({
          orderId: null,
          timestamp: null,
          orderData: null,
          status: "IDLE",
        });
      },
    }),
    {
      name: "order-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.hasHydrated === false &&
          useOrderStore.setState({ hasHydrated: true });
        const ts = state?.timestamp ?? null;
        if (ts) {
          const elapsed = Date.now() - ts;
          if (elapsed >= ORDER_EXPIRATION_TIME) {
            useOrderStore.getState().clearAll();
          } else {
            const remaining = ORDER_EXPIRATION_TIME - elapsed;
            if (orderTimeoutId) clearTimeout(orderTimeoutId);
            orderTimeoutId = setTimeout(
              () => useOrderStore.getState().clearAll(),
              remaining,
            );
          }
        }
      },
      partialize: (s) => ({
        orderId: s.orderId,
        timestamp: s.timestamp,
        orderData: s.orderData,
        status: s.status,
      }),
    },
  ),
);
