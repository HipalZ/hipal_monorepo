import { memo } from "react"
import { motion } from "framer-motion"
import { Ticket, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

type CouponHeaderProps = {
  onCreateClick: () => void
  isDisabled: boolean
}

const CouponHeader = ({ onCreateClick, isDisabled }: CouponHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4">
        <motion.div
          className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 shadow-lg"
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          style={{
            perspective: "1000px",
            transformStyle: "preserve-3d",
          }}
        >
          <motion.div
            initial={{ rotateY: 0 }}
            animate={{ rotateY: [0, 15, 0, -15, 0] }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 6,
              ease: "easeInOut",
            }}
          >
            <div className="relative">
              <div className="absolute -right-1 -bottom-1 text-primary/20">
                <Ticket size={24} strokeWidth={1.5} />
              </div>
              <div className="relative z-10 text-primary">
                <Ticket size={24} strokeWidth={2} />
              </div>
            </div>
          </motion.div>
        </motion.div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Coupon Management</h1>
          <p className="text-gray-600 max-w-2xl">
            Create and manage discount coupons for your business. Allocate coupons to specific periods.
          </p>
        </div>
      </div>

      <Button onClick={onCreateClick} className="h-12 px-4 rounded-xl shadow-md" disabled={isDisabled}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2">
          <Plus size={18} />
          <span>Create Coupon</span>
        </motion.div>
      </Button>
    </div>
  )
}

export default memo(CouponHeader)
