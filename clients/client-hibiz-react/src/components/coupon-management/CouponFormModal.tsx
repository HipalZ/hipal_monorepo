import { lazy, Suspense, memo } from "react"
import { Plus, Edit } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Coupon, CouponCreatePayload, CouponUpdatePayload } from "@/hooks/useBusinessCoupons"

// Lazy load the form component
const CouponForm = lazy(() => import("./CouponForm"))

type CouponFormModalProps = {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: CouponCreatePayload | CouponUpdatePayload) => Promise<void>
    isSubmitting: boolean
    editingCoupon: Coupon | null
    mode: "create" | "edit"
}

const CouponFormModal = ({ isOpen, onClose, onSubmit, isSubmitting, editingCoupon, mode }: CouponFormModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[100dvh] md:max-h-[85dvh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {mode === "create" ? (
                            <>
                                <Plus className="h-5 w-5" />
                                <span>Create New Coupon</span>
                            </>
                        ) : (
                            <>
                                <Edit className="h-5 w-5" />
                                <span>Edit Coupon</span>
                            </>
                        )}
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-1 pr-4 -mr-4 overflow-x-hidden overflow-y-auto h-[90dvh] pb-[10rem]">
                    <Suspense
                        fallback={
                            <div className="flex justify-center p-8">
                                <div className="w-8 h-8 border-4 rounded-full border-primary border-t-transparent animate-spin" />
                            </div>
                        }
                    >
                        <CouponForm
                            onSubmit={onSubmit}
                            onCancel={onClose}
                            isSubmitting={isSubmitting}
                            initialValues={
                                mode === "edit" && editingCoupon
                                    ? {
                                        name: editingCoupon.name,
                                        config: {
                                            value: editingCoupon.config.value,
                                            discountType: editingCoupon.config.discountType,
                                            upto: editingCoupon.config.upto,
                                        },
                                        bookingMeta: {
                                            baseCharge: editingCoupon.bookingMeta.baseCharge,
                                            redeemableCoverCharge: editingCoupon.bookingMeta.redeemableCoverCharge,
                                            minGuests: editingCoupon.bookingMeta.minGuests,
                                        },
                                    }
                                    : undefined
                            }
                        />
                    </Suspense>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

export default memo(CouponFormModal)
