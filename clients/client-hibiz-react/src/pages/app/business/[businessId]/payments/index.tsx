import { lazy, memo, Suspense, useCallback, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaArrowLeft } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import useBusinessData from "@/components/store/useBusinessData"
import PaymentNavbar from "@/components/templates/menu/sideNavbaar/paymentNavBar"
import { cn } from "@/components/utils/helper"
import Npc from "@/components/templates/payment/Npc"
import Modes from "@/components/templates/payment/modes"
import LoadingSpinner from "@/components/atom/loadingSpinner"

const DateRangePicker = lazy(() => import("@/components/molecules/dateRangePicker"))
const MemoizedHeader = lazy(() => import("@/components/molecules/header"))
const Overview = lazy(() => import("@/components/templates/payment/overview"))
const PaymentSales = lazy(() => import("@/components/templates/payment/sales"))
const Dues = lazy(() => import("@/components/templates/payment/dues"))

enum PaymentTabs {
  Overview = "Overview",
  Sales = "Sales",
  Dues = "Dues",
  Npc = "Npc",
  Modes = "Modes"
}

const Payments = () => {
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = useState<PaymentTabs>(PaymentTabs.Overview)
  const businessData = useBusinessData((s) => s.businessData)

  const sidebarItems = [
    { text: PaymentTabs.Overview, onClick: () => setSelectedTab(PaymentTabs.Overview) },
    { text: PaymentTabs.Sales, onClick: () => setSelectedTab(PaymentTabs.Sales) },
    { text: PaymentTabs.Dues, onClick: () => setSelectedTab(PaymentTabs.Dues) },
    { text: PaymentTabs.Npc, onClick: () => setSelectedTab(PaymentTabs.Npc) },
    { text: PaymentTabs.Modes, onClick: () => setSelectedTab(PaymentTabs.Modes) }
  ]

  const handleBack = useCallback(() => {
    navigate(`/app/business/${businessData?._id}`)
  }, [navigate, businessData?._id])

  return (
    <main className="relative">
      <Suspense fallback={<LoadingSpinner />}>

        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn("sticky top-0 z-50 w-full bg-[#f4f4f4]")}
        >
          <MemoizedHeader title="Payments" leftIcon={<FaArrowLeft />} onBack={handleBack} />
        </motion.section>
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>

        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="sticky top-[4rem] z-50 flex justify-between w-full px-4 space-x-4 text-sm bg-white mobile-only"
        >
          {sidebarItems.map((item) => (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "pb-3 pt-4 bg-white ",
                selectedTab?.toLowerCase() === item.text.toLowerCase()
                  ? "border-b-2 border-[#15BBB3] transition-all text-[#15BBB3]"
                  : "",
              )}
              key={item.text}
              type="button"
              onClick={item.onClick}
            >
              {item.text}
            </motion.button>
          ))}
        </motion.nav>
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <PaymentNavbar items={sidebarItems} selectedNavItem={selectedTab} />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        {(selectedTab === PaymentTabs.Overview || selectedTab === PaymentTabs.Sales) ? (<DateRangePicker />) : null}
      </Suspense>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >

          <Suspense fallback={<LoadingSpinner />}>

            {selectedTab === PaymentTabs.Overview && <Overview />}
            {selectedTab === PaymentTabs.Sales && <PaymentSales />}
            {selectedTab === PaymentTabs.Dues && <Dues />}
            {selectedTab === PaymentTabs.Npc && <Npc />}
            {selectedTab === PaymentTabs.Modes && <Modes />}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </main>
  )
}

const MemoPayments = memo(Payments)
export default MemoPayments

