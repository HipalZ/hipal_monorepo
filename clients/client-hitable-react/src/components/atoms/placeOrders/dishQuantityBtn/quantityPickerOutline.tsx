import { memo, useCallback } from "react";
import { HiMinusSm, HiPlusSm } from "react-icons/hi";
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
                <div className="flex items-center mx-1 my-auto">
                    {/* Decrease Button */}
                    <button
                        type="button"
                        onClick={handleDecrease}
                        disabled={quantity <= minQuantity}
                        className="button-icon"
                    >
                        <HiMinusSm size={24} />
                    </button>

                    {/* Quantity Display */}
                    <span className="w-1/3 px-2 text-xs font-bold text-center">
                        {quantity}
                    </span>

                    {/* Increase Button */}
                    <button
                        type="button"
                        onClick={handleIncrease}
                        className="button-icon"
                    >
                        <HiPlusSm size={24} />
                    </button>
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
