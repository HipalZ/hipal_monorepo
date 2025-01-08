import { memo, useCallback } from "react";
import type { DishType } from "@hi/db-models/src/validators";
import CommonBottomButton from "@/components/atoms/bottomButton";
import { useCartStore } from "@/components/store/useCartStore";
import { useCart } from "@/components/store/useCart";
import { useBottomPanel } from "@/components/store/useBottomPanel";
import BottomPopUp from "../../universalPopup";
import ChoosePortions from "./portion";
import AddOnsWithDish from "./extra";
import { motion, AnimatePresence } from "framer-motion"
import { Minus, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"

function generateCartItemId(dishId, portionId, extras) {
    const sortedExtras = [...extras]
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((e) => `${e.id}:${e.quantity}`)
        .join("|");
    return `${dishId}_${portionId || "no_portion"}_${sortedExtras || "no_extras"
        }`;
}

const MemoDishQuantityButton = ({ dishData }: { dishData: DishType }) => {
    const {
        openBottomPanel,
        setOpenBottomPanel,
        cartPopup,
        setCartPopup,
        removeFromCart,
        selectedDish,
        setSelectedDish,
        selectedPortion,
        selectedChoices,
        addToCart,
        cart,
        resetSelections,
        updateCartItem,
    } = useCartStore();

    const { setShowCart, showCart, setCartPage } = useCart();

    const handleOpenModal = useCallback(() => {
        setOpenBottomPanel(true);
    }, [setOpenBottomPanel]);

    const { displayAlert } = useBottomPanel((s) => ({
        displayAlert: s.displayAlert,
    }));

    const closeModal = useCallback(() => {
        setOpenBottomPanel(false);
        resetSelections();
    }, [setOpenBottomPanel]);

    const handleClick = useCallback(
        (addDish: DishType) => {
            setSelectedDish(addDish);
            if (addDish?.portions?.length > 0 || addDish?.addOnIds?.length > 0) {
                setCartPopup("BOTTOM_PANEL");
                handleOpenModal();
                return;
            }
            const item = {
                id: generateCartItemId(addDish._id, null, []),
                dish: addDish,
                portion: null,
                extras: [],
                quantity: 1,
            };
            addToCart(item);
            resetSelections();
        },
        [setSelectedDish, setCartPopup, handleOpenModal],
    );

    const handleAddToCart = useCallback(() => {
        const item = {
            id: generateCartItemId(
                selectedDish._id,
                selectedPortion?._id || null,
                selectedChoices.map((choice) => ({
                    id: choice.id,
                    quantity: choice.quantity,
                })),
            ),
            dish: selectedDish,
            portion: selectedPortion,
            extras: selectedChoices,
            quantity: 1,
        };
        addToCart(item);
        closeModal();
    }, [selectedDish, selectedPortion, selectedChoices, addToCart, closeModal]);

    const cartItemsForDish = cart.filter(
        (item) => item.dish._id === dishData._id,
    );

    const totalQuantity = cartItemsForDish.reduce(
        (sum, item) => sum + item.quantity,
        0,
    );

    const handleIncreaseQuantity = useCallback(() => {
        if (cartItemsForDish.length > 0) {
            const item = cartItemsForDish[0];
            setSelectedDish(item.dish);
            if (
                item?.dish?.portions?.length > 0 ||
                item?.dish?.addOnIds?.length > 0
            ) {
                setCartPopup("BOTTOM_PANEL");
                handleOpenModal();
                return;
            }
            updateCartItem({ ...item, quantity: item.quantity + 1 });
        }
    }, [cartItemsForDish, updateCartItem]);

    const handleDecreaseQuantity = useCallback(() => {
        if (cartItemsForDish.length > 0) {
            const item = cartItemsForDish[0];
            setSelectedDish(item.dish);
            if (
                item?.dish?.portions?.length > 0 ||
                item?.dish?.addOnIds?.length > 0
            ) {
                setCartPage("order");
                setShowCart(!showCart);
                return;
            }
            if (item.quantity > 1) {
                updateCartItem({ ...item, quantity: item.quantity - 1 });
            } else {
                removeFromCart(item.id);
            }
        }
    }, [cartItemsForDish, updateCartItem, removeFromCart]);
    return (
        <>

            <div className="relative w-24 h-10">
                <AnimatePresence initial={false}>
                    {totalQuantity > 0 ? (
                        <motion.div
                            key="quantity"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 flex items-center justify-between overflow-hidden bg-white border border-gray-200 rounded-md"
                        >
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleDecreaseQuantity}
                                className="flex items-center justify-center w-8 h-full transition-colors bg-gray-100 hover:bg-gray-200"
                            >
                                <Minus className="w-4 h-4" />
                            </motion.button>
                            <motion.span
                                key={totalQuantity}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="font-medium"
                            >
                                {totalQuantity}
                            </motion.span>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleIncreaseQuantity}
                                className="flex items-center justify-center w-8 h-full transition-colors bg-gray-100 hover:bg-gray-200"
                            >
                                <Plus className="w-4 h-4" />
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="add"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0"
                        >
                            <Button
                                onClick={() => handleClick(dishData)}
                                variant="outline"
                                className="w-full h-full rounded-md"
                            >
                                Add
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {openBottomPanel && selectedDish._id === dishData._id && (
                <BottomPopUp
                    show={openBottomPanel}
                    onClose={closeModal}
                    hide
                    width="w-[30rem]"
                >
                    {cartPopup === "BOTTOM_PANEL" && (
                        <div className="relative pb-12 max-h-[90dvh] mt-4 overflow-auto">
                            <div className="flex flex-col divide-y-2 divide-[#ffffff] text-[#000000]">
                                <ChoosePortions dishData={selectedDish} />
                                <AddOnsWithDish dishData={selectedDish} />
                                {/* {displayAlert && <MemoAlertVariant />} */}
                            </div>
                            <CommonBottomButton
                                fixed
                                maxWidth="30rem"

                                buttons={[
                                    {
                                        text: "close",
                                        onClick: closeModal,
                                        type: "button" as const,
                                        className: 'px-4 rounded',
                                        isBackButton: true
                                    },
                                    {
                                        text: "Add Item To Cart",
                                        onClick: handleAddToCart,
                                        type: "button" as const,
                                        className: 'px-4 rounded'
                                    },
                                ]}
                            />
                        </div>
                    )}
                </BottomPopUp>
            )}
        </>
    );
};

const DishQuantityButton = memo(MemoDishQuantityButton);
export default DishQuantityButton;
