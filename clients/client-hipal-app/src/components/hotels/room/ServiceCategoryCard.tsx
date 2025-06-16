"use client";

import { useState, useCallback, memo } from "react";
import CommonBottomButton from "@/components/atoms/bottomButton";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import type {
  IService,
  IServiceCategory,
} from "@/components/hooks/useServicesHotel";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { Card, CardContent } from "@/components/ui/card";
import { useUserToken } from "@hi/common/src/useUserToken";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useCreateAlert,
  useHotelRoomData,
} from "@/components/hooks/useHotelRoom";
import { useSearchParams } from "next/navigation";
import { useLogin } from "@/components/store/useLogin";
import { toast } from "react-toastify";
import LoadingSpinnerCircle from "@/components/atoms/loader";
import dynamic from "next/dynamic";
import { useCartStore } from "@/components/store/useCartStore";

// Lazy-loaded components for better tree-shaking
const AlertCircle = dynamic(
  () => import("lucide-react").then((mod) => ({ default: mod.AlertCircle })),
  { ssr: false },
);
const CheckCircle = dynamic(
  () => import("lucide-react").then((mod) => ({ default: mod.CheckCircle })),
  { ssr: false },
);

// Dynamically import the FoodOrderPopup component
const FoodOrderPopup = dynamic(() => import("./FoodOrderHotel"), {
  loading: () => <LoadingSpinnerCircle />,
  ssr: false,
});

// Types
type AlertStatus = "idle" | "loading" | "success" | "error";

interface ServiceCategoryCardProps {
  category: IServiceCategory;
  className?: string;
  businessId: string;
}

// Memoized service item component for better performance
const ServiceItem = memo(
  ({
    service,
    selected,
    onToggle,
    getInitial,
  }: {
    service: IService;
    selected: boolean;
    onToggle: () => void;
    getInitial: (name: string) => string;
  }) => (
    <Card
      key={service._id}
      className={`flex items-center p-3 transition-colors border rounded-lg cursor-pointer ${
        selected ? "border-h-primary bg-h-primary/5" : "border-gray-200"
      }`}
      onClick={() => {
        if (service.availability !== false) {
          onToggle();
        }
      }}
    >
      <Avatar className="w-10 h-10 mr-4">
        <AvatarFallback className="bg-h-primary text-h-base-100">
          {getInitial(service.name)}
        </AvatarFallback>
      </Avatar>

      <Label
        htmlFor={service._id}
        className="flex-grow font-medium cursor-pointer text-h-primary"
      >
        {service.name}
      </Label>
      <Checkbox
        id={service._id}
        checked={selected}
        onCheckedChange={() => {
          if (service.availability !== false) {
            onToggle();
          }
        }}
        disabled={service.availability === false}
        className="w-5 h-5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
        onClick={(e) => {
          e.stopPropagation();
        }}
      />
    </Card>
  ),
);

ServiceItem.displayName = "ServiceItem";

// Status components
const SuccessState = () => (
  <div className="flex flex-col items-center justify-center py-10">
    <CheckCircle className="w-16 h-16 mb-4 text-green-500" />
    <h3 className="text-xl font-semibold text-h-primary">Request Sent!</h3>
    <p className="mt-2 text-center text-gray-500">
      Your service request has been sent successfully.
    </p>
  </div>
);

const ErrorState = () => (
  <div className="flex flex-col items-center justify-center py-10">
    <AlertCircle className="w-16 h-16 mb-4 text-red-500" />
    <h3 className="text-xl font-semibold text-h-primary">Request Failed</h3>
    <p className="mt-2 text-center text-gray-500">
      There was an error sending your request. Please try again.
    </p>
  </div>
);

export default function ServiceCategoryCard({
  category,
  className = "",
  businessId,
}: ServiceCategoryCardProps) {
  // State
  const [servicePopup, setServicePopup] = useState<boolean>(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [alertStatus, setAlertStatus] = useState<AlertStatus>("idle");

  // Hooks
  const accessToken = useUserToken.getState().accessToken;
  const { setCheckLogin } = usePaymentStore();
  const userDetails = useLogin((s) => s.userDetails);
  const query = useSearchParams();
  const room = query.get("room");
  const { gettingRoomLoader, roomPayload } = useHotelRoomData();
  const { creatingAlert, createAlert } = useCreateAlert();
  const { setCartEmpty } = useCartStore();

  // Check if this is the food order category
  const isFoodOrderCategory = category.name.toLowerCase() === "food";

  // Memoized handlers
  const openServicePopup = useCallback(
    (services: IService[]) => {
      if (!accessToken) {
        setCheckLogin(true);
        return;
      }
      setServicePopup(true);
      setSelectedServices([]);
      setAlertStatus("idle");
    },
    [accessToken, setCheckLogin],
  );

  const closeServicePopup = useCallback(() => {
    setServicePopup(false);
    setCartEmpty();
  }, [setCartEmpty]);

  const handleServiceToggle = useCallback((serviceId: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      }
      return [...prev, serviceId];
    });
  }, []);

  const handleConfirmSelection = useCallback(async () => {
    try {
      setAlertStatus("loading");

      // First get the room data
      const roomData = await roomPayload({
        businessId,
        roomName: room || "hipalz",
      });

      if (!roomData?.data?._id) {
        throw new Error("Could not find room data");
      }

      // Then create the alert
      await createAlert({
        serviceIds: selectedServices,
        businessId,
        userId: userDetails?._id || "",
        roomId: roomData.data._id,
      });

      setAlertStatus("success");
      toast.success("Request sent successfully");

      // Close popup after a short delay
      setTimeout(() => {
        closeServicePopup();
        setAlertStatus("idle");
      }, 1000);
    } catch (error) {
      console.error("Error creating alert:", error);
      setAlertStatus("error");
      toast.error("Error sending request. Please try again.");
    }
  }, [
    businessId,
    closeServicePopup,
    createAlert,
    room,
    roomPayload,
    selectedServices,
    userDetails?._id,
  ]);

  // Helper functions
  const getInitial = useCallback((name: string) => {
    return name.charAt(0).toUpperCase();
  }, []);

  const isSelected = useCallback(
    (serviceId: string) => {
      return selectedServices.includes(serviceId);
    },
    [selectedServices],
  );

  // Loading state
  const isLoading = gettingRoomLoader || creatingAlert;

  return (
    <>
      <Card
        onClick={() => openServicePopup(category?.serviceIds)}
        className={`border cursor-pointer transition-all duration-200 overflow-hidden rounded-3xl bg-white shadow-sm flex flex-col items-center justify-center aspect-square ${className}`}
      >
        <CardContent className="relative flex flex-col justify-between w-full h-full p-4">
          <div className="mr-4 absolute bottom-0 -right-4">
            <Image
              src={category.image || "/placeholder.svg"}
              alt={category.name}
              style={{ objectFit: "cover" }}
              width={75}
              height={75}
            />
          </div>
          <div className="space-y-1">
            <h3 className="text-base poppins font-semibold text-h-primary capitalize">
              {category?.name.replace(/[^a-zA-Z0-9 ]/g, " ").toLowerCase()}
            </h3>
            <h6 className="text-xs font-light text-h-primary poppins-regular">
              {category?.description}
            </h6>
          </div>
        </CardContent>
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
            />
          ) : (
            <BottomPopUp hide show={servicePopup} onClose={closeServicePopup}>
              {isLoading ? (
                <LoadingSpinnerCircle />
              ) : (
                <div className="p-4 relative max-h-[90dvh] overflow-auto hide-scrollbar">
                  <h2 className="mb-4 text-xl font-bold text-h-primary">
                    {category.name} Services
                  </h2>

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
                        <div className="py-8 text-center text-gray-500">
                          No services available in this category.
                        </div>
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
                    onClick:
                      alertStatus === "success"
                        ? closeServicePopup
                        : handleConfirmSelection,
                    className: "w-full rounded-md",
                    disable:
                      selectedServices.length === 0 ||
                      alertStatus === "loading",
                    swipe:
                      selectedServices.length !== 0 && alertStatus === "idle",
                  },
                ]}
              />
            </BottomPopUp>
          )}
        </>
      )}
    </>
  );
}
