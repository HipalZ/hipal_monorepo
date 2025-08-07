import type { IBillData } from "@/components/types/hiClientzData.ts"

export interface ActionHistoryItem {
  type: string
  user: string
  details: string
  reason?: string
  color: string
  badgeColor: string
}

export interface BillComponentProps {
  currentBill: IBillData
  screenSize: string
}

export interface SplitBillGridProps {
  billData: IBillData[]
  onSelectBill: (bill: IBillData) => void
  onBack: () => void
  screenSize: string
}

export interface PhoneActionsProps {
  customerPhone?: string
  customerName?: string
  isPhoneVerified: boolean
  copyTick: boolean
  onProtectedAction: (action: "copy" | "call") => void
}

export interface BillSummaryProps {
  currentBill: IBillData
  existingLoyalty: any
  onTriggerAddCoinz: () => void
  onClickKey: (key: string) => void
  onRemoveClaimedCoins: () => void
  onRemoveCoupon: () => void
  onOpenServiceChargeModal: () => void
  onSetActiveModal: (modal: string) => void
}
