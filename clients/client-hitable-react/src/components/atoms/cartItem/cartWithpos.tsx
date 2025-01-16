import { memo, useState } from "react";
import { motion } from "framer-motion";
import { FaUser } from "react-icons/fa";
import { MdTableBar, MdAddIcCall, MdLocalOffer, MdInfo } from "react-icons/md";
import { useLiteStore } from "@/components/store/useLiteStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useUpdateOrderAction } from "@/components/hooks/useCartApi";
import BottomPopup from "@/components/atoms/universalPopup"; // Import your popup component
import { Textarea } from "@/components/ui/textarea";
import CommonBottomButton from "../bottomButton";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useCart } from "@/components/store/useCart";
import { type ICartHistory, useCartStore } from "@/components/store/useCartStore";
import { useNavigate } from "react-router-dom";
import { useOrderStore } from "@/components/store/useOrderData";

const MemoCartWithPos = () => {
    const navigate = useNavigate();
    const { cartData, removeCart } = useLiteStore();
    const { setIsCartEdit } = useCart();
    const { setModalType, setOpenOrderModal } = useOrderStore()
    const editExistingOrder = useCartStore((state) => state.editExistingOrder);
    const { updateOrderAction, isPending } = useUpdateOrderAction();
    const captainData = useHiClientZ(s => s.captainData)
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedCartId, setSelectedCartId] = useState<string | null>(null);
    const [reason, setReason] = useState<string>("");
    const predefinedReasons = ["Out of stock", "Incorrect order", "Other", "Customer cancelled"];


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
    }

    const editTheOrder = async (cart: ICartHistory) => {
        if (!cart._id) return;
        removeCart(cart._id);
        await updateOrderAction({
            orderId: cart._id,
            orderAction: "EDIT",
            performBy: captainData?._id || "Captain",
        });
        setIsCartEdit(true);
        editExistingOrder(cart);
        setModalType("addItem")
        setOpenOrderModal(true)
        navigate(`/${cart.businessId}/alerts/${cart.tableId}`)
    }

    return (
        <>
            {cartData?.map((cart, index) => (
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
                                        <FaUser className="mr-1" /> {cart?.userId?.name || cart?.name || "User"}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <p className="text-sm text-gray-500">
                                        {new Date(cart?.date).toLocaleString()}
                                    </p>
                                    <p className="flex items-center text-sm text-gray-500">
                                        <MdAddIcCall className="mr-1" /> {cart?.userId?.phone || cart?.phone || "N/A"}
                                    </p>
                                </div>
                            </div>
                            <Separator className="my-2" />
                            <div className="space-y-4">
                                {cart?.cart?.map((item, index) => (
                                    <div key={`${item._id}+${index}`} className="flex items-start justify-between">
                                        <div className="flex-grow">
                                            <div className="flex items-start justify-between">
                                                <h4 className="text-base font-semibold">{item?.dish?.name}</h4>
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
                                                    <p className="text-sm font-medium text-gray-700">Extras:</p>
                                                    {item.extras.map((extra) => (
                                                        <p key={extra.id} className="ml-2 text-sm italic text-gray-600">
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
                                                            Special Instructions: <span className="font-normal">{item?.dish?.instruction}</span>
                                                        </span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        {
                            !isPending ?
                                <CardFooter className="flex justify-between p-4 bg-gray-50">
                                    <Button
                                        variant="destructive"
                                        onClick={() => openPopup(cart._id)}
                                        disabled={isPending}
                                    >
                                        Reject
                                    </Button>
                                    <Button onClick={() => editTheOrder(cart)} variant="outline">Edit</Button>
                                    <Button onClick={() => handleAccept(cart._id)} variant="default">Accept</Button>
                                </CardFooter> : null
                        }
                    </Card>
                </motion.div>
            ))}

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
        </>
    );
};

const CartWithPos = memo(MemoCartWithPos);
export default CartWithPos;
