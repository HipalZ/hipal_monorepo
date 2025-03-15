import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useAlertsStore } from "../store/useAlertStore"

export function EmptyAlerts() {
  const clearFilters = useAlertsStore((state) => state.clearFilters)

  return (
    <div className="bg-white rounded-lg p-8 text-center border border-gray-200 shadow-sm">
      <div className="text-gray-400 mb-2">
        <Search className="h-12 w-12 mx-auto opacity-50" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No alerts found</h3>
      <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
      <Button onClick={clearFilters} variant="outline">
        Clear filters
      </Button>
    </div>
  )
}

