import { useState, useMemo, memo } from "react"
import { Clock, Package, Search, User, Home, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useAlertsColors, type SortOption, useFormatTimes } from "../utils/helpersHotel";
import { useHistoryAlerts } from "@/hooks/useHotelApis"
import { useHotelStore } from "../store/useHotelStore";

const MemoHistoryHotel = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const { historyData } = useHistoryAlerts()
  const { getSortLabel } = useAlertsColors()
  const { formatTimestamp, formatDate } = useFormatTimes()
  const { setCartData, setOpenCartModal } = useHotelStore()

  const serviceTags = [
    "Room Service",
    "Cleaning",
    "Laundry",
    "Food Delivery",
    "Maintenance"
  ];


  // Toggle accordion item
  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  // Filter history items based on search term
  const filteredHistory = useMemo(() => {
    if (!historyData) return []

    return historyData.filter(
      (item) =>
        item?.roomId?.name.toLowerCase().includes(searchTerm?.toLowerCase()) ||
        item?.serviceIds?.some((service) => service?.name?.toLowerCase().includes(searchTerm?.toLowerCase())) ||
        item?.createdBy?.name.toLowerCase().includes(searchTerm?.toLowerCase()),
    )
  }, [historyData, searchTerm])

  // Sort filtered history items
  const sortedHistory = useMemo(() => {
    if (!filteredHistory) return []

    return [...filteredHistory].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.createdAt - a.createdAt
        case "oldest":
          return a.createdAt - b.createdAt
        case "roomAsc":
          return a.roomId.name.localeCompare(b.roomId.name)
        case "roomDesc":
          return b.roomId.name.localeCompare(a.roomId.name)
        case "fastest":
          return a.deliveredAt - a.createdAt - (b.deliveredAt - b.createdAt)
        case "slowest":
          return b.deliveredAt - b.createdAt - (a.deliveredAt - a.createdAt)
        default:
          return 0
      }
    })
  }, [filteredHistory, sortBy])


  // Calculate time difference between timestamps in minutes
  const getTimeDifference = (start: number, end: number) => {
    const diffMs = end - start
    const diffMins = Math.round(diffMs / 60000)
    if (diffMins >= 1440) {
      const diffDays = Math.floor(diffMins / 1440)
      return `${diffDays} day${diffDays > 1 ? "s" : ""}`
    }
    if (diffMins >= 60) {
      const diffHours = Math.floor(diffMins / 60)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""}`
    }
    return `${diffMins} minute${diffMins > 1 ? "s" : ""}`
  }

  const viewCart = (cart) => {
    setCartData(cart)
    setOpenCartModal(true)
  }

  return (
    <div className="mx-auto px-4 py-6">
      {/* Header with search and filters */}
      <div className="mb-6 bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Service History
          </h1>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search room, service..."
                className="pl-9 border-blue-200 focus-visible:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 border-blue-200">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Service Type</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {serviceTags.map((tag) => (
                  <DropdownMenuItem
                    key={tag}
                    onClick={() => setSortBy(tag)}
                    className={sortBy === tag ? "bg-blue-50" : ""}
                  >
                    {tag}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="text-sm text-gray-500 flex items-center gap-1 mt-4">
          <Filter className="h-3.5 w-3.5" />
          <span>Sorting by: </span>
          <span className="font-medium text-blue-600">{getSortLabel(sortBy)}</span>
          <span className="mx-2">•</span>
          <span>{sortedHistory?.length} results</span>
        </div>
      </div>

      {/* History items grid */}
      <div className="pb-20 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {sortedHistory?.map((item) => (
          <div
            key={item._id}
            className="rounded-lg overflow-hidden transition-all duration-200"
          >
            {/* Header - Always visible */}
            <section
              className="p-3 border flex justify-between items-center cursor-pointer bg-gray-100"
              onClick={() => toggleItem(item._id)}
              onKeyDown={(e) => e.key === "Enter" && toggleItem(item._id)}
            >
              <article className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white">
                  <Home className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">Room:- {item?.roomId?.name}</div>
                  <div className="text-xs text-gray-600">{formatDate(item?.createdAt)}</div>
                </div>
              </article>

              <article className="flex items-center gap-2">
                <h1 className="font-medium">{item?.serviceIds[0].name}</h1>
                {expandedItems.has(item._id) ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </article>
            </section>

            {/* Accordion content */}
            <div
              className={`overflow-hidden transition-all duration-300 ${expandedItems.has(item._id) ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                }`}
            >
              <div className="p-4 border-t">
                {/* Service */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 text-white">
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <h1>{item?.serviceIds.map((service) => service?.name).join(", ")}</h1>
                      <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <User className="h-3.5 w-3.5" />
                        Requested by {item?.createdBy?.name}
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => viewCart(item?.cart)} variant="outline" className="text-sm mt-1">
                    View Cart
                  </Button>
                </div>

                {/* Timeline */}
                <div className="pl-8 relative">
                  {/* Vertical line */}
                  <div className="absolute left-[9px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-indigo-300 to-green-300" />

                  {/* Created */}
                  <div className="relative mb-4 group">
                    <div className="absolute left-[-8px] w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 border-2 border-white group-hover:scale-110 transition-transform" />
                    <div className="pl-4 group-hover:translate-x-1 transition-transform">
                      <div className="text-sm font-medium">Request Created</div>
                      <div className="text-xs text-gray-600">{formatTimestamp(item.createdAt)}</div>
                    </div>
                  </div>

                  {/* Accepted */}
                  <div className="relative mb-4 group">
                    <div className="absolute left-[-8px] w-4 h-4 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-500 border-2 border-white group-hover:scale-110 transition-transform" />
                    <div className="pl-4 group-hover:translate-x-1 transition-transform">
                      <div className="text-sm font-medium">Request Accepted</div>
                      <div className="text-xs text-gray-600">
                        {formatTimestamp(item?.acceptedAt)} •
                        <span className="ml-1">{getTimeDifference(item?.createdAt, item?.acceptedAt)} after request</span>
                      </div>
                      <div className="text-xs text-gray-600">by {item?.acceptedBy?.name}</div>
                    </div>
                  </div>

                  {/* Delivered */}
                  <div className="relative group">
                    <div className="absolute left-[-8px] w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-green-500 border-2 border-white group-hover:scale-110 transition-transform" />
                    <div className="pl-4 group-hover:translate-x-1 transition-transform">
                      <div className="text-sm font-medium">Service Delivered</div>
                      <div className="text-xs text-gray-600">
                        {formatTimestamp(item?.deliveredAt)} •
                        <span className="ml-1">
                          {getTimeDifference(item?.acceptedAt, item?.deliveredAt)} after acceptance
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">by {item?.deliveredBy?.name}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-y p-3 text-sm flex justify-between items-center">
                <div className="text-gray-600">
                  <span className="font-medium">Time to complete:</span> {getTimeDifference(item?.createdAt, item?.deliveredAt)}
                </div>
                <Badge variant="outline" className="bg-white border-blue-200">
                  ID: {item._id.slice(-6)}
                </Badge>
              </div>
            </div>
          </div>
        ))}

        {sortedHistory?.length === 0 && (
          <div className="text-center py-12 border rounded-lg bg-white shadow-sm md:col-span-2 xl:col-span-3 2xl:col-span-4">
            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-3" />
            <h3 className="text-xl font-medium text-gray-700">No history found</h3>
            <p className="text-gray-500 mt-1 max-w-md mx-auto">
              {searchTerm
                ? `No results found for "${searchTerm}". Try a different search term.`
                : "No service history available for the selected filters."}
            </p>
            {searchTerm && (
              <Button variant="outline" className="mt-4 border-blue-200" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const HistoryHotel = memo(MemoHistoryHotel)
export default HistoryHotel

