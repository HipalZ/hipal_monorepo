"use client"

import { useState, useCallback, memo } from "react"
import CommonBottomButton from "@/components/atoms/bottomButton"
import BottomPopUp from "@/components/atoms/bottomPopUp"
import type { IService, IServiceCategory } from "@/components/hooks/useServicesHotel"
import { usePaymentStore } from "@/components/store/usePaymentStore"
import { Card } from "@/components/ui/card"
import { useUserToken } from "@hi/common/src/useUserToken"
import Image from "next/image"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useCreateAlert, useHotelRoomData } from "@/components/hooks/useHotelRoom"
import { useSearchParams } from "next/navigation"
import { useLogin } from "@/components/store/useLogin"
import { toast } from "react-toastify"
import LoadingSpinnerCircle from "@/components/atoms/loader"
import dynamic from "next/dynamic"
import { useCartStore } from "@/components/store/useCartStore"
import { IMenuLayout } from "@/components/types/businessData"

// Lazy-loaded components for better tree-shaking
const AlertCircle = dynamic(() => import("lucide-react").then((mod) => ({ default: mod.AlertCircle })), { ssr: false })
const CheckCircle = dynamic(() => import("lucide-react").then((mod) => ({ default: mod.CheckCircle })), { ssr: false })

// Dynamically import the FoodOrderPopup component
const FoodOrderPopup = dynamic(() => import("./FoodOrderHotel"), {
  loading: () => <LoadingSpinnerCircle />,
  ssr: false,
})

// Types
type AlertStatus = "idle" | "loading" | "success" | "error"

interface ServiceCategoryCardProps {
  category: IServiceCategory
  className?: string
  businessId: string
  menuId?:IMenuLayout
}

// Memoized service item component for better performance
const ServiceItem = memo(
  ({
    service,
    selected,
    onToggle,
    getInitial,
  }: {
    service: IService
    selected: boolean
    onToggle: () => void
    getInitial: (name: string) => string
  }) => (
    <Card
      key={service._id}
      className={`flex items-center p-3 transition-colors border rounded-lg cursor-pointer ${selected ? "border-h-primary bg-h-primary/5" : "border-gray-200"
        }`}
      onClick={() => {
        if (service.availability !== false) {
          onToggle()
        }
      }}
    >
      <Avatar className="w-10 h-10 mr-4">
        <AvatarFallback className="bg-h-primary text-h-base-100">{getInitial(service.name)}</AvatarFallback>
      </Avatar>

      <Label htmlFor={service._id} className="flex-grow font-medium cursor-pointer text-h-primary">
        {service.name}
      </Label>
      <Checkbox
        id={service._id}
        checked={selected}
        onCheckedChange={() => {
          if (service.availability !== false) {
            onToggle()
          }
        }}
        disabled={service.availability === false}
        className="w-5 h-5"
        onClick={(e) => {
          e.stopPropagation()
        }}
      />
    </Card>
  ),
)

ServiceItem.displayName = "ServiceItem"

// Status components
const SuccessState = () => (
  <div className="flex flex-col items-center justify-center py-10">
    <CheckCircle className="w-16 h-16 mb-4 text-green-500" />
    <h3 className="text-xl font-semibold text-h-primary">Request Sent!</h3>
    <p className="mt-2 text-center text-gray-500">Your service request has been sent successfully.</p>
  </div>
)

const ErrorState = () => (
  <div className="flex flex-col items-center justify-center py-10">
    <AlertCircle className="w-16 h-16 mb-4 text-red-500" />
    <h3 className="text-xl font-semibold text-h-primary">Request Failed</h3>
    <p className="mt-2 text-center text-gray-500">There was an error sending your request. Please try again.</p>
  </div>
)

export default function ServiceCategoryCard({ category, className = "", businessId, menuId }: ServiceCategoryCardProps) {
  // State
  const [servicePopup, setServicePopup] = useState<boolean>(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [alertStatus, setAlertStatus] = useState<AlertStatus>("idle")

  // Hooks
  const accessToken = useUserToken.getState().accessToken
  const { setCheckLogin } = usePaymentStore()
  const userDetails = useLogin((s) => s.userDetails)
  const query = useSearchParams()
  const room = query.get("room")
  const { gettingRoomLoader, roomPayload } = useHotelRoomData()
  const { creatingAlert, createAlert } = useCreateAlert()
  const { setCartEmpty } = useCartStore();

  // Check if this is the food order category
  const isFoodOrderCategory = category.name.toLowerCase() === "food"

  // Memoized handlers
  const openServicePopup = useCallback(
    (services: IService[]) => {
      if (!accessToken) {
        setCheckLogin(true)
        return
      }
      setServicePopup(true)
      setSelectedServices([])
      setAlertStatus("idle")
    },
    [accessToken, setCheckLogin],
  )

  const closeServicePopup = useCallback(() => {
    setServicePopup(false)
    setCartEmpty()
  }, [setCartEmpty])

  const handleServiceToggle = useCallback((serviceId: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId)
      }
      return [...prev, serviceId]
    })
  }, [])

  const handleConfirmSelection = useCallback(async () => {
    try {
      setAlertStatus("loading")

      // First get the room data
      const roomData = await roomPayload({
        businessId,
        roomName: room || "hipalz",
      })

      if (!roomData?.data?._id) {
        throw new Error("Could not find room data")
      }

      // Then create the alert
      await createAlert({
        serviceIds: selectedServices,
        businessId,
        userId: userDetails?._id || "",
        roomId: roomData.data._id,
      })

      setAlertStatus("success")
      toast.success("Request sent successfully")

      // Close popup after a short delay
      setTimeout(() => {
        closeServicePopup()
        setAlertStatus("idle")
      }, 1000)
    } catch (error) {
      console.error("Error creating alert:", error)
      setAlertStatus("error")
      toast.error("Error sending request. Please try again.")
    }
  }, [businessId, closeServicePopup, createAlert, room, roomPayload, selectedServices, userDetails?._id])

  // Helper functions
  const getInitial = useCallback((name: string) => {
    return name.charAt(0).toUpperCase()
  }, [])

  const isSelected = useCallback(
    (serviceId: string) => {
      return selectedServices.includes(serviceId)
    },
    [selectedServices],
  )

  // Loading state
  const isLoading = gettingRoomLoader || creatingAlert

  return (
    <>
      <Card
        onClick={() => openServicePopup(category?.serviceIds)}
        className={`relative w-full h-[180px] border-none overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] ${className}`}
      >
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={category.image || "/placeholder.svg"}
            alt={category.name}
            fill
            style={{
              objectFit: "cover",
              objectPosition: "top",
            }}
            sizes="(max-width: 30rem) 100vw, 30rem"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4">
          <h3 className="text-base text-white">{category.name}</h3>
        </div>
      </Card>

      {servicePopup && (
        <>
          {isFoodOrderCategory ? (
            <FoodOrderPopup
              show={servicePopup}
              onClose={closeServicePopup}
              businessId={businessId}
              room={room || ""}
              userId={userDetails?._id || ""}
              services={category.serviceIds}
              menuId={menuId}
            />
          ) : (
            <BottomPopUp hide show={servicePopup} onClose={closeServicePopup}>
              {isLoading ? (
                <LoadingSpinnerCircle />
              ) : (
                <div className="p-4 relative max-h-[90dvh] overflow-auto hide-scrollbar">
                  <h2 className="mb-4 text-xl font-bold text-h-primary">{category.name} Services</h2>

                  {alertStatus === "success" ? (
                    <SuccessState />
                  ) : alertStatus === "error" ? (
                    <ErrorState />
                  ) : (
                    <div className="mb-20 space-y-3">
                      {category.serviceIds.length > 0 ? (
                        <>
                          {category.serviceIds.map((service) => (
                            <ServiceItem
                              key={service._id}
                              service={service}
                              selected={isSelected(service._id)}
                              onToggle={() => handleServiceToggle(service._id)}
                              getInitial={getInitial}
                            />
                          ))}
                        </>
                      ) : (
                        <div className="py-8 text-center text-gray-500">No services available in this category.</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <CommonBottomButton
                fixed={true}
                buttons={[
                  {
                    text: "Cancel",
                    onClick: closeServicePopup,
                    className: "rounded-md pl-3",
                    isBackButton: true,
                    disable: alertStatus === "loading",
                  },
                  {
                    text: "Confirm",
                    onClick: alertStatus === "success" ? closeServicePopup : handleConfirmSelection,
                    className: "w-full rounded-md",
                    disable: selectedServices.length === 0 || alertStatus === "loading",
                    swipe: selectedServices.length !== 0 && alertStatus === "idle",
                  },
                ]}
              />
            </BottomPopUp>
          )}
        </>
      )}
    </>
  )
}

