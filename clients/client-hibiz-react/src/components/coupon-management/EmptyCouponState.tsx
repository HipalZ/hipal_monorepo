import { memo } from "react"
import { Ticket, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type EmptyCouponStateProps = {
  hasFilters: boolean
  onCreateClick: () => void
}

const EmptyCouponState = ({ hasFilters, onCreateClick }: EmptyCouponStateProps) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Ticket className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Coupons Found</h3>
        <p className="text-sm text-gray-500 mb-4">
          {hasFilters
            ? "No coupons match your search criteria. Try adjusting your filters."
            : "You haven't created any coupons yet. Create your first coupon to get started."}
        </p>
        <Button onClick={onCreateClick}>
          <Plus size={16} className="mr-2" />
          Create New Coupon
        </Button>
      </CardContent>
    </Card>
  )
}

export default memo(EmptyCouponState)
