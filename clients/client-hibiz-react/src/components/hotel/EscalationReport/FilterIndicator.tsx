import type { DashboardFilters } from "@/components/types/hotelTypes"
import { Button } from "@/components/ui/button"
import { Filter, Home, X } from "lucide-react"

interface FilterIndicatorProps {
    filters: DashboardFilters
}

export default function FilterIndicator({ filters }: FilterIndicatorProps) {
    const { activeServiceFilter, setActiveServiceFilter, activeRoomFilter, setActiveRoomFilter } = filters

    // If no filters are active, don't render anything
    if (!activeServiceFilter && !activeRoomFilter) return null

    return (
        <div className="flex flex-wrap gap-2">
            {/* Service filter indicator */}
            {activeServiceFilter && (
                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-md">
                    <Filter className="h-3 w-3" />
                    <span>
                        Service: <strong>{activeServiceFilter}</strong>
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 ml-2 hover:bg-blue-100"
                        onClick={() => setActiveServiceFilter(null)}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            )}

            {/* Room filter indicator */}
            {activeRoomFilter && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-md">
                    <Home className="h-3 w-3" />
                    <span>
                        Room: <strong>{activeRoomFilter}</strong>
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 ml-2 hover:bg-green-100"
                        onClick={() => setActiveRoomFilter(null)}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            )}

            {/* Clear all filters button - only show if multiple filters are active */}
            {activeServiceFilter && activeRoomFilter && (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                        setActiveServiceFilter(null)
                        setActiveRoomFilter(null)
                    }}
                >
                    Clear All Filters
                </Button>
            )}
        </div>
    )
}
