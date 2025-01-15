import { memo, useCallback } from "react";
import { HiMinusSm, HiPlusSm } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import type { AddOnType } from "@hi/db-models/src/validators";

const QuantityPickerNonOutline = ({
    setQuantity,
    minQuantity,
    maxQuantity,
    quantity,
    extra,
    displayAlertPopUp,
}: {
    setQuantity: (quantity: number) => void;
    minQuantity: number;
    maxQuantity: number;
    quantity: number;
    extra: AddOnType;
    displayAlertPopUp: () => void;
}) => {
    const handleDecrease = useCallback(() => {
        if (quantity > minQuantity) {
            setQuantity(quantity - 1);
        }
    }, [quantity, minQuantity, setQuantity]);

    const handleIncrease = useCallback(() => {
        if (quantity < maxQuantity) {
            setQuantity(quantity + 1);
        } else {
            displayAlertPopUp();
        }
    }, [quantity, maxQuantity, setQuantity, displayAlertPopUp]);

    const isNumberType = extra.choiceType === "NUMBER";

    return (
        <>
            {isNumberType ? (
                <div className="relative w-20 h-10 my-auto">
                    <AnimatePresence initial={false}>
                        <motion.div
                            key="quantity"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 flex items-center justify-between overflow-hidden bg-white border border-gray-200 rounded-md"
                        >
                            {/* Decrease Button */}
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleDecrease}
                                disabled={quantity <= minQuantity}
                                className="flex items-center justify-center w-8 h-full transition-colors bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                            >
                                <HiMinusSm className="w-4 h-4" />
                            </motion.button>

                            {/* Quantity Display */}
                            <motion.span
                                key={quantity}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="font-medium"
                            >
                                {quantity}
                            </motion.span>

                            {/* Increase Button */}
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleIncrease}
                                className="flex items-center justify-center w-8 h-full transition-colors bg-gray-100 hover:bg-gray-200"
                            >
                                <HiPlusSm className="w-4 h-4" />
                            </motion.button>
                        </motion.div>
                    </AnimatePresence>
                </div>
            ) : (
                <div className="flex flex-row mx-1 my-auto">
                    {/* Checkbox for binary choice, toggles on/off based on quantity */}
                    <input
                        type="checkbox"
                        className="scale-125"
                        checked={quantity > 0}
                        onChange={() => setQuantity(quantity > 0 ? 0 : 1)}
                    />
                </div>
            )}
        </>
    );
};

export default memo(QuantityPickerNonOutline);
