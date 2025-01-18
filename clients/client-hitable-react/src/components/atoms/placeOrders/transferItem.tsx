import { useOrderStore } from "@/components/store/useOrderData";
import { memo } from "react";
import { motion } from "framer-motion";
import { MdRestaurantMenu, MdInfo } from "react-icons/md";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import CommonBottomButton from "../bottomButton";

const MemoTransferItem = () => {
    const { setModalType, selectedTable, orderDataStore, setTransferTable, transferTable, transferModal, setTransferModal } = useOrderStore()

    const closeTransferModal = () => {
        setTransferModal(false)
        setTransferTable('')
    }

    return (
        <section className="relative h-[100dvh] lg:h-[80dvh] overflow-y-auto hide-scrollbar">
            <div className="sticky top-0 z-50 flex items-center justify-between p-4 bg-white border-b rounded-t-2xl">
                <div className="flex items-center">
                    <MdInfo className="mr-2 text-gray-500" />
                    <span className="font-semibold">Transfer Items</span>
                </div>
                <span className="text-xs text-gray-500">Select items to transfer</span>
            </div>
            <ScrollArea className=" pb-[7rem]">
                {orderDataStore?.map((order) => (
                    order.cart.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-12 gap-2 p-4 m-2 text-sm border rounded-md shadow-sm"
                        >
                            {/* Checkbox */}
                            <div className="flex items-center col-span-1">
                                <Checkbox className="mr-2" value={item.id} />
                            </div>

                            {/* Dish Name */}
                            <div className="flex items-center col-span-7">
                                <MdRestaurantMenu className="mr-2 text-gray-500" />
                                <span>{item?.dish?.name}</span>
                                {item?.portion && (
                                    <span className="ml-1 text-xs text-gray-500">({item?.portion?.name})</span>
                                )}
                            </div>

                            {/* Quantity */}
                            <div className="col-span-2 text-center">
                                x{item?.quantity}
                            </div>

                            {/* Dish & Portion Price */}
                            <div className="col-span-2 text-right">
                                ₹{(
                                    item?.dish?.price * item?.quantity +
                                    (item.portion ? item.portion.price * item.quantity : 0)
                                ).toFixed(2)}
                            </div>

                            {/* Extras */}
                            {item?.extras && item.extras.length > 0 && (
                                <div className="col-span-12 ml-8 space-y-1 text-xs text-gray-500">
                                    {item.extras.map((extra) => (
                                        <div key={extra.id} className="grid grid-cols-12 gap-2">
                                            <span className="col-span-8">{extra.name} (x{extra.quantity})</span>
                                            <span className="col-span-4 text-right">
                                                ₹{(extra.price * extra.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </motion.div>
                    ))
                ))}
            </ScrollArea>
            <CommonBottomButton
                fixed
                maxWidth="48rem"
                buttons={[
                    {
                        text: 'Cancel',
                        onClick: closeTransferModal,
                        isBackButton: true,
                        className: 'pl-3 rounded-md'
                    },
                    {
                        text: 'Transfer Items',
                        onClick: () => setTransferModal(false),
                        disable: !transferTable,
                        className: 'rounded-full',
                        swipe: true
                    }
                ]}
            />
        </section>
    );
};

const TransferItem = memo(MemoTransferItem);
export default TransferItem;
