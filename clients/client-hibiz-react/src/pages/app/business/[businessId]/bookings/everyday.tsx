import { useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import MemoizedHeader from "@/components/molecules/header"
import DayConfigList from "@/components/business-hours/DayConfigList"
import { Calendar, Clock, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import { useGetBusinessDayConfigs, useToggleAllDays, useToggleDay, useUpdateBusinessDayConfig } from "@/hooks/useBusinessDayConfig"
import type { UpdateBusinessDayConfigPayload } from "@/components/types/business-day-config"

/**
 * Main page component for Everyday Booking configuration
 */
const Everyday: React.FC = () => {
  // Get businessId from URL params
  const { businessId = "" } = useParams<{ businessId: string }>()

  // Local UI state for showing a loading overlay during updates
  const [isActionInProgress, setIsActionInProgress] = useState(false)

  // Use the business day config hooks for API calls
  const { data: businessDayConfigs, isLoading: isLoadingConfigs } = useGetBusinessDayConfigs(businessId)
  const { toggleAllDays, isToggling: isTogglingAllDays } = useToggleAllDays()
  const { toggleDay, isToggling: isTogglingDay } = useToggleDay()
  const { updateBusinessDayConfig, isUpdating } = useUpdateBusinessDayConfig()

  /**
   * Toggle all days open/closed
   */
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

  /**
   * Toggle a specific day open/closed
   */
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
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <Calendar size={20} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Business Hours</h1>
          </div>
          <p className="max-w-2xl text-gray-600">
            Configure your business hours and closed intervals. Customers will only be able to book appointments during
            your open hours.
          </p>
        </div>

        {/* Loading indicator */}
        {showLoading && (
          <div className="fixed inset-0 bg-black/5 backdrop-blur-[1px] z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-xl"
            >
              <div className="w-8 h-8 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
              <p className="font-medium text-gray-700">Updating business hours...</p>
            </motion.div>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between p-4 mb-6 bg-white border border-gray-100 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            <span className="text-sm font-medium text-gray-700">
              {anyDayOpen
                ? `Your business is open ${businessDayConfigs.filter((c) => c.isOpen).length} days a week`
                : "Your business is currently closed all days"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleAllDays}
            disabled={showLoading}
            className={`px-4 py-2 rounded-md transition-all ${
              anyDayOpen
                ? "bg-red-50 text-red-600 hover:bg-red-100 disabled:bg-red-50/50 disabled:text-red-300"
                : "bg-green-50 text-green-600 hover:bg-green-100 disabled:bg-green-50/50 disabled:text-green-300"
            } font-medium text-sm flex items-center gap-2`}
          >
            {anyDayOpen ? (
              <>
                <AlertTriangle size={16} />
                Close All Days
              </>
            ) : (
              <>
                <Clock size={16} />
                Open All Days
              </>
            )}
          </button>
        </div>

        {/* Day configuration list */}
        {businessDayConfigs.length > 0 ? (
          <DayConfigList
            configs={businessDayConfigs}
            businessId={businessId}
            onToggleDay={handleToggleDay}
            onUpdateConfig={handleUpdateConfig}
          />
        ) : !showLoading ? (
          <div className="p-8 text-center bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
              <Calendar size={24} className="text-gray-400" />
            </div>
            <h3 className="mb-1 text-lg font-medium text-gray-900">No business hours configured</h3>
            <p className="max-w-md mx-auto text-gray-500">
              No business day configurations found. Please contact support to set up your initial configuration.
            </p>
          </div>
        ) : null}
      </div>
    </main>
  )
}

export default Everyday
