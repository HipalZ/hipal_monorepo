import { memo, useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FiCopy } from "react-icons/fi"
import { MdOutlineCall } from "react-icons/md"
import { cn } from "@/lib/utils"
import DiscountModal from "./billModals/DiscountModal.tsx"
import ServiceChargeModal from "./billModals/ServiceChargeModal.tsx"
import type { IBillData } from "@/components/types/hiClientzData.ts"
import { useOrderStore } from "@/components/store/useOrderData.ts"
import PasswordModal from "../cartItem/PasswordModal.tsx"

interface BillOptionsProps {
  data: IBillData
}

const MemoBillOptions = ({ data }: BillOptionsProps) => {
  const activeModal = useOrderStore((s) => s.activeModal)
  const setActiveModal = useOrderStore((s) => s.setActiveModal)
  const setShowMoreOption = useOrderStore((s) => s.setShowMoreOption)

  // Password protection states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [pendingAction, setPendingAction] = useState<"copy" | "call" | null>(null)
  const [copyTick, setCopyTick] = useState(false)

  const closeModal = useCallback(() => {
    setActiveModal("options")
    setShowMoreOption(false)
  }, [setActiveModal, setShowMoreOption])

  // Phone protection functions
  const hideMiddleNumbers = useCallback((phone: string) => {
    if (!phone) return ""
    if (phone.length <= 2) return phone
    const firstPart = phone.slice(0, 2)
    const lastPart = phone.slice(-1)
    return `${firstPart}****${lastPart}`
  }, [])

  const handleProtectedAction = useCallback(
    (action: "copy" | "call") => {
      if (isPhoneVerified) {
        executePhoneAction(action)
      } else {
        setPendingAction(action)
        setIsModalOpen(true)
      }
    },
    [isPhoneVerified],
  )

  const executePhoneAction = useCallback(
    (action: "copy" | "call") => {
      const phone = data.customerPhone
      if (!phone) return

      if (action === "copy") {
        navigator.clipboard.writeText(phone).then(() => {
          setCopyTick(true)
          setTimeout(() => setCopyTick(false), 3000)
        })
      } else if (action === "call") {
        window.location.href = `tel:+91${phone}`
      }
    },
    [data.customerPhone],
  )

  const handlePasswordVerify = useCallback(
    (isCorrect: boolean) => {
      if (isCorrect) {
        setIsPhoneVerified(true)
        if (pendingAction) {
          executePhoneAction(pendingAction)
          setPendingAction(null)
        }
        // Auto-lock after 5 minutes for security
        setTimeout(() => setIsPhoneVerified(false), 5 * 60 * 1000)
      }
    },
    [pendingAction, executePhoneAction],
  )

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    setPendingAction(null)
  }, [])

  return (
    <>
      {activeModal === "options" && (
        <>
          <div className="absolute top-0 z-50 rounded-t-xl p-4 bg-white w-full flex justify-between items-center">
            <h2 className="text-xl font-semibold -mt-4">Bill Options</h2>
            <section className="mt-4">
              <p className="text-sm text-gray-600">Table: {data.tableName}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">
                  {data.customerName} (
                  {isPhoneVerified ? data.customerPhone : hideMiddleNumbers(data.customerPhone || "")})
                </p>
                {data.customerPhone && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className={cn(
                        "p-1 rounded text-xs",
                        copyTick ? "bg-green-100 text-green-600" : "bg-purple-100 text-purple-600",
                      )}
                      onClick={() => handleProtectedAction("copy")}
                    >
                      <FiCopy className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      className="p-1 rounded bg-blue-100 text-blue-600"
                      onClick={() => handleProtectedAction("call")}
                    >
                      <MdOutlineCall className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
          <div className="space-y-4 px-4 pt-[5rem] pb-[5rem] h-[90dvh] overflow-auto">
            {/* Current Bill Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Bill Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">SubTotal: ₹{data.subTotal}</p>
                    <p className="font-medium">GST: ₹{data.gst}</p>
                    <p className="font-medium">Service Charge: ₹{data.serviceCharge}</p>
                  </div>
                  <div>
                    <p className="font-medium">Discount: ₹{data.discount}</p>
                    <p className="font-medium">Claimed Coins: ₹{data.claimedCoins}</p>
                    <p className="font-medium text-lg">Total: ₹{data.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Action Buttons */}
            <div className="space-y-3">
              <Button onClick={() => setActiveModal("discount")} className="h-12 w-full">
                <div className="flex justify-between items-center w-full">
                  <p className="font-medium">Add or Remove Discount</p>
                  <p className="text-xs">Current: ₹{data.discount}</p>
                </div>
              </Button>
              <Button onClick={() => setActiveModal("serviceCharge")} className="h-12 w-full">
                <div className="flex justify-between items-center w-full">
                  <p className="font-medium">Add or Remove Service Charge</p>
                  <p className="text-xs">Current: ₹{data.serviceCharge}</p>
                </div>
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {activeModal === "discount" && <DiscountModal data={data} onClose={closeModal} />}
      {activeModal === "serviceCharge" && <ServiceChargeModal data={data} onClose={closeModal} />}

      {/* Password Modal */}
      <PasswordModal isOpen={isModalOpen} onVerify={handlePasswordVerify} onClose={handleModalClose} />
    </>
  )
}

const BillOptions = memo(MemoBillOptions)
export default BillOptions
