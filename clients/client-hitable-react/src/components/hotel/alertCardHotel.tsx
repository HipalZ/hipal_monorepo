import { formatDistanceToNow } from "date-fns"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, XCircle, Package, User, Phone, CheckCheck, Loader2, ShoppingCart } from "lucide-react"
import { FaArrowLeft } from "react-icons/fa"
import { useAlertsStore } from "../store/useAlertStore"
import type { Alert } from "../types/hotelData";
import BottomPopUp from "../atoms/universalPopup";
import CartDetailsHotel from "./cartDetailsHotel";
import { useMutation } from "@tanstack/react-query";
import { useRespondAlerts } from "@/hooks/useHotelApis";
import { useAlertsColors } from "../utils/helpersHotel"
import { useCallback } from "react";
import toast from "react-hot-toast";

export interface AlertCardProps {
  alert: Alert
}

export function AlertCardHotel({ alert }: AlertCardProps) {
  const { borderColor } = useAlertsColors()
  const { showOrderDetails, setShowOrderDetails, setIsLoading, isLoading } = useAlertsStore()
  const { respondAlert } = useRespondAlerts()
  const { mutateAsync } = useMutation({
    mutationFn: respondAlert,
  })
  const handleAction = useCallback(
    async (alertId: string, action) => {
      setIsLoading(action)
      try {
        await mutateAsync({ alertId, action })
        toast.success(`Alert ${action?.toLowerCase()} successfully`)
      } catch (error) {
        toast.error("Failed to perform action")
      } finally {
        setIsLoading(null)
      }
    },
    [mutateAsync, setIsLoading],
  )

  const hasCart = alert?.cart && alert?.cart?.length > 0
  const timeAgo = formatDistanceToNow(new Date(alert?.createdAt), { addSuffix: true })
  // const acceptedTime = formatDistanceToNow(new Date(alert?.acceptedAt), { addSuffix: true })

  const alertProgress: Record<string, string> = {
    CREATED: "CREATED",
    WARNING: "WARNING",
    ESCALATION: "ESCALATION",
  }

  return (
    <Card
      className={`${alert?.alertProgress === "NOT_DELIVERED" ? "animation-blink" : ""} border border-l-4 overflow-hidden hover:shadow-md transition-all duration-200`}
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
            <AccordionTrigger className="py-2 text-sm text-gray-900 font-medium">Guest Information</AccordionTrigger>
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
                      {/* <span className="ml-auto">{acceptedTime}</span> */}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Action buttons */}
        <div className="flex gap-2">
          {alertProgress[alert?.alertProgress] && (
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

          {alert.alertProgress === "NOT_DELIVERED" && (
            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={() => handleAction(alert?._id, "RESOLVED")}
              disabled={isLoading !== null}
            >
              {isLoading === "NOT_DELIVERED" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4 mr-2" />
              )}
              Mark as Resolved
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
      {showOrderDetails === alert?._id && (
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
}

