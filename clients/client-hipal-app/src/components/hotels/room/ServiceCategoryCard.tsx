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

// Lazy-loaded components
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
const FoodOrderPopup = dynamic(() => import("./FoodOrderHotel"), {
  loading: () => <LoadingSpinnerCircle />,
  ssr: false,
});

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

const ServiceItem = memo(({ service, selected, onToggle, getInitial }: ServiceItemProps) => (
  <section>
    <Card
      className={`relative p-0 transition-all duration-200 border-none shadow-none cursor-pointer hover:shadow-md ${
        selected ? "border-primary shadow-md" : "border-gray-200 hover:border-gray-300"
      } ${service.availability === false ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={() => {
        if (service.availability !== false) onToggle();
      }}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <CheckIcon className="w-4 h-4 text-white" />
        </div>
      )}
      <div className="mb-3 text-center flex items-start justify-center">
        {service.image ? (
          <Image
            src={service.image}
            alt={service.name}
            width={96}
            height={96}
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
));
ServiceItem.displayName = "ServiceItem";

function MemoServiceCategoryCard({
  category,
  className = "",
  businessId,
  menuId,
}: ServiceCategoryCardProps) {
  const [servicePopup, setServicePopup] = useState<boolean>(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [alertStatus, setAlertStatus] = useState<AlertStatus>("idle");

  const accessToken = useUserToken.getState().accessToken;
  const { setCheckLogin } = usePaymentStore();
  const userDetails = useLogin((s) => s.userDetails);
  const query = useSearchParams();
  const room = query.get("room");
  const { gettingRoomLoader, roomPayload } = useHotelRoomData();
  const { creatingAlert, createAlert } = useCreateAlert();
  const { setCartEmpty } = useCartStore();
  const screenSize = useScreenSize();

  // Optimized: Memoize the name formatting logic
  const formattedCategoryName = useMemo(() => {
    if (!category.name) return "";
    const spaced = category.name.replace(/_/g, " ").toLowerCase();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  }, [category.name]);

  const isFoodOrderCategory = useMemo(() => {
    const name = category.name.toLowerCase();
    return name === "food" || name === "order_food";
  }, [category.name]);

  const isLoading = gettingRoomLoader || creatingAlert;
  const hasSelectedServices = selectedServices.length > 0;

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
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  }, []);

  const handleConfirmSelection = useCallback(async () => {
    if (!hasSelectedServices) return;
    try {
      setAlertStatus("loading");
      const roomData = await roomPayload({
        businessId,
        roomName: room || "hipalz",
      });

      if (!roomData?.data?._id) throw new Error("Could not find room data");

      await createAlert({
        serviceIds: selectedServices,
        businessId,
        userId: userDetails?._id || "",
        roomId: roomData.data._id,
      });

      setAlertStatus("success");
      toast.success("Request sent successfully");
      setTimeout(closeServicePopup, 1500);
    } catch (error) {
      setAlertStatus("error");
      toast.error("Error sending request. Please try again.");
    }
  }, [businessId, closeServicePopup, createAlert, hasSelectedServices, room, roomPayload, selectedServices, userDetails?._id]);

  const handleRetry = useCallback(() => setAlertStatus("idle"), []);

  const getInitial = useCallback((name: string) => name.charAt(0).toUpperCase(), []);

  // Optimized: isSelected check should be memoized to avoid re-renders in ServiceItem
  const isSelected = useCallback(
    (serviceId: string) => selectedServices.includes(serviceId),
    [selectedServices]
  );

  const dynamicHeightAndWidth = useMemo(() => {
    const sizes: Record<string, { height: number; width: number }> = {
      xs: { height: 130, width: 130 },
      xl: { height: 170, width: 170 },
    };
    return sizes[screenSize] || { height: 150, width: 150 };
  }, [screenSize]);

  // Optimized: Memoize the button configuration to prevent CommonBottomButton re-renders
  const footerButtons = useMemo(() => [
    {
      text: "Cancel",
      onClick: closeServicePopup,
      className: "rounded-md pl-3",
      isBackButton: true,
      disable: alertStatus === "loading",
    },
    {
      text: alertStatus === "error" ? "Try Again" : "Confirm",
      onClick: alertStatus === "error" ? handleRetry : handleConfirmSelection,
      className: "w-full rounded-md",
      disable: !hasSelectedServices || alertStatus === "loading",
      swipe: hasSelectedServices && alertStatus === "idle",
    },
  ], [alertStatus, closeServicePopup, handleRetry, handleConfirmSelection, hasSelectedServices]);

  return (
    <>
      <Card
        onClick={openServicePopup}
        className={`transition-all duration-200 border border-[#E0E0E0] cursor-pointer aspect-square rounded-3xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col items-start justify-between hover:shadow-lg hover:scale-[1.02] ${className}`}
      >
        <CardContent className="relative flex flex-col justify-between w-full h-full p-3 z-10 overflow-hidden">
          <div className="absolute -bottom-2 -right-2 z-0">
            <Image
              src={category.image || "/placeholder.svg"}
              alt={category.name}
              width={dynamicHeightAndWidth.width}
              height={dynamicHeightAndWidth.height}
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg poppins-regular !font-semibold capitalize text-[#000000] !tracking-tighter">
              {formattedCategoryName}
            </h3>
            <h6 className="text-xs text-[#00000080] poppins-regular !tracking-tighter">
              {category.description}
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
              menuId={menuId}
            />
          ) : (
            <BottomPopUp hide show={servicePopup} onClose={closeServicePopup}>
              <div className="p-4 relative max-h-[90dvh] overflow-auto hide-scrollbar">
                <h2 className="mb-4 text-xl font-bold text-primary">
                  {formattedCategoryName} Assistance
                </h2>

                {hasSelectedServices && alertStatus === "idle" && (
                  <div className="mb-4 p-2 bg-primary/10 rounded-lg">
                    <p className="text-sm text-primary font-medium">
                      {selectedServices.length} service{selectedServices.length !== 1 ? "s" : ""} selected
                    </p>
                  </div>
                )}

                {isLoading ? (
                  <div className="flex items-center justify-center py-10"><LoadingSpinnerCircle /></div>
                ) : alertStatus === "success" ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <CheckCircle className="w-16 h-16 mb-4 text-green-500" />
                    <h3 className="text-xl font-semibold text-primary">Request Sent!</h3>
                  </div>
                ) : alertStatus === "error" ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <AlertCircle className="w-16 h-16 mb-4 text-red-500" />
                    <button onClick={handleRetry} className="px-4 py-2 bg-primary text-white rounded-md">Try Again</button>
                  </div>
                ) : (
                  <div className="mb-20 grid grid-cols-3 gap-4">
                    {category.serviceIds.map((service) => (
                      service.availability && (
                        <ServiceItem
                          key={service._id}
                          service={service}
                          selected={isSelected(service._id)}
                          onToggle={() => handleServiceToggle(service._id)}
                          getInitial={getInitial}
                        />
                      )
                    ))}
                  </div>
                )}
              </div>

              {alertStatus !== "success" && (
                <CommonBottomButton fixed buttons={footerButtons} />
              )}
            </BottomPopUp>
          )}
        </>
      )}
    </>
  );
}
const ServiceCategoryCard = memo(MemoServiceCategoryCard)
export default ServiceCategoryCard
