"use client";
import { useState, useCallback, memo, useMemo } from "react";
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
import type { IMenuLayout } from "@/components/types/businessData";
import { useScreenSize } from "@/components/hooks/useScreenSize";

// Lazy-loaded components for better tree-shaking
const AlertCircle = dynamic(
  () => import("lucide-react").then((mod) => ({ default: mod.AlertCircle })),
  { ssr: false },
);

const CheckCircle = dynamic(
  () => import("lucide-react").then((mod) => ({ default: mod.CheckCircle })),
  { ssr: false },
);

const CheckIcon = dynamic(
  () => import("lucide-react").then((mod) => ({ default: mod.Check })),
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
  menuId?: IMenuLayout;
}

interface ServiceItemProps {
  service: IService;
  selected: boolean;
  onToggle: () => void;
  getInitial: (name: string) => string;
}

// Memoized service item component for better performance
const ServiceItem = memo(
  ({ service, selected, onToggle, getInitial }: ServiceItemProps) => (
    <section>
      <Card
        className={`relative p-0 transition-all duration-200 border-none shadow-none cursor-pointer  hover:shadow-md ${
          selected
            ? "border-primary shadow-md"
            : "border-gray-200 hover:border-gray-300"
        } ${
          service.availability === false ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={() => {
          if (service.availability !== false) {
            onToggle();
          }
        }}
      >
        {/* Selection indicator */}
        {selected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <CheckIcon className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Avatar/Image at the top */}
        <div className="mb-3 text-center flex items-start justify-center">
          {service.image ? (
            <Image
              src={service.image}
              alt={service.name}
              width={48}
              height={48}
              className="w-[110px] h-[100px]"
            />
          ) : (
            <Avatar className="w-12 h-12 text-center flex items-start justify-center">
              <AvatarFallback className="bg-primary text-base-100 text-lg font-semibold">
                {getInitial(service.name)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Service name at the bottom */}

        {/* Availability indicator */}
        {service.availability === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
            <span className="text-xs font-medium text-white bg-red-500 px-2 py-1 rounded">
              Unavailable
            </span>
          </div>
        )}
      </Card>
      <div className="text-center poppins-regular py-2 font-medium cursor-pointer text-black text-xs leading-tight">
        {service.name}
      </div>
    </section>
  ),
);

ServiceItem.displayName = "ServiceItem";

// Status components
const SuccessState = () => (
  <div className="flex flex-col items-center justify-center py-10">
    <CheckCircle className="w-16 h-16 mb-4 text-green-500" />
    <h3 className="text-xl font-semibold text-primary">Request Sent!</h3>
    <p className="mt-2 text-center text-gray-500">
      Your service request has been sent successfully.
    </p>
  </div>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-10">
    <AlertCircle className="w-16 h-16 mb-4 text-red-500" />
    <h3 className="text-xl font-semibold text-h-primary">Request Failed</h3>
    <p className="mt-2 text-center text-gray-500 mb-4">
      There was an error sending your request. Please try again.
    </p>
    <button
      type="button"
      onClick={onRetry}
      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
    >
      Try Again
    </button>
  </div>
);

const LoadingState = () => (
  <div className="flex items-center justify-center py-10">
    <LoadingSpinnerCircle />
  </div>
);

export default function ServiceCategoryCard({
  category,
  className = "",
  businessId,
  menuId,
}: ServiceCategoryCardProps) {
  // State management
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
  const screenSize = useScreenSize();

  // Derived state
  const isFoodOrderCategory = category.name.toLowerCase() === "food";
  const isLoading = gettingRoomLoader || creatingAlert;
  const hasSelectedServices = selectedServices.length > 0;

  // Memoized handlers
  const openServicePopup = useCallback(() => {
    if (!accessToken) {
      setCheckLogin(true);
      return;
    }
    setServicePopup(true);
    setSelectedServices([]);
    setAlertStatus("idle");
  }, [accessToken, setCheckLogin]);

  const closeServicePopup = useCallback(() => {
    setServicePopup(false);
    setSelectedServices([]);
    setAlertStatus("idle");
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
    if (!hasSelectedServices) return;

    try {
      setAlertStatus("loading");

      // Get room data
      const roomData = await roomPayload({
        businessId,
        roomName: room || "hipalz",
      });

      if (!roomData?.data?._id) {
        throw new Error("Could not find room data");
      }

      // Create the alert
      await createAlert({
        serviceIds: selectedServices,
        businessId,
        userId: userDetails?._id || "",
        roomId: roomData.data._id,
      });

      setAlertStatus("success");
      toast.success("Request sent successfully");

      // Auto-close after success
      setTimeout(() => {
        closeServicePopup();
      }, 1500);
    } catch (error) {
      console.error("Error creating alert:", error);
      setAlertStatus("error");
      toast.error("Error sending request. Please try again.");
    }
  }, [
    businessId,
    closeServicePopup,
    createAlert,
    hasSelectedServices,
    room,
    roomPayload,
    selectedServices,
    userDetails?._id,
  ]);

  const handleRetry = useCallback(() => {
    setAlertStatus("idle");
  }, []);

  // Helper functions
  const getInitial = useCallback((name: string) => {
    return name.charAt(0).toUpperCase();
  }, []);

  const isSelected = useCallback(
    (serviceId: string) => selectedServices.includes(serviceId),
    [selectedServices],
  );

  // Render category name with proper formatting
  const formatCategoryName = (name: string) => {
    return name.replace(/[^a-zA-Z0-9 ]/g, " ").toLowerCase();
  };

  const dynamicHeightAndWidth = useMemo(() => {
    if (screenSize === "xs") {
      return { height: 130, width: 130 };
    }
    if (screenSize === "sm") {
      return { height: 150, width: 150 };
    }
    if (screenSize === "md") {
      return { height: 150, width: 150 };
    }
    if (screenSize === "lg") {
      return { height: 150, width: 150 };
    }
    if (screenSize === "xl") {
      return { height: 170, width: 170 };
    }
    return { height: 150, width: 150 };
  }, [screenSize]);

  return (
    <>
      {/* Main Category Card */}
      <Card
        onClick={openServicePopup}
        className={`transition-all duration-200 border border-[#E0E0E0] cursor-pointer aspect-square rounded-3xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col items-start justify-between hover:shadow-lg hover:scale-[1.02] ${className}`}
      >
        <CardContent className="relative flex flex-col justify-between w-full h-full p-3 z-10 overflow-hidden">
          {/* Background Image */}
          <div className="absolute -bottom-2 -right-2 z-0">
            <Image
              src={category.image || "/placeholder.svg"}
              alt={category.name}
              width={dynamicHeightAndWidth.width}
              height={dynamicHeightAndWidth.height}
              style={{ objectFit: "cover" }}
            />
          </div>

          {/* Category Info */}
          <div className="relative z-10">
            <h3 className="text-lg poppins-regular !font-semibold capitalize text-[#000000] !tracking-tighter">
              {formatCategoryName(category.name)}
            </h3>
            <h6 className="text-xs text-[#00000080] poppins-regular !tracking-tighter">
              {category.description}
            </h6>
          </div>
        </CardContent>
      </Card>

      {/* Service Selection Popup */}
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
              <div className="p-4 relative max-h-[90dvh] overflow-auto hide-scrollbar">
                <h2 className="mb-4 text-xl font-bold text-primary">
                  {category.name} Services
                </h2>

                {/* Selected Services Counter */}
                {hasSelectedServices && alertStatus === "idle" && (
                  <div className="mb-4 p-2 bg-primary/10 rounded-lg">
                    <p className="text-sm text-primary font-medium">
                      {selectedServices.length} service
                      {selectedServices.length !== 1 ? "s" : ""} selected
                    </p>
                  </div>
                )}

                {/* Content based on status */}
                {isLoading ? (
                  <LoadingState />
                ) : alertStatus === "success" ? (
                  <SuccessState />
                ) : alertStatus === "error" ? (
                  <ErrorState onRetry={handleRetry} />
                ) : (
                  <div className="mb-20 grid grid-cols-3 gap-4">
                    {category.serviceIds.length > 0 ? (
                      category.serviceIds.map((service) => {
                        if (!service.availability) return null;
                        return (
                          <ServiceItem
                            key={service._id}
                            service={service}
                            selected={isSelected(service._id)}
                            onToggle={() => handleServiceToggle(service._id)}
                            getInitial={getInitial}
                          />
                        );
                      })
                    ) : (
                      <div className="col-span-3 py-8 text-center text-gray-500">
                        No services available in this category.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Action Buttons */}
              {alertStatus !== "success" && (
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
                      text: alertStatus === "error" ? "Try Again" : "Confirm",
                      onClick:
                        alertStatus === "error"
                          ? handleRetry
                          : handleConfirmSelection,
                      className: "w-full rounded-md",
                      disable:
                        !hasSelectedServices || alertStatus === "loading",
                      swipe: hasSelectedServices && alertStatus === "idle",
                    },
                  ]}
                />
              )}
            </BottomPopUp>
          )}
        </>
      )}
    </>
  );
}
