import { memo } from "react"
import { Badge } from "@/components/ui/badge"

interface HeaderSectionProps {
  filteredCount: number
  totalCount: number
}

const HeaderSection = memo(({ filteredCount, totalCount }: HeaderSectionProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">Check-in Users</h1>
        <p className="text-muted-foreground">{filteredCount} users found</p>
      </div>
      <Badge variant="secondary" className="w-fit">
        Total: {totalCount}
      </Badge>
    </div>
  )
})

HeaderSection.displayName = "HeaderSection"

export default HeaderSection
