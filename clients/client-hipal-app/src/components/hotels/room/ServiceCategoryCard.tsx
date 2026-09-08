"use client";
import { useState, useCallback, memo, useMemo, useEffect, useRef } from "react";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import type {
  IService,
  IServiceCategory,
} from "@/components/hooks/useServicesHotel";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { Card, CardContent } from "@/components/ui/card";
import { useUserToken } from "@hi/common/src/useUserToken";
import Image from "next/image";
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
import { hasGuestContactDetails } from "./guestContactGuard";
import ServiceEtaBadge from "./ServiceEtaBadge";
import HotelLogoLoader from "./HotelLogoLoader";
import ServiceQuantityPopup from "./ServiceQuantityPopup";
import { resolveServiceInstructionMessage } from "./serviceBehavior";
import { getServiceTimingAvailability } from "./serviceAvailability";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";

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
  onAdd: () => void;
  onRemove: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onQuantitySelect: () => void;
  getInitial: (name: string) => string;
  requestCount: number;
  quantity: number;
  quantityLimit: number;
  requiresConfirmation: boolean;
  compact: boolean;
}

const ServiceItem = memo(
  function ServiceItemView({
    service,
    selected,
    onAdd,
    onRemove,
    onIncrement,
    onDecrement,
    onQuantitySelect,
    getInitial,
    requestCount,
    quantity,
    quantityLimit,
    requiresConfirmation,
    compact,
  }: ServiceItemProps) {
    const timingAvailability = getServiceTimingAvailability(service);
    const isUnavailable = !timingAvailability.available;

    const handleAdd = () => {
      if (isUnavailable) {
        toast(timingAvailability.label || "Service is unavailable right now.");
        return;
      }
      if (requiresConfirmation) {
        onQuantitySelect();
        return;
      }
      onAdd();
    };

    return (
      <section
        className={`services-inter-font relative flex flex-col overflow-hidden bg-white text-left transition-colors ${
          compact ? "rounded-[1rem]" : "rounded-[1.25rem]"
        } ${
          selected
            ? "border-[#07543D] ring-1 ring-[#07543D]"
            : "border-[#F1ECE7]"
        } ${isUnavailable ? "text-neutral-700" : "text-[#07152D]"}`}
      >
        <div
          className={`relative shrink-0 overflow-hidden bg-[#F4EEE7] ${
            compact
              ? "mx-1.5 mt-1.5 aspect-[4/5] rounded-[0.8rem]"
              : "mx-2 mt-2 aspect-[4/5] rounded-[1rem]"
          }`}
        >
          {service.image ? (
            <Image
              src={service.image}
              alt={service.name}
              fill
              sizes="(max-width: 448px) 46vw, 190px"
              className={`object-cover object-center ${isUnavailable ? "grayscale-[35%] opacity-80" : ""}`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#F4EEE7] text-3xl font-bold text-[#07543D]">
              {getInitial(service.name)}
            </div>
          )}

          <ServiceEtaBadge
            minutes={service.avgDeliveryTime}
            className={`absolute left-0 top-0 z-10 ${compact ? "origin-top-left scale-[0.78]" : ""} ${isUnavailable ? "grayscale opacity-80" : ""}`}
          />

          <button
            type="button"
            onClick={selected ? onRemove : handleAdd}
            aria-label={selected ? `Remove ${service.name}` : `Add ${service.name}`}
            className={`absolute z-10 flex h-6 w-6 items-center justify-center rounded-full border p-1 transition active:scale-95 right-0 top-0 ${
              selected
                ? "border-[#07543D] bg-[#07543D] text-white"
                : "border-[#EEE9E4] bg-white text-[#07152D]"
            }`}
          >
            {selected ? <CheckIcon className="h-5 w-5" /> : <Plus className="h-5 w-5" strokeWidth={2.2} />}
          </button>

        </div>

        <div
          className={`flex flex-1 flex-col items-start ${
            compact
              ? "min-h-[3.25rem] px-2.5 pb-2 pt-1.5"
              : "min-h-[4.5rem] px-3 pb-3 pt-2.5"
          }`}
        >
          <div className="w-full min-w-0">
            <p className={`${compact ? "text-[0.7rem]" : "text-[0.82rem]"} line-clamp-2 min-w-0 font-semibold leading-[1.2] tracking-[-0.015em] text-[#07152D]`}>
              {service.name || "Service"}
            </p>
            {requestCount > 0 && !selected ? (
              <span className={`${compact ? "mt-1 px-2 py-0.5 text-[0.55rem]" : "mt-2 px-2.5 py-1 text-[0.62rem]"} inline-flex shrink-0 rounded-full border border-[#C7D2FE] bg-[#e9e9fc] font-semibold leading-none text-[#3448E5]`}>
                Ordered: {requestCount}
              </span>
            ) : null}
          </div>

          {isUnavailable ? (
            <p className={`${compact ? "mt-0.5" : "mt-1"} line-clamp-2 text-[0.58rem] font-semibold leading-tight text-[#E12B12]`}>
              {timingAvailability.label || "Unavailable"}
            </p>
          ) : null}

          {selected && quantityLimit > 1 ? (
            <div className="mt-1 grid w-full grid-cols-[1.8rem_1fr_1.8rem] items-center gap-1.5">
              <button
                type="button"
                onClick={quantity <= 1 ? onRemove : onDecrement}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DDF9E8] text-[#07543D] active:scale-95"
                aria-label={`Decrease ${service.name} quantity`}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-center text-[0.88rem] font-bold tabular-nums text-[#07543D]">{quantity}</span>
              <button
                type="button"
                onClick={onIncrement}
                disabled={quantity >= quantityLimit}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DDF9E8] text-[#07543D] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Increase ${service.name} quantity`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </section>
    );
  }
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

  const changeServiceQuantity = useCallback(
    (serviceId: string, delta: number, quantityLimit: number) => {
      setSelectedServiceQuantities((prev) => {
        const current = prev[serviceId] || 0;
        const nextQuantity = Math.max(0, Math.min(quantityLimit, current + delta));
        if (nextQuantity === 0) {
          const { [serviceId]: _removed, ...next } = prev;
          return next;
        }
        return { ...prev, [serviceId]: nextQuantity };
      });
    },
    []
  );

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
      toast.error(error instanceof Error ? error.message : "Error sending request. Please try again.");
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

  const selectedServiceDetails = useMemo(
    () => category.serviceIds.filter((service) => selectedServices.includes(service._id)),
    [category.serviceIds, selectedServices]
  );

  const estimatedDeliveryMinutes = useMemo(
    () => Math.max(0, ...selectedServiceDetails.map((service) => Number(service.avgDeliveryTime) || 0)),
    [selectedServiceDetails]
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
              surfaceClassName="overflow-hidden bg-[#FCFBF9] shadow-none"
            >
              <div
                className={`services-inter-font relative h-[100dvh] overflow-y-auto bg-[#FCFBF9] hide-scrollbar ${
                  hasSelectedServices ? "pb-28" : "pb-4"
                }`}
              >
                <header className="sticky top-0 z-40 flex items-start gap-2.5 shadow-md rounded-b-xl bg-[#FCFBF9] px-3.5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
                  <button
                    type="button"
                    onClick={closeServicePopup}
                    aria-label="Go back"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3F2F0] text-[#07152D] transition active:scale-95"
                  >
                    <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-[1.05rem] font-bold leading-tight tracking-[-0.025em] text-[#07152D]">
                      {formattedCategoryName} Assistance
                    </h2>
                    <p className="mt-1 truncate text-[0.65rem] font-medium text-[#68758A]">
                      Select items to request&nbsp; · &nbsp;Delivered in minutes
                    </p>
                  </div>
                  <div className="relative flex h-10 w-14 shrink-0 items-center justify-center rounded-full border border-[#EEE9E4] bg-white text-[#07152D]">
                    <ShoppingCart className="h-5 w-5" strokeWidth={2.1} />
                    {selectedServices.length > 0 ? (
                      <span className="absolute -right-0.5 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#07543D] px-1 text-[0.65rem] font-bold text-white ring-2 ring-[#FCFBF9]">
                        {selectedServices.length}
                      </span>
                    ) : null}
                  </div>
                </header>

                <div className="px-3 py-3">
                  {isLoading && alertStatus === "idle" ? (
                    <div className="flex items-center justify-center py-10">
                      <LoadingSpinnerCircle />
                    </div>
                  ) : alertStatus === "error" ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <AlertCircle className="mb-4 h-16 w-16 text-red-500" />
                      <button
                        onClick={handleRetry}
                        className="rounded-2xl bg-[#07543D] px-5 py-3 font-semibold text-white"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {category.serviceIds.map((service) => {
                        const quantityLimit = getServiceQuantityLimit(service);
                        return (
                          <ServiceItem
                            key={service._id}
                            service={service}
                            selected={isSelected(service._id)}
                            onAdd={() => handleServiceToggle(service._id)}
                            onRemove={() => handleQuantityRemove(service._id)}
                            onIncrement={() => changeServiceQuantity(service._id, 1, quantityLimit)}
                            onDecrement={() => changeServiceQuantity(service._id, -1, quantityLimit)}
                            onQuantitySelect={() => openQuantityPopup(service)}
                            getInitial={getInitial}
                            requestCount={requestCounts.get(service._id) || 0}
                            quantity={selectedServiceQuantities[service._id] || 0}
                            quantityLimit={quantityLimit}
                            requiresConfirmation={Boolean(resolveServiceInstructionMessage(service))}
                            compact
                          />
                        );
                      })}
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
              </div>

              {hasSelectedServices ? (
              <footer className="services-inter-font animate-in fade-in slide-in-from-bottom-6 absolute inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white px-3 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-2 shadow-2xl duration-300">
                <div className="mx-auto flex max-w-md items-center gap-2.5">
                  <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[1rem] bg-[#FBFAF8] px-2 py-1.5">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-visible rounded-lg bg-[#F1ECE6]">
                      {selectedServiceDetails.slice(0, 2).map((service, index) =>
                        service.image ? (
                          <Image
                            key={service._id}
                            src={service.image}
                            alt=""
                            width={32}
                            height={32}
                            className={`absolute h-8 w-8 rounded-md object-cover ${
                              index === 0 ? "-translate-x-1.5" : "translate-x-2 translate-y-1.5"
                            }`}
                          />
                        ) : null
                      )}
                      {selectedServices.length === 0 ? <ShoppingCart className="h-5 w-5 text-[#87909F]" /> : null}
                      {selectedServices.length > 0 ? (
                        <span className="absolute -right-1.5 -top-1.5 z-10 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#07543D] px-1 text-[0.68rem] font-bold text-white ring-2 ring-white">
                          {selectedServices.length}
                        </span>
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[0.74rem] font-bold text-[#07152D]">
                        {selectedServices.length > 0
                          ? `${selectedServices.length} item${selectedServices.length === 1 ? "" : "s"} selected`
                          : "Select items"}
                      </p>
                      <p className="mt-0.5 truncate text-[0.58rem] font-medium text-[#758095]">
                        {estimatedDeliveryMinutes > 0
                          ? `Estimated delivery in ${estimatedDeliveryMinutes} mins`
                          : "Choose up to 2 services"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={alertStatus === "error" ? handleRetry : handleConfirmSelection}
                    disabled={!hasSelectedServices || alertStatus === "loading" || creatingAlert}
                    className="animate-in zoom-in-95 flex h-[3rem] min-w-[8.5rem] items-center justify-center gap-1 rounded-2xl bg-[#07543D] px-4 text-[0.76rem] font-semibold text-white transition duration-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#BFC7C3]"
                  >
                    {alertStatus === "loading" || creatingAlert ? (
                      <LoadingSpinnerCircle />
                    ) : (
                      <>
                        {alertStatus === "error" ? "Try Again" : "Request Items"}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </footer>
              ) : null}
            </BottomPopUp>
          )}
        </>
      )}
    </>
  );
}
const ServiceCategoryCard = memo(MemoServiceCategoryCard);
export default ServiceCategoryCard;
