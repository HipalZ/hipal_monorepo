import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const RestaurantCardSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="flex items-center p-3">
      <Skeleton className="w-12 h-12 mr-3 rounded-md" />
      <Skeleton className="w-32 h-5" />
    </div>
  </Card>
)

