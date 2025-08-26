import { formatDistanceToNow } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  Package,
  User,
  Phone,
  CheckCheck,
  Loader2,
  ShoppingCart,
  ChevronLeft,
} from "lucide-react";
import { useAlertsStore } from "../store/useAlertStore";
import type { Alert, Cart } from "../types/hotelData";
import BottomPopUp from "../atoms/universalPopup";
import CartDetailsHotel from "./cartDetailsHotel";
import { useMutation } from "@tanstack/react-query";
import { useEditAlertCart, useRespondAlerts } from "@/hooks/useHotelApis";
import { useAlertsColors } from "../utils/helpersHotel";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CommonBottomButton from "../atoms/bottomButton";
import { useHiClientZ } from "../store/useHiClientzData";

export interface AlertCardProps {
  alert: Alert;
}

export function AlertCardHotel({ alert }: AlertCardProps) {
  const { borderColor } = useAlertsColors();
  const staffRole = useHiClientZ((s) => s.selectedBiz?.role);
  const { showOrderDetails, setShowOrderDetails, setIsLoading, isLoading } =
    useAlertsStore();
  const { respondAlert } = useRespondAlerts();
  const { mutateAsync } = useMutation({
    mutationFn: respondAlert,
  });

  // State for rejection popup
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localCart, setLocalCart] = useState<Cart[]>(alert?.cart || []);
  const { editCart } = useEditAlertCart();

  const rejectionReasons = [
    { id: "out_of_stock", label: "Item out of stock" },
    { id: "unavailable_service", label: "Service temporarily unavailable" },
    { id: "staff_unavailable", label: "Staff unavailable at the moment" },
    { id: "invalid_request", label: "Invalid or unclear request" },
    { id: "maintenance_issue", label: "Maintenance issue" },
    { id: "other", label: "Other reason" },
  ];

  const handleAction = useCallback(
    async (alertId: string, action: string, reasonOfRejection?: string) => {
      setIsLoading(action);
      setIsSubmitting(true);
      try {
        await mutateAsync({ alertId, action, reasonOfRejection });
        toast.success(`Alert ${action?.toLowerCase()} successfully`);
        setShowRejectPopup(false);
      } catch (error) {
        toast.error(error?.message || "Something went wrong");
      } finally {
        setIsLoading(null);
        setIsSubmitting(false);
        setRejectionReason("");
        setCustomReason("");
      }
    },
    [mutateAsync, setIsLoading],
  );

  const handleReject = useCallback(() => {
    setShowRejectPopup(true);
  }, []);

  const submitRejection = () => {
    const finalReason =
      rejectionReason === "other"
        ? customReason.trim()
        : rejectionReasons.find((r) => r.id === rejectionReason)?.label || "";

    if (rejectionReason === "other" && !customReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    handleAction(alert?._id, "REJECTED", finalReason);
  };

  // API mutation for updating the cart
  const { isPending } = useMutation({
    mutationFn: editCart,
  });

  const updateCart = (alertId: string) => {
    editCart({
      alertId: alertId,
      cart: localCart,
    });
  };

  const cancelChanges = () => {
    setLocalCart(alert?.cart);
    setShowOrderDetails(null);
  };

  const hasCart = alert?.cart && alert?.cart?.length > 0;
  const timeAgo = formatDistanceToNow(new Date(alert?.createdAt), {
    addSuffix: true,
  });

  const PENDING_STATES = [
    "CREATED",
    "NON_ACCEPTED_AND_WARNING",
    "NON_ACCEPTED_AND_ESCALATION",
  ];
  const ACCEPTED_STATES = [
    "ACCEPTED",
    "IS_ACCEPTED_AND_WARNING",
    "IS_ACCEPTED_AND_ESCALATION",
  ];
  const CLOSED_STATES = ["REJECTED", "DELIVERED"];

  const isPendingState = (p?: string) => PENDING_STATES.includes(p ?? "");
  const isAcceptedState = (p?: string) => ACCEPTED_STATES.includes(p ?? "");
  const isClosedState = (p?: string) => CLOSED_STATES.includes(p ?? "");

  return (
    <Card
      className={`${
        alert?.alertProgress === "NOT_DELIVERED" ? "animation-blink" : ""
      } border border-l-4 overflow-hidden hover:shadow-md transition-all duration-200`}
      style={{
        borderLeftColor: borderColor(alert?.alertProgress),
      }}
    >
      {/* Primary information section */}
      <div className="p-4">
        {/* Room number and time */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold flex items-center">
            Room {alert?.roomId?.name}
          </h3>
          <div className="text-xs text-gray-500">{timeAgo}</div>
        </div>
        <h1 className="my-2">{alert?.alertProgress}</h1>
        {/* Services */}
        <div className="flex flex-wrap gap-2 mb-3">
          {alert?.serviceIds.map((service) => (
            <Badge
              key={service._id}
              variant="outline"
              className="flex items-center gap-1"
            >
              <Package className="h-3.5 w-3.5" />
              {service?.name}
            </Badge>
          ))}
          <h1 className="text-sm">{alert?.message}</h1>
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
            <AccordionTrigger className="py-2 text-sm text-gray-900 font-medium">
              Guest Information
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Guest</div>
                    <div className="flex items-center">
                      <User className="h-3.5 w-3.5 text-gray-600 mr-1" />
                      <span className="font-medium">
                        {alert?.createdBy?.name}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">Contact</div>
                    <div className="flex items-center">
                      <Phone className="h-3.5 w-3.5 text-gray-600 mr-1" />
                      <span>
                        {staffRole === "MANAGER"
                          ? alert?.createdBy?.phone
                          : alert?.createdBy?.phone
                            ? alert.createdBy.phone.replace(
                                /^(\d{2})\d{5,}(\d{2})$/,
                                (match, p1, p2) =>
                                  `${p1}${"*".repeat(
                                    alert.createdBy.phone.length -
                                      (p1.length + p2.length),
                                  )}${p2}`,
                              )
                            : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {alert?.acceptedBy && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">
                      Accepted By
                    </div>
                    <div className="flex items-center text-green-600">
                      <User className="h-3.5 w-3.5 mr-1" />
                      <span className="font-medium">
                        {alert?.acceptedBy?.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Action buttons */}
        <div className="flex gap-2">
          {isPendingState(alert?.alertProgress) ? (
            <>
              <Button
                variant="outline"
                className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                onClick={handleReject}
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
          ) : null}

          {isAcceptedState(alert?.alertProgress) ? (
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
          ) : null}

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

          {isClosedState(alert?.alertProgress) && (
            <div className="w-full text-center text-sm text-gray-500 py-2 bg-gray-50 rounded-md">
              No action required
            </div>
          )}
        </div>
      </div>

      {/* Order details popup */}
      {showOrderDetails === alert?._id && (
        <BottomPopUp hide show={true} onClose={() => setShowOrderDetails(null)}>
          <div className="p-4">
            <div className="flex items-center gap-4">
              <Button
                size="icon"
                onClick={() => setShowOrderDetails(null)}
                className="mr-2"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold">
                Order Details - Room {alert?.roomId?.name}
              </h2>
            </div>

            {hasCart ? (
              <div className="space-y-3 p-4">
                <CartDetailsHotel
                  localCart={localCart}
                  setLocalCart={setLocalCart}
                  readOnly={false}
                />
              </div>
            ) : (
              <div className="text-center py-6">
                <p>No order items found</p>
              </div>
            )}
          </div>
          <CommonBottomButton
            maxWidth="48rem"
            position="mid"
            fixed
            shadow
            buttons={[
              {
                text: "Cancel",
                onClick: cancelChanges,
                className: "rounded-lg pl-3",
              },
              {
                text: "Update",
                onClick: () => updateCart(alert?._id),
                hide: alert?.alertProgress === "MESSAGE",
                className: "rounded-lg shadow-md text-white",
                disable: isPending,
              },
            ]}
          />
        </BottomPopUp>
      )}

      {/* Rejection Reason Popup */}
      {showRejectPopup && (
        <BottomPopUp
          hide
          show={true}
          onClose={() => !isSubmitting && setShowRejectPopup(false)}
        >
          <div className="pt-4 pb-6 px-4">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                disabled={isSubmitting}
                size="icon"
                onClick={() => !isSubmitting && setShowRejectPopup(false)}
                className="mr-2"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold">Reason for Rejection</h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Please select a reason for rejecting this request from Room{" "}
                {alert?.roomId?.name}
              </p>

              <RadioGroup
                value={rejectionReason}
                onValueChange={setRejectionReason}
                className="gap-3"
              >
                {rejectionReasons.map((reason) => (
                  <div
                    key={reason.id}
                    className="flex items-center space-x-2 border p-3 rounded-md"
                  >
                    <RadioGroupItem value={reason.id} id={reason.id} />
                    <Label
                      htmlFor={reason.id}
                      className="flex-1 cursor-pointer"
                    >
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {rejectionReason === "other" && (
                <div className="space-y-2">
                  <Label htmlFor="custom-reason">
                    Please specify (max 120 characters)
                  </Label>
                  <Textarea
                    id="custom-reason"
                    placeholder="Enter reason for rejection..."
                    value={customReason}
                    onChange={(e) =>
                      setCustomReason(e.target.value.slice(0, 120))
                    }
                    maxLength={120}
                    className="resize-none"
                  />
                  <div className="text-xs text-right text-gray-500">
                    {customReason.length}/120 characters
                  </div>
                </div>
              )}

              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={submitRejection}
                disabled={
                  !rejectionReason ||
                  (rejectionReason === "other" && !customReason.trim()) ||
                  isSubmitting
                }
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Confirm Rejection
              </Button>
            </div>
          </div>
        </BottomPopUp>
      )}
    </Card>
  );
}
