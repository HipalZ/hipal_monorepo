import type { FC } from "react"
import { memo } from "react"
import { Phone } from "lucide-react"
import { FiCopy } from "react-icons/fi"
import { MdOutlineCall } from "react-icons/md"
import { cn, hideMiddleNumbers } from "@/lib/utils"
import type { PhoneActionsProps } from "./bill.types.ts"

const PhoneActions: FC<PhoneActionsProps> = memo(
  ({ customerPhone, customerName, isPhoneVerified, copyTick, onProtectedAction }) => {
    return (
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-gray-600" />
          <div className="flex items-center gap-2 flex-1">
            <p className="text-sm text-gray-700">
              {customerName} ({isPhoneVerified ? customerPhone : hideMiddleNumbers(customerPhone || "")})
            </p>
            {customerPhone && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className={cn(
                    "p-1 rounded text-xs",
                    copyTick ? "bg-green-100 text-green-600" : "bg-purple-100 text-purple-600",
                  )}
                  onClick={() => onProtectedAction("copy")}
                >
                  <FiCopy className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  className="p-1 rounded bg-blue-100 text-blue-600"
                  onClick={() => onProtectedAction("call")}
                >
                  <MdOutlineCall className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  },
)

PhoneActions.displayName = "PhoneActions"
export default PhoneActions
