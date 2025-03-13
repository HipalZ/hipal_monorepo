import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const MenuItemSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="p-3">
      <Skeleton className="w-3/4 h-5 mb-2" />
      <Skeleton className="w-1/2 h-4 mb-2" />
      <Skeleton className="w-1/4 h-4" />
    </div>
  </Card>
)

