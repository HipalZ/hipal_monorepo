import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { AlertTriangle, ShoppingCart, Trash2, X } from "lucide-react";
import FoodType from "../atoms/dishType";
import { memo, useMemo, useState } from "react";
import type { Cart } from "../types/hotelData";
import { getCartItemLineTotal, getCartItemUnitPrice } from "../utils/cartPricing";

interface CartDetailsHotelProps {
    localCart: Cart[]
    setLocalCart: (cart: Cart[]) => void
    readOnly?: boolean
    onItemRemoved?: (item: Cart, reason: string) => void
}

const removalReasons = [
    "Item not available",
    "Ingredient not available",
    "Kitchen cannot prepare this item",
    "Other",
]

const MemoCartDetailsHotel = ({ localCart, setLocalCart, readOnly, onItemRemoved }: CartDetailsHotelProps) => {
    const [pendingItemId, setPendingItemId] = useState<string | null>(null)
    const [selectedReason, setSelectedReason] = useState("")
    const [customReason, setCustomReason] = useState("")

    const pendingItem = useMemo(
        () => localCart.find((item) => item.id === pendingItemId),
        [localCart, pendingItemId],
    )

    const resetRemoval = () => {
        setPendingItemId(null)
        setSelectedReason("")
        setCustomReason("")
    }

    const confirmRemoveItem = () => {
        if (!pendingItem) return

        const reason = selectedReason === "Other" ? customReason.trim() : selectedReason
        if (!reason) return

        const updatedCart = localCart.filter((item) => item.id !== pendingItem.id)
        onItemRemoved?.(pendingItem, reason.trim())
        setLocalCart(updatedCart)
        resetRemoval()
    }

    const totalPrice = localCart.reduce((sum, item) => sum + getCartItemLineTotal(item), 0)

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm"
        >
            {/* Header */}
            <div className="text-black px-4 py-3 bg-gray-200 flex items-center justify-between border-b">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="font-medium">Order Details</span>
                </div>
            </div>

            {/* Cart Items */}
            <div className="px-4 py-2 h-full overflow-y-auto max-h-72">
                {localCart.length > 0 ? (
                    localCart.map((item) => (
                        <div key={item?.id} className="py-2 border-b last:border-b-0 border-gray-100">
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex-1">
                                    <div className="font-medium flex items-center gap-2">
                                        {item?.dish?.name}
                                        <FoodType types={item?.dish?.dishTypes} />
                                    </div>
                                    {item?.portion && <div className="text-xs text-gray-500">Portion: {item?.portion?.name}</div>}
                                    {item?.extras && item?.extras.length > 0 && (
                                        <div className="text-xs mt-1 text-gray-500">
                                            Extras:{" "}
                                            {item.extras.map((extra, index) => (
                                                <span key={extra.id}>
                                                    {extra.name} {extra.quantity > 1 ? `× ${extra.quantity}` : ""}
                                                    {index !== item.extras.length - 1 && ", "}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right text-gray-900">₹{getCartItemLineTotal(item)}</div>
                            </div>

                            <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center">
                                    <span className="text-xs text-gray-500">
                                        ₹{getCartItemUnitPrice(item)} × {item?.quantity}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Qty: {item?.quantity}</span>
                                    {!readOnly && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setPendingItemId(item.id)
                                                setSelectedReason("")
                                                setCustomReason("")
                                            }}
                                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-4 text-center text-gray-500">No items in cart</div>
                )}
            </div>

            {pendingItem && (
                <div className="border-t border-red-100 bg-red-50/70 px-4 py-3">
                    <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex min-w-0 gap-2">
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-red-600 ring-1 ring-red-100">
                                <AlertTriangle className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold leading-tight text-red-950">
                                    Remove {pendingItem?.dish?.name || "item"}?
                                </p>
                                <p className="mt-0.5 text-xs font-medium text-red-700">
                                    Select a reason. It will be shown to the guest.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={resetRemoval}
                            className="rounded-full p-1.5 text-red-500 hover:bg-red-100"
                            aria-label="Cancel item removal"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {removalReasons.map((reason) => (
                            <button
                                key={reason}
                                type="button"
                                onClick={() => setSelectedReason(reason)}
                                className={`min-h-10 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${
                                    selectedReason === reason
                                        ? "border-red-500 bg-white text-red-700 shadow-sm"
                                        : "border-red-100 bg-white/80 text-gray-700 hover:border-red-200"
                                }`}
                            >
                                {reason}
                            </button>
                        ))}
                    </div>

                    {selectedReason === "Other" && (
                        <textarea
                            value={customReason}
                            onChange={(event) => setCustomReason(event.target.value.slice(0, 140))}
                            placeholder="Enter reason"
                            className="mt-2 min-h-[64px] w-full resize-none rounded-xl border border-red-100 bg-white px-3 py-2 text-sm outline-none focus:border-red-300"
                            maxLength={140}
                        />
                    )}

                    <Button
                        size="sm"
                        onClick={confirmRemoveItem}
                        disabled={!selectedReason || (selectedReason === "Other" && !customReason.trim())}
                        className="mt-3 w-full rounded-xl bg-red-600 text-white hover:bg-red-700"
                    >
                        Remove item
                    </Button>
                </div>
            )}

            {/* Footer with Total */}
            <div className="px-4 py-3 border-t bg-gray-200">
                <div className="flex justify-between items-center">
                    <span className="font-medium">Total</span>
                    <span>₹{totalPrice}</span>
                </div>
            </div>

        </motion.div>
    )
};

const CartDetailsHotel = memo(MemoCartDetailsHotel)
export default CartDetailsHotel;
