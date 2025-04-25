
import { useState, useCallback, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, PlusCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { Coupon, CouponCreatePayload, CouponUpdatePayload } from "@/hooks/useBusinessCoupons"
import AdvancedBottomButton from "../atom/bottomButton/advancedBottomButton"

// Import smaller components
import CouponCard from "./CouponCard"
import CouponFilterControls from "./CouponFilterControls"
import EmptyCouponState from "./EmptyCouponState"
import CouponHeader from "./CouponHeader"
import CouponFormModal from "./CouponFormModal"
import CouponDetailsModal from "./CouponDetailsModal.tsx"

type CouponListProps = {
  coupons: Coupon[]
  businessId: string
  isLoading: boolean
  onCreateCoupon: (payload: CouponCreatePayload) => Promise<void>
  onUpdateCoupon: (couponId: string, payload: CouponUpdatePayload) => Promise<void>
  isCreating: boolean
  isUpdating: boolean
}

const CouponList = ({
  coupons,
  businessId,
  isLoading,
  onCreateCoupon,
  onUpdateCoupon,
  isCreating,
  isUpdating,
}: CouponListProps) => {
  // State
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "percentage" | "amount">("all")
  const [filterHasAllocations, setFilterHasAllocations] = useState<"all" | "yes" | "no">("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [detailCoupon, setDetailCoupon] = useState<Coupon | null>(null)
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false)

  // Hooks
  const isMobile = useMediaQuery("(max-width: 640px)")

  // Memoized callbacks
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  const handleFilterTypeChange = useCallback((value: string) => {
    setFilterType(value as "all" | "percentage" | "amount")
  }, [])

  const handleAllocationFilterChange = useCallback((value: string) => {
    setFilterHasAllocations(value as "all" | "yes" | "no")
  }, [])

  const handleCreateCoupon = useCallback(
    async (formData: CouponCreatePayload) => {
      await onCreateCoupon(formData)
      setIsCreateModalOpen(false)
    },
    [onCreateCoupon],
  )

  const handleEditCoupon = useCallback(
    async (couponId: string, formData: CouponUpdatePayload) => {
      if (editingCoupon) {
        await onUpdateCoupon(couponId, formData)
        setEditingCoupon(null)
      }
    },
    [editingCoupon, onUpdateCoupon],
  )

  const startEditingCoupon = useCallback((coupon: Coupon) => {
    setEditingCoupon(coupon)
  }, [])

  const viewCouponDetails = useCallback((coupon: Coupon) => {
    setDetailCoupon(coupon)
  }, [])

  const toggleFilter = useCallback(() => {
    setIsFilterCollapsed((prev) => !prev)
  }, [])

  // Memoized filtered coupons
  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType =
      filterType === "all" ||
      (filterType === "percentage" && coupon.config.discountType === "PERCENTAGE") ||
      (filterType === "amount" && coupon.config.discountType === "AMOUNT")

    // Check if coupon has allocations
    const hasAllocations = coupon.isActive // Replace with actual allocation check
    const matchesAllocation =
      filterHasAllocations === "all" ||
      (filterHasAllocations === "yes" && hasAllocations) ||
      (filterHasAllocations === "no" && !hasAllocations)

    return matchesSearch && matchesType && matchesAllocation
  })

  // Check if any filters are applied
  const hasFilters = searchTerm !== "" || filterType !== "all" || filterHasAllocations !== "all"

  return (
    <div>
      {/* Filters - Desktop with collapsible functionality */}
      <div className="hidden sm:block sticky top-4 z-30 mb-5">
        <Card className="shadow-sm overflow-hidden">
          <div
            className="flex items-center justify-between p-3 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            onClick={toggleFilter}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                toggleFilter()
              }
            }}
            role="button"
          >
            <div className="flex items-center gap-2">
              <motion.div
                className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Filter size={16} className="text-primary" />
              </motion.div>
              <h3 className="text-sm font-medium text-gray-800">Filter Coupons</h3>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <motion.div animate={{ rotate: isFilterCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M18 15L12 9L6 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            </Button>
          </div>

          <AnimatePresence initial={false}>
            {!isFilterCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent className="px-4 pb-4 border-t border-gray-100">
                  <CouponFilterControls
                    searchTerm={searchTerm}
                    filterType={filterType}
                    filterHasAllocations={filterHasAllocations}
                    onSearchChange={handleSearchChange}
                    onFilterTypeChange={handleFilterTypeChange}
                    onAllocationFilterChange={handleAllocationFilterChange}
                  />
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>

      {/* Filters - Mobile */}
      {isMobile && (
        <div className="fixed z-40 bottom-4 right-4 sm:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" className="w-12 h-12 rounded-full shadow-lg bg-primary hover:bg-primary/90">
                <Filter size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[50vh] rounded-t-xl pt-4">
              <div className="flex flex-col h-full">
                <div className="px-1 pb-2 text-sm font-medium">Filter Coupons</div>
                <div className="flex-1 pr-4 -mr-4 pb-16">
                  <CouponFilterControls
                    searchTerm={searchTerm}
                    filterType={filterType}
                    filterHasAllocations={filterHasAllocations}
                    onSearchChange={handleSearchChange}
                    onFilterTypeChange={handleFilterTypeChange}
                    onAllocationFilterChange={handleAllocationFilterChange}
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Coupon list */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <EmptyCouponState hasFilters={hasFilters} onCreateClick={() => setIsCreateModalOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence initial={false}>
            {filteredCoupons.map((coupon) => (
              <motion.div
                key={coupon._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <CouponCard coupon={coupon} onEdit={startEditingCoupon} onView={viewCouponDetails} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit coupon modal */}
      <CouponFormModal
        isOpen={isCreateModalOpen || !!editingCoupon}
        onClose={() => {
          setIsCreateModalOpen(false)
          setEditingCoupon(null)
        }}
        onSubmit={(data) => {
          if (editingCoupon) {
            // For edit mode, we need the coupon ID
            return handleEditCoupon(editingCoupon._id, data)
          } else {
            // For create mode
            return handleCreateCoupon(data)
          }
        }}
        isSubmitting={editingCoupon ? isUpdating : isCreating}
        editingCoupon={editingCoupon}
        mode={editingCoupon ? "edit" : "create"}
      />

      {/* Coupon detail modal */}
      <CouponDetailsModal coupon={detailCoupon} onClose={() => setDetailCoupon(null)} onEdit={startEditingCoupon} />

      {/* Mobile create button - using AdvancedBottomButton */}
      {!isCreateModalOpen && !editingCoupon && !detailCoupon && (
        <AdvancedBottomButton
          fixed={true}
          maxWidth="30rem"
          buttons={[
            {
              text: "Create New Coupon",
              onClick: () => setIsCreateModalOpen(true),
              disable: isCreating || isUpdating,
              icon: <PlusCircle className="w-4 h-4" />,
              className: "rounded-md w-full",
            },
          ]}
        />
      )}
    </div>
  )
}

export default memo(CouponList)
