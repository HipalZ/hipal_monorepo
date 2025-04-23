import { useState, useCallback,type FC } from "react"
import { useParams } from "react-router-dom"
import MemoizedHeader from "@/components/molecules/header"
import DayConfigList from "@/components/business-hours/DayConfigList"
import { Calendar, Clock, AlertTriangle, CalendarDays, ClockIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  useGetBusinessDayConfigs,
  useToggleAllDays,
  useToggleDay,
  useUpdateBusinessDayConfig,
} from "@/hooks/useBusinessDayConfig"
import type { UpdateBusinessDayConfigPayload } from "@/components/types/business-day-config"
import useBusinessData from "@/components/store/useBusinessData"
import CapacityManager from "@/components/business-hours/CapacityManager"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// 3D Icon component
const Icon3D = ({ icon: Icon, color = "primary", size = 20 }: { icon: any; color?: string; size?: number }) => {
  return (
    <div className="relative z-0 text-primary">
      <Icon size={size} strokeWidth={2} />
    </div >
  )
}

/**
 * Main page component for Everyday Booking configuration
 */
const Everyday = () => {
  // Get businessId from URL params
  const { businessId } = useParams<{ businessId: string }>()
  const businessData = useBusinessData((state) => state.businessData)

  // Local UI state for showing a loading overlay during updates
  const [isActionInProgress, setIsActionInProgress] = useState(false)

  // Use the business day config hooks for API calls
  const { data: businessDayConfigs, isLoading: isLoadingConfigs } = useGetBusinessDayConfigs(businessId)
  const { toggleAllDays, isToggling: isTogglingAllDays } = useToggleAllDays()
  const { toggleDay, isToggling: isTogglingDay } = useToggleDay()
  const { updateBusinessDayConfig, isUpdating } = useUpdateBusinessDayConfig()

  const handleToggleAllDays = useCallback(async () => {
    if (businessId) {
      setIsActionInProgress(true)
      try {
        await toggleAllDays(businessId)
      } finally {
        setIsActionInProgress(false)
      }
    }
  }, [businessId, toggleAllDays])

  const handleToggleDay = useCallback(
    async (businessId: string, dayOfWeek: number) => {
      setIsActionInProgress(true)
      try {
        await toggleDay({ businessId, dayOfWeek })
      } finally {
        setIsActionInProgress(false)
      }
    },
    [toggleDay],
  )

  /**
   * Update a day configuration
   */
  const handleUpdateConfig = useCallback(
    async (businessId: string, payload: UpdateBusinessDayConfigPayload) => {
      setIsActionInProgress(true)
      try {
        await updateBusinessDayConfig({ businessId, payload })
      } finally {
        setIsActionInProgress(false)
      }
    },
    [updateBusinessDayConfig],
  )

  // Check if any day is open
  const anyDayOpen = businessDayConfigs.some((config) => config.isOpen)

  // Determine if any loading state is active
  const showLoading = isLoadingConfigs || isTogglingAllDays || isTogglingDay || isUpdating || isActionInProgress

  return (
    <main className="min-h-screen bg-gray-50 pb-[10rem]">
      {/* Header */}
      <header className="linear_gradient_background">
        <MemoizedHeader title="Everyday Booking" />
      </header>

      {/* Main content */}
      <div className="container px-4 py-8 mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <motion.div
              className="flex items-center justify-center shadow-lg w-14 h-14 rounded-xl bg-primary/10"
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
                <Icon3D icon={CalendarDays} size={24} />
              </motion.div>
            </motion.div>
            <div>
              <h1 className="mb-1 text-2xl font-bold text-gray-900">Business Hours</h1>
              <p className="max-w-2xl text-gray-600">
                Configure your business hours and closed intervals. Customers will only be able to book appointments
                during your open hours.
              </p>
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        <AnimatePresence>
          {showLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/5 backdrop-blur-[1px] z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-4 p-6 bg-white shadow-xl rounded-xl"
              >
                <div className="w-8 h-8 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
                <p className="font-medium text-gray-700">Updating business hours...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="flex flex-col gap-4 mb-6 md:flex-row">

          {/* Action bar */}
          <Card className="items-start flex-1 overflow-hidden shadow-md">
            <CardContent className="p-0">
              <div className="flex flex-col justify-between gap-4 px-5 pt-4 pb-4 lg:pb-0">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="flex items-center justify-center flex-shrink-0 w-12 h-12 shadow-md rounded-xl bg-primary/10"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      perspective: "1000px",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <motion.div
                      initial={{ rotateY: 0 }}
                      animate={{ rotateY: [0, 10, 0, -10, 0] }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 5,
                        ease: "easeInOut",
                      }}
                    >
                      <Icon3D icon={ClockIcon} size={22} />
                    </motion.div>
                  </motion.div>
                  <div>
                    <h3 className="text-base font-medium text-gray-800">Business Schedule</h3>
                    <p className="text-sm text-gray-500">
                      {anyDayOpen
                        ? `Your business is open ${businessDayConfigs.filter((c) => c.isOpen).length} days a week`
                        : "Your business is currently closed all days"}
                    </p>
                  </div>
                </div>
                <Button
                  variant={anyDayOpen ? "destructive" : "default"}
                  size="lg"
                  onClick={handleToggleAllDays}
                  disabled={showLoading}
                  className="h-12 px-5 shadow-md rounded-xl"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2">
                    {anyDayOpen ? (
                      <>
                        <Icon3D icon={AlertTriangle} color="red-600" />
                        <span className="ml-1">Close All Days</span>
                      </>
                    ) : (
                      <>
                        <Icon3D icon={Clock} />
                        <span className="ml-1">Open All Days</span>
                      </>
                    )}
                  </motion.div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Capacity manager */}
          <div className="items-start flex-1">

          {businessData && <CapacityManager businessId={businessId} currentCapacity={businessData.capacity || 0} />}
          </div>
        </section>

        {/* Day configuration list */}
        {businessDayConfigs.length > 0 ? (
          <DayConfigList
            configs={businessDayConfigs}
            businessId={businessId}
            onToggleDay={handleToggleDay}
            onUpdateConfig={handleUpdateConfig}
          />
        ) : !showLoading ? (
          <Card className="overflow-hidden shadow-md">
            <CardContent className="p-8 text-center">
              <motion.div
                className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full"
                whileHover={{ scale: 1.05, rotate: 5 }}
                animate={{
                  y: [0, -10, 0],
                  rotateZ: [0, 5, 0, -5, 0],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 5,
                  ease: "easeInOut",
                }}
              >
                <Icon3D icon={Calendar} size={30} />
              </motion.div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">No business hours configured</h3>
              <p className="max-w-md mx-auto text-gray-500">
                No business day configurations found. Please contact support to set up your initial configuration.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  )
}

export default Everyday
