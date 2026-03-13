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
import CleaningImg from "@/assets/hotel/clean_room.png";
import CheckoutImg from "@/assets/hotel/checkout.png";
import {
  useCreateAlert,
  useHotelRoomData,
} from "@/components/hooks/useHotelRoom";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import LoadingSpinnerCircle from "@/components/atoms/loader";

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

  // Hooks for service request
  const query = useSearchParams();
  const room = query.get("room");
  const { gettingRoomLoader, roomPayload } = useHotelRoomData();
  const { creatingAlert, createAlert } = useCreateAlert();

  const { checkoutRequest } = useCheckoutRequest();
  const { isPending, mutateAsync } = useMutation({
    mutationFn: checkoutRequest,
  });

  // Extract specific services from categories data
  const quickServices = useMemo(() => {
    if (!categoriesData || categoriesLoading) return [];

    const services: QuickService[] = [];

    // Find specific services by name with proper images
    const targetServices = [
      { name: "Get Water", subTitle: undefined, fallbackImage: null }, // Will use backend image
      {
        name: "Room Cleaning",
        subTitle: "in 10 mins",
        fallbackImage: CleaningImg,
      },
      { name: "Get Towel", subTitle: undefined, fallbackImage: null }, // Will use backend image
    ];

    // Search through all categories for these services using for...of
    for (const category of categoriesData) {
      for (const service of category.serviceIds) {
        const targetService = targetServices.find((target) =>
          service.name.toLowerCase().includes(target.name.toLowerCase()),
        );

        if (targetService && services.length < 3) {
          services.push({
            ...service,
            subTitle: targetService.subTitle,
            // Use backend image if available, otherwise use fallback
            image: service.image || targetService.fallbackImage,
          });
        }
      }
    }

    // Add checkout as the 4th item
    services.push({
      _id: "checkout",
      name: "Checkout",
      availability: true,
      isCheckout: true,
      image: CheckoutImg,
    });

    return services;
  }, [categoriesData, categoriesLoading]);

  const onChatClick = () => {
    setIsOpenChat(!isOpenChat);
  };

  useEffect(() => {
    updateTheme(themeData);
  }, [themeData]);

  const handleSelectService = (service: QuickService) => {
    console.log("Selected service:", service);

    if (service.isCheckout) {
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
    if (!selectedService || !userDetails?._id) return;

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
    userDetails?._id,
    businessId,
    room,
    roomPayload,
    createAlert,
    handleCloseServiceModal,
  ]);

  const handleRetryServiceRequest = useCallback(() => {
    setServiceRequestStatus("idle");
  }, []);

  const confirmCheckout = async () => {
    setIsSubmitting(true);
    mutateAsync({
      userId: userDetails?._id,
      businessId: businessId,
    });
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

  return (
    <>
      {categoriesLoading ? (
        renderLoadingSkeleton()
      ) : (
        <section className="grid grid-cols-4 gap-1.5 md:gap-2 lg:gap-2 mx-4 mb-6">
          {quickServices.map((service, index) => {
            let serviceImage = DummyImage;

            if (service.isCheckout) {
              serviceImage = CheckoutImg;
            } else if (service.image) {
              serviceImage = service.image;
            }

            return (
              <article
                key={service._id}
                onClick={() => handleSelectService(service)}
                onKeyDown={() => handleSelectService(service)}
                className="bg-white relative pb-4 overflow-hidden rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              >
                <Image
                  src={serviceImage || "/placeholder.svg"}
                  alt={service.name}
                  width={96}
                  height={96}
                  className="w-full h-full absolute -bottom-4 object-cover"
                />
                <div className="relative z-10">
                  <h4
                    className={cn(
                      "text-[0.625rem] uppercase leading-3 pt-1 px-1 h-[4.5rem] text-center !font-semibold text-gray-500 poppins-regular",
                      service.isCheckout && "text-primary",
                    )}
                  >
                    {service.name}
                  </h4>
                </div>

                {/* Availability indicator */}
                {!service.availability && !service.isCheckout && (
                  <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
                    <span className="text-[0.5rem] font-medium text-white bg-red-500 px-1 py-0.5 rounded">
                      Unavailable
                    </span>
                  </div>
                )}
              </article>
            );
          })}
        </section>
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
            For any further assistance.
          </p>
          <h1 className="font-semibold text-h-primary text-base poppins">
            Chat With Us
          </h1>
        </div>
        <Button
          size="icon"
          aria-label="Chat with us"
          className="relative transition-colors rounded-full bg-green-700 text-white"
        >
          <MessageCircle />
          <motion.span
            className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-700"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.2,
            }}
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
        onClose={() => !isSubmitting && setShowConfirmation(false)}
      >
        <AnimatePresence mode="wait">
          {isPending ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-6 text-center !poppins-regular"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-xl !poppins-regular font-semibold text-green-600 mb-2">
                Request Sent!
              </h2>
              <p className="text-gray-600 !poppins-regular">
                The help desk has been notified and will process your checkout
                request.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <Button
                variant="secondary"
                onClick={() => !isSubmitting && setShowConfirmation(false)}
                className="absolute right-4 top-4 text-black hover:text-gray-600 rounded-xl"
                disabled={isSubmitting}
              >
                <X color="red" />
              </Button>
              <CardContent className="p-0">
                <div className="p-6 text-center">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BellDot className="w-8 h-8 text-primary" />
                  </div>
                  {/* Title */}
                  <h2 className="text-xl font-normal text-gray-900 mb-2 inter">
                    Request to Check Out?
                  </h2>
                  <p className="text-gray-600 mb-6 inter text-sm">
                    We'll notify staff to prepare your checkout
                  </p>
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => setShowConfirmation(false)}
                      disabled={isSubmitting}
                    >
                      Not Yet
                    </Button>
                    <CommonBottomButton
                      fixed={true}
                      maxWidth="30rem"
                      buttons={[
                        {
                          text: "Swipe To Checkout",
                          onClick: confirmCheckout,
                          className: "w-full rounded-xl h-[2.5rem] !poppins-regular",
                          swipe: true,
                          disable: isSubmitting,
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
    </>
  );
};

export default ChatCardSection;
