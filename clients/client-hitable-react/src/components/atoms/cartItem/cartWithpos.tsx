import { memo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FaUser } from "react-icons/fa";
import { MdTableBar, MdAddIcCall, MdLocalOffer, MdInfo } from "react-icons/md";
import { FiCopy } from "react-icons/fi";
import { useLiteStore } from "@/components/store/useLiteStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useUpdateOrderAction } from "@/components/hooks/useCartApi";
import BottomPopup from "@/components/atoms/universalPopup";
import { Textarea } from "@/components/ui/textarea";
import CommonBottomButton from "../bottomButton";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useCart } from "@/components/store/useCart";
import {
  type ICartHistory,
  useCartStore,
} from "@/components/store/useCartStore";
import { useNavigate } from "react-router-dom";
import { useOrderStore } from "@/components/store/useOrderData";
import { cn } from "@/lib/utils";
import PasswordModal from "./PasswordModal.tsx";

const MemoCartWithPos = () => {
  const navigate = useNavigate();
  const { cartData, removeCart } = useLiteStore();
  const { setIsCartEdit } = useCart();
  const { setModalType, setOpenOrderModal } = useOrderStore();
  const editExistingOrder = useCartStore((state) => state.editExistingOrder);
  const { updateOrderAction, isPending } = useUpdateOrderAction();
  const captainData = useHiClientZ((s) => s.captainData);

  // Existing states
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedCartId, setSelectedCartId] = useState<string | null>(null);
  const [reason, setReason] = useState<string>("");
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [selectedCartToEdit, setSelectedCartToEdit] =
    useState<ICartHistory | null>(null);

  // Password protection states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    action: "copy" | "call";
    phone: string;
  } | null>(null);
  const [copyTick, setCopyTick] = useState<{ [key: string]: boolean }>({});

  const predefinedReasons = [
    "Out of stock",
    "Incorrect order",
    "Other",
    "Customer cancelled",
  ];

  // Phone protection functions
  const hideMiddleNumbers = useCallback((phone: string) => {
    if (!phone || phone === "N/A") return phone;
    if (phone.length <= 2) return phone;
    const firstPart = phone.slice(0, 2);
    const lastPart = phone.slice(-1);
    return `${firstPart}****${lastPart}`;
  }, []);

  const handleProtectedAction = useCallback(
    (action: "copy" | "call", phone: string) => {
      if (isPhoneVerified) {
        executePhoneAction(action, phone);
      } else {
        setPendingAction({ action, phone });
        setIsModalOpen(true);
      }
    },
    [isPhoneVerified],
  );

  const executePhoneAction = useCallback(
    (action: "copy" | "call", phone: string) => {
      if (!phone || phone === "N/A") return;

      if (action === "copy") {
        navigator.clipboard.writeText(phone).then(() => {
          setCopyTick((prev) => ({ ...prev, [phone]: true }));
          setTimeout(() => {
            setCopyTick((prev) => ({ ...prev, [phone]: false }));
          }, 3000);
        });
      } else if (action === "call") {
        window.location.href = `tel:+91${phone}`;
      }
    },
    [],
  );

  const handlePasswordVerify = useCallback(
    (isCorrect: boolean) => {
      if (isCorrect) {
        setIsPhoneVerified(true);
        if (pendingAction) {
          executePhoneAction(pendingAction.action, pendingAction.phone);
          setPendingAction(null);
        }
        // Auto-lock after 5 minutes for security
        setTimeout(() => setIsPhoneVerified(false), 5 * 60 * 1000);
      }
    },
    [pendingAction, executePhoneAction],
  );

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setPendingAction(null);
  }, []);

  // Existing functions
  const openPopup = (cartId: string) => {
    setSelectedCartId(cartId);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setReason("");
  };

  const handleReject = async () => {
    if (!selectedCartId) return;
    removeCart(selectedCartId);
    await updateOrderAction({
      orderId: selectedCartId,
      orderAction: "REJECT",
      performBy: captainData?._id || "Captain",
      reasonOfRejection: reason,
    });
    closePopup();
  };

  const handleAccept = async (cartId: string) => {
    if (!cartId) return;
    removeCart(cartId);
    await updateOrderAction({
      orderId: cartId,
      orderAction: "ACCEPT",
      performBy: captainData?._id || "Captain",
    });
  };

  const editTheOrder = (cart: ICartHistory) => {
    setSelectedCartToEdit(cart);
    setIsEditPopupOpen(true);
  };

  const confirmEditOrder = async () => {
    if (!selectedCartToEdit?._id) return;
    setIsEditPopupOpen(false);
    removeCart(selectedCartToEdit._id);
    await updateOrderAction({
      orderId: selectedCartToEdit._id,
      orderAction: "EDIT",
      performBy: captainData?._id || "Captain",
    });
    setIsCartEdit(true);
    editExistingOrder(selectedCartToEdit);
    setModalType("addItem");
    setOpenOrderModal(true);
    navigate(
      `/${selectedCartToEdit.businessId}/alerts/${selectedCartToEdit.tableId}`,
    );
  };

  return (
    <>
      {cartData && cartData?.length > 0 ? (
        cartData?.map((cart, index) => {
          const phone = cart?.userId?.phone || cart?.phone || "N/A";
          return (
            <motion.div
              key={`${cart._id} + ${index}`}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="flex items-center text-lg font-bold">
                        <MdTableBar className="mr-2" /> {cart?.tableName}
                      </h3>
                      <p className="flex items-center text-sm text-gray-500">
                        <FaUser className="mr-1" />{" "}
                        {cart?.userId?.name || cart?.name || "User"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-sm text-gray-500">
                        {new Date(cart?.date).toLocaleString("en-In")}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MdAddIcCall className="mr-1" />
                          <span>
                            {isPhoneVerified ? phone : hideMiddleNumbers(phone)}
                          </span>
                        </div>
                        {phone !== "N/A" && (
                          <>
                            <button
                              type="button"
                              className={cn(
                                "p-1 rounded text-xs",
                                copyTick[phone]
                                  ? "bg-green-100 text-green-600"
                                  : "bg-purple-100 text-purple-600",
                              )}
                              onClick={() =>
                                handleProtectedAction("copy", phone)
                              }
                            >
                              <FiCopy className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              className="p-1 rounded bg-blue-100 text-blue-600"
                              onClick={() =>
                                handleProtectedAction("call", phone)
                              }
                            >
                              <MdAddIcCall className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <div className="space-y-4">
                    {cart?.cart?.map((item, index) => (
                      <div
                        key={`${item._id}+${index}`}
                        className="flex items-start justify-between"
                      >
                        <div className="flex-grow">
                          <div className="flex items-start justify-between">
                            <h4 className="text-base font-semibold">
                              {item?.dish?.name}
                            </h4>
                            <Badge variant="outline" className="ml-2">
                              Qty: {item?.quantity}
                            </Badge>
                          </div>
                          {item?.portion?.name && (
                            <p className="mt-1 text-sm font-medium text-gray-700">
                              <MdLocalOffer className="inline mr-1" />
                              Portion: {item.portion.name}
                            </p>
                          )}
                          {item?.extras?.length > 0 && (
                            <div className="mt-1">
                              <p className="text-sm font-medium text-gray-700">
                                Extras:
                              </p>
                              {item.extras.map((extra) => (
                                <p
                                  key={extra.id}
                                  className="ml-2 text-sm italic text-gray-600"
                                >
                                  • {extra?.name}: {extra?.quantity}
                                </p>
                              ))}
                            </div>
                          )}
                          {item?.dish?.instruction && (
                            <div className="p-2 mt-3 rounded-md bg-[#f7f7f7]">
                              <p className="flex items-start text-sm">
                                <MdInfo className="mr-1 mt-0.5 text-[#000000] flex-shrink-0" />
                                <span className="font-medium">
                                  Special Instructions:{" "}
                                  <span className="font-normal">
                                    {item?.dish?.instruction}
                                  </span>
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                {!isPending ? (
                  <CardFooter className="flex justify-between p-4 bg-gray-50">
                    <Button
                      variant="destructive"
                      onClick={() => openPopup(cart._id)}
                      disabled={isPending}
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => editTheOrder(cart)}
                      variant="outline"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleAccept(cart._id)}
                      variant="default"
                    >
                      Accept
                    </Button>
                  </CardFooter>
                ) : null}
              </Card>
            </motion.div>
          );
        })
      ) : (
        <motion.div
          className="text-2xl font-semibold text-center col-span-full text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          No Cart Found
        </motion.div>
      )}

      {/* Edit Popup */}
      {isEditPopupOpen && (
        <BottomPopup
          width="w-[30rem]"
          height="h-[30dvh]"
          show={isEditPopupOpen}
          onClose={() => setIsEditPopupOpen(false)}
        >
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-bold text-center">Edit KOT</h2>
            <p className="text-center">
              Are you sure you want to edit this KOT?
            </p>
          </div>
          <CommonBottomButton
            position="mid"
            maxWidth="30rem"
            fixed
            buttons={[
              {
                text: "Cancel",
                isBackButton: true,
                onClick: () => setIsEditPopupOpen(false),
                className: "rounded-md shadow-md w-full pl-3",
              },
              {
                text: "Confirm",
                onClick: confirmEditOrder,
                className: "rounded-md",
              },
            ]}
          />
        </BottomPopup>
      )}

      {/* Reject Popup */}
      {isPopupOpen && (
        <BottomPopup height="h-[50dvh]" show={isPopupOpen} onClose={closePopup}>
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-bold text-center">Reject Order</h2>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter the reason for rejection..."
              className="w-full"
            />
            <div className="flex flex-wrap gap-4">
              {predefinedReasons.map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  onClick={() => setReason(preset)}
                >
                  {preset}
                </Button>
              ))}
            </div>
          </div>
          <CommonBottomButton
            position="mid"
            maxWidth="48rem"
            fixed
            buttons={[
              {
                text: "Confirm",
                onClick: () => {
                  handleReject();
                },
                className: "rounded-md shadow-md w-full",
                disable: isPending || !reason.trim(),
                isLoading: isPending,
                color: "#9E1A1A",
              },
            ]}
          />
        </BottomPopup>
      )}

      {/* Password Modal */}
      <PasswordModal
        isOpen={isModalOpen}
        onVerify={handlePasswordVerify}
        onClose={handleModalClose}
      />
    </>
  );
};

const CartWithPos = memo(MemoCartWithPos);
export default CartWithPos;
