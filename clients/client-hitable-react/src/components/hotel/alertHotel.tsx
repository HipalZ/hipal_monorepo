import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  CheckCircle,
  XCircle,
  Package,
  User,
  Phone,
  CheckCheck,
  Loader2,
  ShoppingCart,
  Search,
  Filter,
  X,
} from "lucide-react";
import { FaArrowLeft } from "react-icons/fa"
import { formatDistanceToNow } from "date-fns"
import { useAlertsColors } from "../utils/helpersHotel"
import { useMutation } from "@tanstack/react-query"
import { useRespondAlerts, useRoomAlerts } from "@/hooks/useHotelApis"
import { useState, useCallback, useMemo } from "react"
import BottomPopUp from "../atoms/universalPopup"
import CartDetailsHotel from "./cartDetailsHotel"
import toast from "react-hot-toast"
import type { Alert } from "../types/hotelData"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const RoomAlertCard = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRooms, setSelectedRooms] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])

  const { respondAlert } = useRespondAlerts()
  const { mutateAsync } = useMutation({
    mutationFn: respondAlert,
  })
  const { borderColor } = useAlertsColors()
  const { alerts } = useRoomAlerts()

  const handleAction = useCallback(
    async (alertId: string, action: "ACCEPTED" | "REJECTED" | "DELIVERED") => {
      setIsLoading(action + alertId)
      try {
        await mutateAsync({ alertId, action })
        toast.success(`Alert ${action.toLowerCase()} successfully`)
      } catch (error) {
        toast.error("Failed to perform action")
      } finally {
        setIsLoading(null)
      }
    },
    [mutateAsync],
  )

  // Function to check if an alert has order items
  const hasOrderItems = useCallback((alert: Alert) => {
    return alert.cart && alert.cart.length > 0
  }, [])

  // Extract unique room numbers and services for filters
  const uniqueRooms = useMemo(() => {
    const rooms = alerts?.map((alert) => alert.roomId.name) || []
    return [...new Set(rooms)].sort()
  }, [alerts])

  const uniqueServices = useMemo(() => {
    const services =
      alerts?.flatMap((alert) => alert.serviceIds.map((service) => ({ id: service._id, name: service.name }))) || []

    // Remove duplicates by id
    const uniqueServicesMap = new Map()
    services?.forEach((service) => {
      if (!uniqueServicesMap.has(service.id)) {
        uniqueServicesMap.set(service.id, service)
      }
    })

    return Array.from(uniqueServicesMap.values())
  }, [alerts])

  const statusOptions = ["CREATED", "ACCEPTED", "REJECTED", "DELIVERED"]

  // Filter alerts based on search and filters
  const filteredAlerts = useMemo(() => {
    if (!alerts) return []

    return alerts.filter((alert) => {
      // Search filter
      const roomName = alert.roomId.name.toLowerCase()
      const guestName = alert.createdBy?.name.toLowerCase() || ""
      const serviceNames = alert.serviceIds.map((s) => s.name.toLowerCase()).join(" ")
      const searchLower = searchQuery.toLowerCase()

      const matchesSearch =
        roomName.includes(searchLower) || guestName.includes(searchLower) || serviceNames.includes(searchLower)

      // Room filter
      const matchesRoom = selectedRooms.length === 0 || selectedRooms.includes(alert.roomId.name)

      // Service filter
      const matchesService =
        selectedServices.length === 0 || alert.serviceIds.some((service) => selectedServices.includes(service._id))

      // Status filter
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(alert.alertProgress)

      return matchesSearch && matchesRoom && matchesService && matchesStatus
    })
  }, [alerts, searchQuery, selectedRooms, selectedServices, selectedStatuses])

  // Toggle filter functions
  const toggleRoomFilter = useCallback((room: string) => {
    setSelectedRooms((prev) => (prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room]))
  }, [])

  const toggleServiceFilter = useCallback((serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((s) => s !== serviceId) : [...prev, serviceId],
    )
  }, [])

  const toggleStatusFilter = useCallback((status: string) => {
    setSelectedStatuses((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }, [])

  const clearFilters = useCallback(() => {
    setSearchQuery("")
    setSelectedRooms([])
    setSelectedServices([])
    setSelectedStatuses([])
  }, [])

  const hasActiveFilters =
    searchQuery || selectedRooms.length > 0 || selectedServices.length > 0 || selectedStatuses.length > 0

  return (
    <div className="p-4">
      {/* Search and filter section */}
      <div className="mb-6 bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Alerts
          </h1>
          {/* Results count */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search room, service..."
                className="pl-9 border-blue-200 focus-visible:ring-blue-500"
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
            <div className="flex gap-2 hide-scrollbar overflow-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4" />
                    Rooms
                    {selectedRooms.length > 0 && (
                      <span className="ml-1 w-5 h-5 rounded-full bg-gray-200 text-xs flex items-center justify-center">
                        {selectedRooms.length}
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
                  <Button variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    Services
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
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Status
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

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="text-gray-500 hover:text-gray-700">
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
        <span className="mb-4 text-sm text-black">
          {filteredAlerts.length} {filteredAlerts.length === 1 ? "alert" : "alerts"} found
        </span>
        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedRooms.map((room) => (
              <Badge key={room} variant="secondary" className="flex items-center gap-1">
                Room {room}
                <button type="button" onClick={() => toggleRoomFilter(room)} className="ml-1 hover:bg-gray-200 rounded-full p-0.5">
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
                <button type="button" onClick={() => setSearchQuery("")} className="ml-1 hover:bg-gray-200 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Alert cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredAlerts.map((alert: Alert) => {
          const hasCart = hasOrderItems(alert)
          const timeAgo = formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })
          return (
            <Card
              key={alert?._id}
              className="border border-l-4 overflow-hidden hover:shadow-md transition-all duration-200"
              style={{
                borderLeftColor: borderColor(alert?.alertProgress),
              }}
            >
              {/* Primary information section */}
              <div className="p-4">
                {/* Room number and time */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold flex items-center">Room {alert?.roomId?.name}</h3>
                  <div className="text-xs text-gray-500">{timeAgo}</div>
                </div>

                {/* Services */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {alert?.serviceIds.map((service) => (
                    <Badge key={service._id} variant="outline" className="flex items-center gap-1">
                      <Package className="h-3.5 w-3.5" />
                      {service?.name}
                    </Badge>
                  ))}
                </div>

                {/* Order details button */}
                {hasCart && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full bg-indigo-400 text-white"
                    onClick={() => setShowOrderDetails(alert._id)}
                  >
                    <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                    Order Details
                  </Button>
                )}

                {/* Secondary information in accordion */}
                <Accordion type="single" collapsible className="mb-3">
                  <AccordionItem value="guest-info" className="border-b-0">
                    <AccordionTrigger className="py-2 text-sm text-gray-900 font-medium">
                      Guest Information
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Guest</div>
                            <div className="flex items-center">
                              <User className="h-3.5 w-3.5 text-gray-600 mr-1" />
                              <span className="font-medium">{alert?.createdBy?.name}</span>
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500 mb-1">Contact</div>
                            <div className="flex items-center">
                              <Phone className="h-3.5 w-3.5 text-gray-600 mr-1" />
                              <span>{alert?.createdBy?.phone}</span>
                            </div>
                          </div>
                        </div>

                        {alert?.acceptedBy && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="text-xs text-gray-500 mb-1">Accepted By</div>
                            <div className="flex items-center text-green-600">
                              <User className="h-3.5 w-3.5 mr-1" />
                              <span className="font-medium">{alert?.acceptedBy?.name}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Action buttons */}
                <div className="flex gap-2">
                  {alert.alertProgress === "CREATED" && (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => handleAction(alert?._id, "REJECTED")}
                        disabled={isLoading !== null}
                      >
                        {isLoading === "REJECTED" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Reject
                      </Button>
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleAction(alert?._id, "ACCEPTED")}
                        disabled={isLoading !== null}
                      >
                        {isLoading === "ACCEPTED" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Accept
                      </Button>
                    </>
                  )}

                  {alert.alertProgress === "ACCEPTED" && (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleAction(alert?._id, "DELIVERED")}
                      disabled={isLoading !== null}
                    >
                      {isLoading === "DELIVERED" ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCheck className="h-4 w-4 mr-2" />
                      )}
                      Mark as Delivered
                    </Button>
                  )}

                  {(alert?.alertProgress === "REJECTED" || alert?.alertProgress === "DELIVERED") && (
                    <div className="w-full text-center text-sm text-gray-500 py-2 bg-gray-50 rounded-md">
                      No action required
                    </div>
                  )}
                </div>
              </div>

              {/* Order details popup */}
              {showOrderDetails === alert._id && (
                <BottomPopUp hide show={true} onClose={() => setShowOrderDetails(null)}>
                  <div className="pt-4">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setShowOrderDetails(null)}
                        className="px-2 ml-4 rounded-xl bg-[#000000] text-[#ffffff] on_active_bounce"
                      >
                        <FaArrowLeft size={28} className="p-2 rounded-full cursor-pointer text-[#ffffff]" />
                      </button>
                      <h2 className="text-lg font-semibold">Order Details - Room {alert?.roomId?.name}</h2>
                    </div>

                    {hasCart ? (
                      <div className="space-y-3 p-4">
                        <CartDetailsHotel cart={alert?.cart} />
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p>No order items found</p>
                      </div>
                    )}
                  </div>
                </BottomPopUp>
              )}
            </Card>
          )
        })}
      </div>

      {/* Empty state */}
      {filteredAlerts.length === 0 && (
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
      )}
    </div>
  )
}

export default RoomAlertCard

