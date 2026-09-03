"use client";
import { useState, useCallback, memo, useMemo, useEffect, useRef } from "react";
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
  useGetAllChats,
  useHotelRoomData,
} from "@/components/hooks/useHotelRoom";
import type { RoomChat } from "@/components/types/hotelTypes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLogin } from "@/components/store/useLogin";
import toast from "react-hot-toast";
import LoadingSpinnerCircle from "@/components/atoms/loader";
import dynamic from "next/dynamic";
import { useCartStore } from "@/components/store/useCartStore";
import type { IMenuLayout } from "@/components/types/businessData";
import { useScreenSize } from "@/components/hooks/useScreenSize";
import { hasGuestContactDetails } from "./guestContactGuard";
import ServiceEtaBadge from "./ServiceEtaBadge";
import HotelLogoLoader from "./HotelLogoLoader";
import ServiceQuantityPopup from "./ServiceQuantityPopup";
import { resolveServiceInstructionMessage } from "./serviceBehavior";

// Lazy-loaded components
const AlertCircle = dynamic(
  () => import("lucide-react").then((mod) => ({ default: mod.AlertCircle })),
  { ssr: false }
);
const CheckIcon = dynamic(
  () => import("lucide-react").then((mod) => ({ default: mod.Check })),
  { ssr: false }
);
const FoodOrderPopup = dynamic(() => import("./FoodOrderHotel"), {
  loading: () => (
    <BottomPopUp
      hide
      show
      onClose={() => undefined}
      manageHistory={false}
      surfaceClassName="bg-transparent shadow-none"
    >
      <section className="flex min-h-dvh items-center justify-center bg-white/10 px-6">
        <HotelLogoLoader ringColorClassName="border-t-[#2563EB]" />
      </section>
    </BottomPopUp>
  ),
  ssr: false,
});

const SERVICE_ACTION_COLOR = "#111111";
const SERVICE_ACTION_TEXT_COLOR = "#ffffff";
const SERVICE_MUTED_PILL = "bg-neutral-100 text-neutral-500";
const SERVICE_SELECTED_PILL = "bg-[#111111] text-white shadow-sm";

type AlertStatus = "idle" | "loading" | "success" | "error";

const formatRaisedServicesToast = (serviceNames: string[]) => {
  if (serviceNames.length === 0) {
    return "Service request raised.";
  }

  if (serviceNames.length === 1) {
    return `${serviceNames[0]} service request raised.`;
  }

  const lastServiceName = serviceNames[serviceNames.length - 1];
  const servicePrefix = serviceNames.slice(0, -1).join(", ");
  return `${servicePrefix} and ${lastServiceName} service requests raised.`;
};

interface ServiceCategoryCardProps {
  category: IServiceCategory;
  className?: string;
  businessId: string;
  menuId?: IMenuLayout;
  room?: string;
}

interface ServiceItemProps {
  service: IService;
  selected: boolean;
  onToggle: () => void;
  onQuantitySelect: () => void;
  getInitial: (name: string) => string;
  requestCount: number;
  quantity: number;
  quantityLimit: number;
  requiresConfirmation: boolean;
}

const ServiceItem = memo(
  ({
    service,
    selected,
    onToggle,
    onQuantitySelect,
    getInitial,
    requestCount,
    quantity,
    quantityLimit,
    requiresConfirmation,
  }: ServiceItemProps) => (
    <section>
      <Card
        className={`relative p-0 rounded-2xl border-none bg-transparent shadow-none transition-all duration-200 cursor-pointer ${
          selected ? "" : "hover:bg-gray-50"
        } ${
          service.availability === false ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={() => {
          if (service.availability === false) return;
          if (requiresConfirmation) {
            onQuantitySelect();
            return;
          }
          onToggle();
        }}
      >
        {selected && (
          <div className="absolute left-1 top-1 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-[#111111] shadow-sm ring-2 ring-white">
            <CheckIcon className="w-3 h-3 text-white" />
          </div>
        )}
        <div className="mb-3 text-center flex items-start justify-center">
          <div className="relative inline-flex">
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
                <AvatarFallback className="bg-[#111111] text-white text-lg font-semibold">
                  {getInitial(service.name)}
                </AvatarFallback>
              </Avatar>
            )}
            {/* Est. time-to-delivery, so the guest can check the expected wait before ordering */}
            <ServiceEtaBadge
              minutes={service.avgDeliveryTime}
              className="absolute -top-2 -right-2 z-10"
            />
          </div>
        </div>
        {service.availability === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
            <span className="text-xs font-medium text-white bg-red-500 px-2 py-1 rounded">
              Unavailable
            </span>
          </div>
        )}
      </Card>
      <div className="plus-jakarta-font text-center py-2 font-medium cursor-pointer text-black text-xs leading-tight">
        {service.name}
        {quantityLimit > 1 && quantity > 0 ? (
          <span className="mx-auto mt-2 block w-fit rounded-full border border-neutral-200 bg-black px-3 py-1 text-[0.68rem] font-bold leading-none text-white shadow-sm">
            x{quantity} selected
          </span>
        ) : null}
      </div>
    </section>
  )
);
ServiceItem.displayName = "ServiceItem";

const getLatestCompletedCheckoutAt = (chats: RoomChat[]) =>
  chats.reduce((latest, chat) => {
    const services = chat?.alertId?.serviceIds ?? [];
    const isCheckout =
      services.some((service) => service?.systemKey === "CHECKOUT") ||
      chat?.alertId?.message?.startsWith("CHECKOUT_REQUEST::");
    const completedAt = chat?.alertId?.deliveredAt;

    if (!isCheckout || !completedAt) return latest;
    return Math.max(latest, completedAt);
  }, 0);

const getSessionServiceRequestCounts = (chats: RoomChat[]) => {
  const latestCheckoutAt = getLatestCompletedCheckoutAt(chats);
  const counts = new Map<string, number>();

  for (const chat of chats) {
    const createdAt = chat?.alertId?.createdAt || chat?.date || 0;
    if (latestCheckoutAt && createdAt <= latestCheckoutAt) continue;

    for (const service of chat?.alertId?.serviceIds ?? []) {
      if (!service?._id || service?.systemKey === "CHECKOUT") continue;
      const requestedItem = chat?.alertId?.serviceRequestItems?.find(
        (item) => item.serviceId?.toString() === service._id
      );
      counts.set(service._id, (counts.get(service._id) || 0) + (requestedItem?.quantity || 1));
    }
  }

  return counts;
};

const getServiceQuantityLimit = (service: IService) =>
  Math.max(1, Math.min(20, Math.floor(Number(service.quantityLimit) || 1)));

function MemoServiceCategoryCard({
  category,
  className = "",
  businessId,
  menuId,
  room: roomFromProps,
}: ServiceCategoryCardProps) {
  const [servicePopup, setServicePopup] = useState<boolean>(false);
  const [selectedServiceQuantities, setSelectedServiceQuantities] = useState<Record<string, number>>({});
  const [quantityPromptService, setQuantityPromptService] = useState<IService | null>(null);
  const [alertStatus, setAlertStatus] = useState<AlertStatus>("idle");
  const suppressAutoOpenRef = useRef(false);

  const accessToken = useUserToken.getState().accessToken;
  const { setCheckLogin } = usePaymentStore();
  const userDetails = useLogin((s) => s.userDetails);
  const query = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const room = roomFromProps || query.get("room") || "";
  const { gettingRoomLoader, roomPayload } = useHotelRoomData();
  const { creatingAlert, createAlert } = useCreateAlert();
  const { chatData } = useGetAllChats(
    { businessId, roomName: room || "" },
    { enabled: servicePopup }
  );
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

  const isLoading = gettingRoomLoader;
  const maxSelectableServices = 2;
  const selectedServices = useMemo(
    () =>
      Object.entries(selectedServiceQuantities)
        .filter(([, quantity]) => quantity > 0)
        .map(([serviceId]) => serviceId),
    [selectedServiceQuantities]
  );
  const hasSelectedServices = selectedServices.length > 0;
  const selectedServiceNames = useMemo(
    () =>
      category.serviceIds
        .filter((service) => selectedServices.includes(service._id))
        .map((service) => {
          const quantity = selectedServiceQuantities[service._id] || 1;
          return quantity > 1 ? `${service.name} x${quantity}` : service.name;
        }),
    [category.serviceIds, selectedServiceQuantities, selectedServices]
  );
  const requestCounts = useMemo(
    () => getSessionServiceRequestCounts(chatData ?? []),
    [chatData]
  );

  useEffect(() => {
    const shouldOpen = query.get("serviceCategory") === category._id;
    if (!shouldOpen) {
      suppressAutoOpenRef.current = false;
    }
    if (shouldOpen && suppressAutoOpenRef.current) return;
    if (
      shouldOpen &&
      !servicePopup &&
      accessToken &&
      hasGuestContactDetails(userDetails)
    ) {
      setServicePopup(true);
      setSelectedServiceQuantities({});
      setQuantityPromptService(null);
      setAlertStatus("idle");
    }
    if (!shouldOpen && servicePopup) {
      setServicePopup(false);
      setSelectedServiceQuantities({});
      setQuantityPromptService(null);
      setAlertStatus("idle");
      setCartEmpty();
    }
  }, [
    accessToken,
    category._id,
    query,
    servicePopup,
    setCartEmpty,
    userDetails,
  ]);

  const openServicePopup = useCallback(() => {
    if (!accessToken) {
      setCheckLogin(true);
      return;
    }
    if (!hasGuestContactDetails(userDetails)) {
      toast("Please add your name and phone number to continue.");
      setCheckLogin(true);
      return;
    }
    const params = new URLSearchParams(query.toString());
    params.set("serviceCategory", category._id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setServicePopup(true);
    setSelectedServiceQuantities({});
    setQuantityPromptService(null);
    setAlertStatus("idle");
  }, [
    accessToken,
    category._id,
    pathname,
    query,
    router,
    setCheckLogin,
    userDetails,
  ]);

  const closeServicePopup = useCallback(() => {
    suppressAutoOpenRef.current = true;
    const params = new URLSearchParams(query.toString());
    params.delete("serviceCategory");
    params.delete("restaurantId");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setServicePopup(false);
    setSelectedServiceQuantities({});
    setQuantityPromptService(null);
    setAlertStatus("idle");
    setCartEmpty();
  }, [pathname, query, router, setCartEmpty]);

  const handleServiceToggle = useCallback(
    (serviceId: string) => {
      if (
        !selectedServices.includes(serviceId) &&
        selectedServices.length >= maxSelectableServices
      ) {
        toast("You can request up to 2 services at a time.");
        return;
      }

      setSelectedServiceQuantities((prev) => {
        if (prev[serviceId]) {
          const { [serviceId]: _removed, ...next } = prev;
          return next;
        }
        return { ...prev, [serviceId]: 1 };
      });
    },
    [maxSelectableServices, selectedServices]
  );

  const openQuantityPopup = useCallback(
    (service: IService) => {
      const currentQuantity = selectedServiceQuantities[service._id] || 0;
      if (!currentQuantity && selectedServices.length >= maxSelectableServices) {
        toast("You can request up to 2 services at a time.");
        return;
      }
      setQuantityPromptService(service);
    },
    [maxSelectableServices, selectedServiceQuantities, selectedServices.length]
  );

  const handleQuantityConfirm = useCallback((serviceId: string, quantity: number) => {
    setSelectedServiceQuantities((prev) => ({
      ...prev,
      [serviceId]: quantity,
    }));
    setQuantityPromptService(null);
  }, []);

  const handleQuantityRemove = useCallback((serviceId: string) => {
    setSelectedServiceQuantities((prev) => {
      const { [serviceId]: _removed, ...next } = prev;
      return next;
    });
    setQuantityPromptService(null);
  }, []);

  const handleConfirmSelection = useCallback(async () => {
    if (!hasSelectedServices) return;
    if (!hasGuestContactDetails(userDetails)) {
      toast("Please add your name and phone number to continue.");
      setCheckLogin(true);
      return;
    }
    try {
      setAlertStatus("loading");
      const roomData = (await roomPayload({
        businessId,
        roomName: room || "hipalz",
      })) as { data?: { _id?: string } };

      const roomId = roomData?.data?._id;
      if (!roomId) throw new Error("Could not find room data");

      await createAlert({
        serviceIds: selectedServices,
        serviceRequestItems: selectedServices.map((serviceId) => ({
          serviceId,
          quantity: selectedServiceQuantities[serviceId] || 1,
        })),
        businessId,
        userId: userDetails?._id || "",
        roomId,
      });

      toast.success(formatRaisedServicesToast(selectedServiceNames));
      setAlertStatus("idle");
      setSelectedServiceQuantities({});
    } catch (error) {
      setAlertStatus("error");
      toast.error("Error sending request. Please try again.");
    }
  }, [
    businessId,
    createAlert,
    hasSelectedServices,
    room,
    roomPayload,
    selectedServices,
    selectedServiceQuantities,
    selectedServiceNames,
    setCheckLogin,
    userDetails,
  ]);

  const handleRetry = useCallback(() => setAlertStatus("idle"), []);

  const getInitial = useCallback(
    (name: string) => name.charAt(0).toUpperCase(),
    []
  );

  // Optimized: isSelected check should be memoized to avoid re-renders in ServiceItem
  const isSelected = useCallback(
    (serviceId: string) => selectedServices.includes(serviceId),
    [selectedServices]
  );

  // Optimized: Memoize the button configuration to prevent CommonBottomButton re-renders
  const footerButtons = useMemo(
    () => [
      {
        text: "Cancel",
        onClick: closeServicePopup,
        className: "rounded-md pl-3",
        isBackButton: true,
        color: SERVICE_ACTION_COLOR,
        textColor: SERVICE_ACTION_TEXT_COLOR,
        disable: alertStatus === "loading",
      },
      {
        text: alertStatus === "error" ? "Try Again" : "Confirm",
        onClick: alertStatus === "error" ? handleRetry : handleConfirmSelection,
        className: "w-full rounded-md",
        color: SERVICE_ACTION_COLOR,
        textColor: SERVICE_ACTION_TEXT_COLOR,
        disable: !hasSelectedServices || alertStatus === "loading",
        isLoading: alertStatus === "loading" || creatingAlert,
      },
    ],
    [
      alertStatus,
      closeServicePopup,
      handleRetry,
      handleConfirmSelection,
      hasSelectedServices,
      creatingAlert,
    ]
  );

  return (
    <>
      <Card
        onClick={openServicePopup}
        className={`group relative aspect-square cursor-pointer overflow-hidden rounded-[28px] border border-[#E9E4DC] bg-[#F8F5F0] shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.10)] ${className}`}
      >
        <Image
          src={category.image || "/placeholder.svg"}
          alt={category.name}
          fill
          className="object-cover scale-[1.02] transition-transform duration-500 group-hover:scale-[1.06]"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/15 to-transparent" />
        <div className="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/20" />

        <CardContent className="relative z-20 p-3">
          <h3 className="max-w-[60%] text-sm md:text-base leading-[1.05] tracking-[-0.04em] text-white line-clamp-2">
            {formattedCategoryName}
          </h3>
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
              menuId={menuId}
            />
          ) : (
            <BottomPopUp
              hide
              show={servicePopup}
              onClose={closeServicePopup}
              manageHistory={false}
            >
              <div className="plus-jakarta-font p-4 relative max-h-[90dvh] overflow-auto hide-scrollbar">
                {/* Header row is always present (title + count pill) so selecting
                    a service never pushes the grid down - no layout shift. */}
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h2 className="text-xl font-bold text-[#111111]">
                    {formattedCategoryName} Assistance
                  </h2>
                  {alertStatus === "idle" && (
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-200 ${
                        hasSelectedServices
                          ? SERVICE_SELECTED_PILL
                          : SERVICE_MUTED_PILL
                      }`}
                    >
                      {selectedServices.length} selected
                    </span>
                  )}
                </div>

                {isLoading && alertStatus === "idle" ? (
                  <div className="flex items-center justify-center py-10">
                    <LoadingSpinnerCircle />
                  </div>
                ) : alertStatus === "error" ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <AlertCircle className="w-16 h-16 mb-4 text-red-500" />
                    <button
                      onClick={handleRetry}
                      className="rounded-md bg-[#111111] px-4 py-2 text-white transition-colors hover:bg-neutral-800"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="mb-20 grid grid-cols-3 gap-4">
                    {category.serviceIds.map(
                      (service) =>
                        service.availability && (
                          <ServiceItem
                            key={service._id}
                            service={service}
                            selected={isSelected(service._id)}
                            onToggle={() => handleServiceToggle(service._id)}
                            onQuantitySelect={() => openQuantityPopup(service)}
                            getInitial={getInitial}
                            requestCount={requestCounts.get(service._id) || 0}
                            quantity={selectedServiceQuantities[service._id] || 0}
                            quantityLimit={getServiceQuantityLimit(service)}
                            requiresConfirmation={getServiceQuantityLimit(service) > 1 || Boolean(resolveServiceInstructionMessage(service))}
                          />
                        )
                    )}
                  </div>
                )}
                {quantityPromptService ? (
                  <ServiceQuantityPopup
                    service={quantityPromptService}
                    quantityLimit={getServiceQuantityLimit(quantityPromptService)}
                    initialQuantity={selectedServiceQuantities[quantityPromptService._id] || 1}
                    instructionMessage={resolveServiceInstructionMessage(quantityPromptService)}
                    onClose={() => setQuantityPromptService(null)}
                    onConfirm={(quantity) => handleQuantityConfirm(quantityPromptService._id, quantity)}
                    onRemove={() => handleQuantityRemove(quantityPromptService._id)}
                  />
                ) : null}
              </div>

              <CommonBottomButton fixed buttons={footerButtons} />
            </BottomPopUp>
          )}
        </>
      )}
    </>
  );
}
const ServiceCategoryCard = memo(MemoServiceCategoryCard);
export default ServiceCategoryCard;
