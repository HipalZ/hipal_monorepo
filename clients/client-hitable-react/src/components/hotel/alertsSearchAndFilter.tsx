import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, Package, ListFilter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAlertsStore } from "../store/useAlertStore"

export function AlertsSearchAndFilter() {
  const {
    searchQuery,
    setSearchQuery,
    selectedRooms,
    selectedServices,
    selectedStatuses,
    toggleRoomFilter,
    toggleServiceFilter,
    toggleStatusFilter,
    clearFilters,
    hasActiveFilters,
    getUniqueRooms,
    getUniqueServices,
    filteredAlerts,
  } = useAlertsStore()

  const uniqueRooms = getUniqueRooms()
  const uniqueServices = getUniqueServices()
  const statusOptions = ["CREATED", "ACCEPTED", "REJECTED", "DELIVERED"]

  return (
    <div className="mb-6 bg-white rounded-lg border p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">Alerts</h1>
        {/* Results count */}
        <div className="flex flex-col w-full sm:w-auto gap-3">
          {/* Search bar - full width on mobile */}
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search room, service..."
              className="pl-9 w-full border-blue-200 focus-visible:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {/* Filter buttons - scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="whitespace-nowrap">
                  <Filter className="h-4 w-4 sm:mr-2" />
                  <span>Rooms</span>
                  {selectedRooms?.length > 0 && (
                    <span className="ml-1 w-5 h-5 rounded-full bg-gray-200 text-xs flex items-center justify-center">
                      {selectedRooms?.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {uniqueRooms.map((room) => (
                  <DropdownMenuCheckboxItem
                    key={room}
                    checked={selectedRooms.includes(room)}
                    onCheckedChange={() => toggleRoomFilter(room)}
                  >
                    Room {room}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="whitespace-nowrap">
                  <Package className="h-4 w-4 sm:mr-2" />
                  <span>Services</span>
                  {selectedServices.length > 0 && (
                    <span className="ml-1 w-5 h-5 rounded-full bg-gray-200 text-xs flex items-center justify-center">
                      {selectedServices.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {uniqueServices.map((service) => (
                  <DropdownMenuCheckboxItem
                    key={service.id}
                    checked={selectedServices.includes(service.id)}
                    onCheckedChange={() => toggleServiceFilter(service.id)}
                  >
                    {service.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="whitespace-nowrap">
                  <ListFilter className="h-4 w-4 sm:mr-2" />
                  <span>Status</span>
                  {selectedStatuses.length > 0 && (
                    <span className="ml-1 w-5 h-5 rounded-full bg-gray-200 text-xs flex items-center justify-center">
                      {selectedStatuses.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {statusOptions.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={selectedStatuses.includes(status)}
                    onCheckedChange={() => toggleStatusFilter(status)}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700 whitespace-nowrap"
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>
      </div>
      <span className="my-4 text-sm text-black">
        {filteredAlerts?.length} {filteredAlerts?.length === 1 ? "alert" : "alerts"} found
      </span>

      {/* Active filters display */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedRooms.map((room) => (
            <Badge key={room} variant="secondary" className="flex items-center gap-1">
              Room {room}
              <button
                type="button"
                onClick={() => toggleRoomFilter(room)}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {selectedServices.map((serviceId) => {
            const service = uniqueServices.find((s) => s.id === serviceId)
            return (
              <Badge key={serviceId} variant="secondary" className="flex items-center gap-1">
                {service?.name}
                <button
                  type="button"
                  onClick={() => toggleServiceFilter(serviceId)}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}

          {selectedStatuses.map((status) => (
            <Badge key={status} variant="secondary" className="flex items-center gap-1">
              {status}
              <button
                type="button"
                onClick={() => toggleStatusFilter(status)}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {searchQuery}
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

