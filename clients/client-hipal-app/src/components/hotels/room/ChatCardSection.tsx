"use client";

import { useHotelTemp } from "@/components/store/useHotelTemp";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, CheckCircle, X, BellDot } from "lucide-react";
import DummyImage from "@/assets/hotel/small.png";
import Image from "next/image";
import { cn } from "@/lib/utils";
import CommonBottomButton from "@/components/atoms/bottomButton";
import { motion, AnimatePresence } from "framer-motion";
import { useLogin } from "@/components/store/useLogin";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import { useCheckoutRequest } from "@/components/hooks/useHotel";
import { useMutation } from "@tanstack/react-query";
import { CardContent } from "@/components/ui/card";
import type { IThemes } from "@/components/types/businessData";
import { updateTheme } from "@/components/utils/themes";
import { useGetServiceCategories } from "@/components/hooks/useServicesHotel";
import type { IService } from "@/components/hooks/useServicesHotel";
import { Skeleton } from "@/components/ui/skeleton";
import CheckoutImg from "@/assets/hotel/checkout.jpeg";
import {
  useCreateAlert,
  useHotelRoomData,
} from "@/components/hooks/useHotelRoom";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import LoadingSpinnerCircle from "@/components/atoms/loader";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { hasGuestContactDetails } from "./guestContactGuard";
import CheckoutStatusPopup from "./CheckoutStatusPopup";
import { useUserToken } from "@hi/common/src/useUserToken";

interface QuickService extends IService {
  isCheckout?: boolean;
  subTitle?: string;
}

type ServiceRequestStatus = "idle" | "loading" | "success" | "error";

const ChatCardSection = ({
  businessId,
  themeData,
}: { businessId: string; themeData: IThemes }) => {
  const { categoriesLoading, categoriesData } =
    useGetServiceCategories(businessId);
  const { setIsOpenChat, isOpenChat } = useHotelTemp();
  const userDetails = useLogin((s) => s.userDetails);
  const setCheckLogin = usePaymentStore((s) => s.setCheckLogin);
  const accessToken = useUserToken.getState().accessToken;
  const {
    isSubmitting,
    setIsSubmitting,
    showConfirmation,
    setShowConfirmation,
  } = useHotelTemp();

  // Service request modal states
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState<QuickService | null>(
    null,
  );
  const [serviceRequestStatus, setServiceRequestStatus] =
    useState<ServiceRequestStatus>("idle");

  // Checkout modal: switched to the success view after the request is sent.
  const [checkoutRequestSent, setCheckoutRequestSent] = useState(false);
  // True when the room already had an active checkout request (backend guard).
  const [checkoutAlreadyInProgress, setCheckoutAlreadyInProgress] =
    useState(false);
  const [checkoutEtaMinutes, setCheckoutEtaMinutes] = useState<number | null>(
    null,
  );

  const handleCloseCheckout = useCallback(() => {
    setShowConfirmation(false);
    setCheckoutRequestSent(false);
    setCheckoutAlreadyInProgress(false);
    setCheckoutEtaMinutes(null);
  }, [setShowConfirmation]);

  // Hooks for service request
  const query = useSearchParams();
  const room = query.get("room");
  const { gettingRoomLoader, roomPayload } = useHotelRoomData();
  const { creatingAlert, createAlert } = useCreateAlert();

  const { checkoutRequest } = useCheckoutRequest();
  const { isPending, mutateAsync } = useMutation({
    mutationFn: checkoutRequest,
  });

  // Quick actions come from the system "Quick Actions" service category —
  // fully managed by the business in hibiz (names, times, images, order).
  const quickServices: QuickService[] = useMemo(() => {
    if (!categoriesData || categoriesLoading) return [];

    const quickActionsCategory = categoriesData.find(
      (category) => category.systemKey === "QUICK_ACTIONS",
    );
    if (!quickActionsCategory) return [];

    return quickActionsCategory.serviceIds
      .filter((service) => service.availability !== false)
      .map((service) =>
        service.systemKey === "CHECKOUT"
          ? {
              ...service,
              isCheckout: true,
              image: CheckoutImg as unknown as string,
            }
          : { ...service, image: service.image || "" },
      );
  }, [categoriesData, categoriesLoading]);

  const onChatClick = () => {
    setIsOpenChat(!isOpenChat);
  };

  useEffect(() => {
    updateTheme(themeData);
  }, [themeData]);

  const handleSelectService = (service: QuickService) => {
    if (!accessToken || !hasGuestContactDetails(userDetails)) {
      toast.info("Please add your name and phone number to continue.");
      setCheckLogin(true);
      return;
    }

    if (service.isCheckout) {
      setCheckoutRequestSent(false);
      setCheckoutAlreadyInProgress(false);
      setShowConfirmation(true);
    } else {
      // Open service request modal for other services
      setSelectedService(service);
      setShowServiceModal(true);
      setServiceRequestStatus("idle");
    }
  };

  const handleCloseServiceModal = useCallback(() => {
    setShowServiceModal(false);
    setSelectedService(null);
    setServiceRequestStatus("idle");
  }, []);

  const handleConfirmServiceRequest = useCallback(async () => {
    if (!selectedService) return;
    if (!accessToken || !hasGuestContactDetails(userDetails)) {
      toast.info("Please add your name and phone number to continue.");
      setCheckLogin(true);
      return;
    }

    try {
      setServiceRequestStatus("loading");

      // Get room data
      const roomData = await roomPayload({
        businessId,
        roomName: room || "hipalz",
      });

      if (!roomData?.data?._id) {
        throw new Error("Could not find room data");
      }

      // Create the alert for the selected service
      await createAlert({
        serviceIds: [selectedService._id],
        businessId,
        userId: userDetails._id,
        roomId: roomData.data._id,
      });

      setServiceRequestStatus("success");
      toast.success(`${selectedService.name} request sent successfully`);

      // Auto-close after success
      setTimeout(() => {
        handleCloseServiceModal();
      }, 1500);
    } catch (error) {
      console.error("Error creating service request:", error);
      setServiceRequestStatus("error");
      toast.error("Error sending request. Please try again.");
    }
  }, [
    selectedService,
    userDetails,
    setCheckLogin,
    businessId,
    room,
    roomPayload,
    createAlert,
    handleCloseServiceModal,
    accessToken,
  ]);

  const handleRetryServiceRequest = useCallback(() => {
    setServiceRequestStatus("idle");
  }, []);

  const confirmCheckout = async () => {
    if (!accessToken || !hasGuestContactDetails(userDetails)) {
      toast.info("Please add your name and phone number to continue.");
      setCheckLogin(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = (await mutateAsync({
        userId: userDetails?._id,
        businessId: businessId,
      })) as
        | { data?: { alreadyRequested?: boolean; etaMinutes?: number } }
        | undefined;
      // Switch the checkout modal to its success view (ETA shown there).
      setCheckoutAlreadyInProgress(Boolean(result?.data?.alreadyRequested));
      setCheckoutEtaMinutes(result?.data?.etaMinutes ?? null);
      setCheckoutRequestSent(true);
    } catch (error) {
      console.error("Error sending checkout request:", error);
      toast.error("Could not send checkout request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading skeleton for quick services
  const renderLoadingSkeleton = () => (
    <section className="grid grid-cols-4 gap-2 mx-4 mb-6">
      {[...Array(4)].map((_, index) => (
        <Skeleton key={index} className="h-[4.5rem] rounded-2xl" />
      ))}
    </section>
  );

  const isServiceLoading = gettingRoomLoader || creatingAlert;

  // Resolution time of the Checkout service (set in hibiz), shown as the ETA.
  const checkoutCompletionMins =
    checkoutEtaMinutes ||
    quickServices.find((service) => service.isCheckout)?.avgCompletionTime ||
    15;

  return (
    <>
      {categoriesLoading ? (
        renderLoadingSkeleton()
      ) : (
        <>
          {/* QUICK ACTIONS GROUP */}
          <section className="mx-4 mb-8 p-4 rounded-3xl bg-gradient-to-br from-[#FAF9F6] to-[#F5F2F0] border border-[#E9E4DC]/50 shadow-[0_4px_20px_rgba(0,0,0,0.03)] selection:bg-none">
            <div className="mb-4 flex items-center gap-2 px-1">
              <div className="h-4 w-1 bg-gradient-to-b from-[#E85D3A] to-[#E85D3A]/40 rounded-full" />
              <h3 className="font-semibold text-[#4A433D] text-[0.95rem] poppins tracking-tight uppercase">
                Quick Actions
              </h3>
            </div>

            <div className="grid grid-cols-4 gap-x-3 gap-y-3">
              {quickServices.map((service) => {
                // No backend image → show the service name as a text tile
                // instead of a dummy photo (checkout always has its own image).
                const hasImage = service.isCheckout || Boolean(service.image);
                const serviceImage = service.isCheckout
                  ? CheckoutImg
                  : service.image;

                return (
                  <article
                    key={service._id}
                    onClick={() => handleSelectService(service)}
                    onKeyDown={() => handleSelectService(service)}
                    className="group flex flex-col items-center cursor-pointer"
                  >
                    {/* Uniform image tile */}
                    <div className="relative h-[78px] w-[78px] overflow-hidden rounded-[24px] border border-white bg-white shadow-[0_6px_16px_rgba(0,0,0,0.04)] ring-1 ring-[#E9E4DC]/40 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] group-active:scale-95">
                      {hasImage ? (
                        <>
                          <Image
                            src={serviceImage || "/placeholder.svg"}
                            alt={service.name}
                            fill
                            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.1]"
                          />

                          <div className="absolute inset-0 rounded-[24px] ring-1 ring-inset ring-white/30" />
                        </>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#F5F2EE] to-[#E9E4DC] p-2">
                          <span className="line-clamp-3 text-center text-[0.7rem] font-semibold leading-tight text-[#6B625A] font-poppins">
                            {service.name}
                          </span>
                        </div>
                      )}

                      {!service.availability && !service.isCheckout && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[24px] bg-white/70 backdrop-blur-[2px]">
                          <span className="rounded-full bg-red-500/90 px-1.5 py-0.5 text-[0.5rem] font-bold text-white uppercase tracking-wider">
                            OFF
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Label below */}
                    <div className="mt-2 min-h-[28px] px-0.5 text-center">
                      <span
                        className={cn(
                          "text-[#6B625A] text-[0.8rem] font-medium leading-[1.1] tracking-tight line-clamp-2 transition-colors duration-200 group-hover:text-black font-poppins",
                          service.isCheckout && "text-[#E85D3A] font-semibold"
                        )}
                      >
                        {service.name}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}

      <div
        onClick={onChatClick}
        onKeyDown={onChatClick}
        className="mx-4 mt-2 mb-4 bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.08)] px-4 py-4 flex items-center cursor-pointer transition hover:shadow-xl active:scale-[0.98]"
        role="button"
        tabIndex={0}
        aria-label="Open chat"
      >
        <div className="flex-1">
          <p className="font-light text-h-primary text-xs poppins mb-1">
            Track Your Service Requests
          </p>
          <h1 className="font-semibold text-h-primary text-base poppins">
            Click to view
          </h1>
        </div>
    <Button
      size="icon"
      className="relative h-11 w-11 rounded-full border border-white/60 bg-[#178A43] text-white shadow-[0_6px_14px_rgba(23,138,67,0.24)] transition-all duration-200 hover:scale-[1.03] hover:bg-[#147B3B]"
    >
      <MessageCircle size={18} />
      <motion.span
        className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full border border-white bg-[#22C55E]"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
      />
    </Button>
      </div>

      {/* Service Request Modal */}
      <BottomPopUp
        hide
        height="auto"
        show={showServiceModal}
        onClose={() => !isServiceLoading && handleCloseServiceModal()}
      >
        <AnimatePresence mode="wait">
          {serviceRequestStatus === "success" ? (
            <motion.div
              key="service-success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-6 text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-green-600 mb-2">
                Request Sent!
              </h2>
              <p className="text-gray-600">
                Your {selectedService?.name} request has been sent to the staff.
              </p>
            </motion.div>
          ) : serviceRequestStatus === "loading" ? (
            <motion.div
              key="service-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 text-center"
            >
              <LoadingSpinnerCircle />
              <p className="mt-4 text-gray-600">Sending your request...</p>
            </motion.div>
          ) : (
            <motion.div
              key="service-confirm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <Button
                variant="secondary"
                onClick={() => !isServiceLoading && handleCloseServiceModal()}
                className="absolute right-4 top-4 text-black hover:text-gray-600 rounded-xl"
                disabled={isServiceLoading}
              >
                <X color="red" />
              </Button>
              <CardContent className="p-0">
                <div className="p-6 text-center">
                  {/* Service Image */}
                  <div className="w-16 h-16 mx-auto mb-4 relative">
                    <Image
                      src={
                        selectedService?.image ||
                        DummyImage ||
                        "/placeholder.svg"
                      }
                      alt={selectedService?.name || "Service"}
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-normal text-gray-900 mb-2 inter">
                    Request {selectedService?.name}?
                  </h2>
                  <p className="text-gray-600 mb-6 inter text-sm">
                    We'll notify staff to bring{" "}
                    {selectedService?.name.toLowerCase()} to your room
                  </p>

                  {/* Error State */}
                  {serviceRequestStatus === "error" && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">
                        Failed to send request. Please try again.
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={handleCloseServiceModal}
                      disabled={isServiceLoading}
                    >
                      Cancel
                    </Button>
                    <CommonBottomButton
                      fixed={true}
                      maxWidth="30rem"
                      buttons={[
                        {
                          text:
                            serviceRequestStatus === "error"
                              ? "Try Again"
                              : `Swipe for ${selectedService?.name}`,
                          onClick:
                            serviceRequestStatus === "error"
                              ? handleRetryServiceRequest
                              : handleConfirmServiceRequest,
                          className: "w-full rounded-xl h-[2.5rem]",
                          swipe: serviceRequestStatus !== "error",
                          disable: isServiceLoading,
                        },
                      ]}
                    />
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </BottomPopUp>

      {/* Checkout Modal */}
      <BottomPopUp
        hide
        height="auto"
        show={showConfirmation}
        onClose={() => !isSubmitting && handleCloseCheckout()}
      >
        <AnimatePresence mode="wait">
          {isPending ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 pt-8 text-center"
            >
              <LoadingSpinnerCircle />
              <p className="mt-4 font-poppins text-sm text-gray-500">
                Sending your checkout request...
              </p>
            </motion.div>
          ) : checkoutRequestSent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="relative overflow-hidden p-6 pt-8 text-center"
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-green-100/80 to-transparent"
                aria-hidden
              />
              <div className="relative flex justify-center">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 18 }}
                  className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-[0_10px_24px_rgba(22,163,74,0.35)]"
                >
                  <CheckCircle
                    className="h-9 w-9 text-white"
                    strokeWidth={2.2}
                  />
                  <motion.span
                    className="absolute inset-0 rounded-full ring-4 ring-green-300/60"
                    animate={{ opacity: [0.9, 0], scale: [1, 1.3] }}
                    transition={{ duration: 1.4, ease: "easeOut" }}
                  />
                </motion.div>
              </div>
              <h2 className="relative mt-5 font-poppins text-[1.35rem] font-semibold tracking-tight text-gray-900">
                {checkoutAlreadyInProgress
                  ? "Checkout In Progress"
                  : "Request Sent!"}
              </h2>
              <p className="relative mx-auto mt-2 max-w-[16rem] font-poppins text-sm leading-relaxed text-gray-500">
                {checkoutAlreadyInProgress
                  ? "Your checkout request is already with the front office."
                  : "Your checkout request has been sent to the front office."}
              </p>
              <div className="relative mt-5 rounded-2xl bg-green-50/80 px-4 py-3.5 ring-1 ring-green-100">
                <div className="flex items-center justify-center gap-1.5 font-poppins text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-green-700/80">
                  Please visit the front office within
                </div>
                <p className="mt-0.5 font-poppins text-lg font-bold text-green-700">
                  {checkoutCompletionMins} minutes
                </p>
              </div>
              <Button
                className="relative mt-6 h-11 w-full rounded-2xl bg-gradient-to-r from-green-500 to-green-600 font-poppins text-[0.95rem] font-semibold text-white shadow-[0_8px_20px_rgba(22,163,74,0.3)] hover:from-green-600 hover:to-green-700 active:scale-[0.98]"
                onClick={handleCloseCheckout}
              >
                Done
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative overflow-hidden p-6 pt-8 text-center"
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-blue-100/70 to-transparent"
                aria-hidden
              />
              <Button
                variant="secondary"
                onClick={() => !isSubmitting && handleCloseCheckout()}
                className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full bg-transparent p-0 text-gray-400 shadow-none hover:bg-gray-100 hover:text-gray-600"
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardContent className="p-5">
                <div className="relative flex justify-center">
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 320, damping: 18 }}
                    className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_10px_24px_rgba(37,99,235,0.35)]"
                  >
                    <BellDot
                      className="h-9 w-9 text-white"
                      strokeWidth={2.2}
                    />
                  </motion.div>
                </div>
                <h2 className="relative mt-5 font-poppins text-[1.35rem] font-semibold tracking-tight text-gray-900">
                  Request to Check Out?
                </h2>
                <p className="relative mx-auto mt-2 max-w-[16rem] font-poppins text-sm leading-relaxed text-gray-500">
                  We'll notify the front office staff to prepare your checkout.
                </p>
                <div className="relative mt-6 flex items-center gap-3 h-2">
                  <CommonBottomButton
                    fixed={true}
                    maxWidth="30rem"
                    buttons={[
                      {
                        text: "Swipe To Checkout",
                        onClick: confirmCheckout,
                        className:
                          "h-11 w-full rounded-2xl font-poppins text-[0.95rem] font-semibold shadow-[0_8px_20px_rgba(37,99,235,0.3)]",
                        swipe: true,
                        disable: isSubmitting,
                      },
                    ]}
                  />
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </BottomPopUp>

      <CheckoutStatusPopup
        businessId={businessId}
        roomName={room || "hipalz"}
      />
    </>
  );
};

export default ChatCardSection;
