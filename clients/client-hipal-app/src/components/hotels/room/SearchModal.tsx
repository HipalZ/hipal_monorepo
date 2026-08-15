"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, X } from "lucide-react";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import type {
  IService,
  IServiceCategory,
} from "@/components/hooks/useServicesHotel";
import CommonBottomButton from "@/components/atoms/bottomButton";
import { useUserToken } from "@hi/common/src/useUserToken";
import { useLogin } from "@/components/store/useLogin";
import { useSearchParams } from "next/navigation";
import {
  useCreateAlert,
  useHotelRoomData,
} from "@/components/hooks/useHotelRoom";
import toast from "react-hot-toast";
import LoadingSpinnerCircle from "@/components/atoms/loader";
import dynamic from "next/dynamic";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { hasGuestContactDetails } from "./guestContactGuard";

// Lazy-loaded components
const AlertCircle = dynamic(
  () => import("lucide-react").then((mod) => ({ default: mod.AlertCircle })),
  { ssr: false }
);
const CheckIcon = dynamic(
  () => import("lucide-react").then((mod) => ({ default: mod.Check })),
  { ssr: false }
);

// Types
type AlertStatus = "idle" | "loading" | "success" | "error";

const SERVICE_ACTION_COLOR = "#111111";
const SERVICE_ACTION_TEXT_COLOR = "#ffffff";

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

interface SearchModalProps {
  show: boolean;
  onClose: () => void;
  categories: IServiceCategory[];
  businessId: string;
}

interface SearchResultItemProps {
  service: IService;
  categoryName: string;
  selected: boolean;
  onToggle: () => void;
  getInitial: (name: string) => string;
}

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-10">
    <AlertCircle className="w-16 h-16 mb-4 text-red-500" />
    <h3 className="text-xl font-semibold text-[#111111]">Request Failed</h3>
    <p className="mt-2 text-center text-gray-500 mb-4">
      There was an error sending your request. Please try again.
    </p>
    <button
      type="button"
      onClick={onRetry}
      className="rounded-md bg-[#111111] px-4 py-2 text-white transition-colors hover:bg-neutral-800"
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

const SearchResultItem = ({
  service,
  categoryName,
  selected,
  onToggle,
  getInitial,
}: SearchResultItemProps) => (
  <Card
    className={`cursor-pointer transition-all duration-200 relative ${
      selected
        ? "border-[#111111] bg-neutral-50 shadow-md ring-1 ring-[#111111]/10"
        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
    } ${service.availability === false ? "opacity-50 cursor-not-allowed" : ""}`}
    onClick={() => {
      if (service.availability !== false) {
        onToggle();
      }
    }}
  >
    <CardContent className="p-3">
      <div className="flex items-center gap-3">
        {/* Selection indicator */}
        {selected && (
          <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#111111]">
            <CheckIcon className="w-3 h-3 text-white" />
          </div>
        )}

        {/* Service Image/Avatar */}
        <div className="flex-shrink-0">
          {service.image ? (
            <Image
              src={service.image || "/placeholder.svg"}
              alt={service.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-[#111111] text-white text-sm font-semibold">
                {getInitial(service.name)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Service Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-gray-900 truncate">
            {service.name}
          </h4>
          <p className="text-xs text-gray-500 capitalize">
            {categoryName.replace(/[^a-zA-Z0-9 ]/g, " ").toLowerCase()}
          </p>
        </div>

        {/* Availability Status */}
        {service.availability === false && (
          <div className="flex-shrink-0">
            <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded">
              Unavailable
            </span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default function SearchModal({
  show,
  onClose,
  categories,
  businessId,
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [alertStatus, setAlertStatus] = useState<AlertStatus>("idle");

  // Hooks
  const accessToken = useUserToken.getState().accessToken;
  const userDetails = useLogin((s) => s.userDetails);
  const setCheckLogin = usePaymentStore((s) => s.setCheckLogin);
  const query = useSearchParams();
  const room = query.get("room");
  const { gettingRoomLoader, roomPayload } = useHotelRoomData();
  const { creatingAlert, createAlert } = useCreateAlert();

  // Derived state
  const isLoading = gettingRoomLoader;
  const hasSelectedServices = selectedServices.length > 0;
  const maxSelectableServices = 2;

  // Flatten all services from all categories for searching
  const allServices = useMemo(() => {
    const services: Array<{ service: IService; categoryName: string }> = [];

    for (const category of categories) {
      for (const service of category.serviceIds) {
        if (service.availability === false) continue;
        services.push({
          service,
          categoryName: category.name,
        });
      }
    }

    return services;
  }, [categories]);

  // Filter services based on search query
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    return allServices.filter(({ service, categoryName }) => {
      const serviceName = service.name.toLowerCase();
      const categoryNameFormatted = categoryName
        .replace(/[^a-zA-Z0-9 ]/g, " ")
        .toLowerCase();

      return (
        serviceName.includes(query) || categoryNameFormatted.includes(query)
      );
    });
  }, [searchQuery, allServices]);

  const selectedServiceNames = useMemo(
    () =>
      allServices
        .filter(({ service }) => selectedServices.includes(service._id))
        .map(({ service }) => service.name),
    [allServices, selectedServices]
  );

  // Service selection handlers
  const handleServiceToggle = useCallback(
    (serviceId: string) => {
      if (
        !selectedServices.includes(serviceId) &&
        selectedServices.length >= maxSelectableServices
      ) {
        toast("You can request up to 2 services at a time.");
        return;
      }

      setSelectedServices((prev) => {
        if (prev.includes(serviceId)) {
          return prev.filter((id) => id !== serviceId);
        }
        return [...prev, serviceId];
      });
    },
    [maxSelectableServices, selectedServices]
  );

  const isSelected = useCallback(
    (serviceId: string) => selectedServices.includes(serviceId),
    [selectedServices]
  );

  // Alert creation handler
  const handleConfirmSelection = async () => {
    if (!hasSelectedServices) return;
    if (!accessToken || !hasGuestContactDetails(userDetails)) {
      toast("Please add your name and phone number to continue.");
      setCheckLogin(true);
      return;
    }

    try {
      setAlertStatus("loading");

      // Get room data
      const roomData = (await roomPayload({
        businessId,
        roomName: room || "hipalz",
      })) as { data?: { _id?: string } };

      const roomId = roomData?.data?._id;
      if (!roomId) {
        throw new Error("Could not find room data");
      }

      // Create the alert
      await createAlert({
        serviceIds: selectedServices,
        businessId,
        userId: userDetails?._id || "",
        roomId,
      });

      toast.success(formatRaisedServicesToast(selectedServiceNames));
      setAlertStatus("idle");
      setSelectedServices([]);
    } catch (error) {
      console.error("Error creating alert:", error);
      setAlertStatus("error");
      toast.error("Error sending request. Please try again.");
    }
  };

  const handleRetry = useCallback(() => {
    setAlertStatus("idle");
  }, []);

  const getInitial = useCallback((name: string) => {
    return name.charAt(0).toUpperCase();
  }, []);

  const handleClose = useCallback(() => {
    setSearchQuery("");
    setSelectedServices([]);
    setAlertStatus("idle");
    onClose();
  }, [onClose]);

  return (
    <BottomPopUp show={show} onClose={handleClose} hide manageHistory={false}>
      <div className="p-4 max-h-[90dvh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#111111]">Search Services</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close search"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            type="text"
            placeholder="Search for services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-3 text-black border-gray-300 focus:border-[#111111] focus:ring-[#111111]"
            autoFocus
            disabled={alertStatus === "loading"}
          />
        </div>

        {/* Selected Services Counter */}
        {hasSelectedServices && alertStatus === "idle" && (
          <div className="mb-4 rounded-lg bg-neutral-100 p-2">
            <p className="text-sm font-medium text-neutral-950">
              {selectedServices.length} service
              {selectedServices.length !== 1 ? "s" : ""} selected
            </p>
          </div>
        )}

        {/* Search Results */}
        <div className="flex-1 overflow-auto hide-scrollbar mb-20">
          {isLoading && alertStatus === "idle" ? (
            <LoadingState />
          ) : alertStatus === "error" ? (
            <ErrorState onRetry={handleRetry} />
          ) : !searchQuery.trim() ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                Search for Services
              </h3>
              <p className="text-sm text-gray-400">
                Type in the search box to find services across all categories
              </p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                No Results Found
              </h3>
              <p className="text-sm text-gray-400">
                Try searching with different keywords
              </p>
            </div>
          ) : (
            <div className="space-y-2 pb-4">
              <p className="text-sm text-gray-600 mb-3">
                Found {filteredServices.length} service
                {filteredServices.length !== 1 ? "s" : ""}
              </p>
              {filteredServices.map(({ service, categoryName }, index) => (
                <SearchResultItem
                  key={`${service._id}-${index}`}
                  service={service}
                  categoryName={categoryName}
                  selected={isSelected(service._id)}
                  onToggle={() => handleServiceToggle(service._id)}
                  getInitial={getInitial}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Action Buttons */}
        <CommonBottomButton
          fixed={true}
          buttons={[
            {
              text: "Cancel",
              onClick: handleClose,
              className: "rounded-md pl-3",
              isBackButton: true,
              color: SERVICE_ACTION_COLOR,
              textColor: SERVICE_ACTION_TEXT_COLOR,
              disable: alertStatus === "loading",
            },
            {
              text: alertStatus === "error" ? "Try Again" : "Request Services",
              onClick:
                alertStatus === "error" ? handleRetry : handleConfirmSelection,
              className: "w-full rounded-md",
              color: SERVICE_ACTION_COLOR,
              textColor: SERVICE_ACTION_TEXT_COLOR,
              disable: !hasSelectedServices || alertStatus === "loading",
              isLoading: alertStatus === "loading" || creatingAlert,
            },
          ]}
        />
      </div>
    </BottomPopUp>
  );
}
