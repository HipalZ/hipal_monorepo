import { useOrderStore } from "@/components/store/useOrderData";
import { memo, useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MdRestaurantMenu, MdInfo } from "react-icons/md";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import CommonBottomButton from "../bottomButton";
import EmptyTableList from "@/components/tables";

const MemoTransferItem = () => {
  const orderDataStore = useOrderStore((s) => s.orderDataStore);
  const setTransferTable = useOrderStore((s) => s.setTransferTable);
  const setTransferModal = useOrderStore((s) => s.setTransferModal);
  const selectedItems = useOrderStore((s) => s.selectedItems);
  const setSelectedItems = useOrderStore((s) => s.setSelectedItems);
  const updateSelectedItemQuantity = useOrderStore(
    (s) => s.updateSelectedItemQuantity,
  );

  const removeDeletedItems = useMemo(() => {
    return orderDataStore.map((item) => ({
      ...item,
      cart: item.cart.filter((cart) => !cart.isDeleted),
    }));
  }, [orderDataStore]);

  const [selectTable, setSelectTable] = useState<boolean>(false);

  const closeModal = useCallback(() => {
    setTransferModal(false);
    setTransferTable("");
    setSelectedItems([]);
  }, [setTransferModal, setTransferTable, setSelectedItems]);

  const handleCheckboxChange = (itemId: string, checked: boolean, currentQuantity: number) => {
    if (checked) {
      // Add item with its current quantity
      setSelectedItems([
        ...selectedItems,
        { itemId, quantity: currentQuantity },
      ]);
    } else {
      // Remove item
      setSelectedItems(selectedItems.filter((item) => item.itemId !== itemId));
    }
  };

  const handleQuantityChange = (itemId: string, newQuantity: number, maxQuantity: number) => {
    // Ensure quantity is between 1 and maxQuantity
    const clampedQuantity = Math.max(1, Math.min(newQuantity, maxQuantity));
    updateSelectedItemQuantity(itemId, clampedQuantity);
  };

  const handleQuantityInputChange = (
    itemId: string,
    value: string,
    maxQuantity: number,
  ) => {
    const numValue = Number.parseInt(value, 10);
    if (!Number.isNaN(numValue)) {
      handleQuantityChange(itemId, numValue, maxQuantity);
    }
  };

  const openSelectTable = () => {
    setSelectTable(true);
  };

  return (
    <>
      {selectTable ? (
        <EmptyTableList transfer />
      ) : (
        <section className="relative h-[100dvh] lg:h-[80dvh] overflow-y-auto hide-scrollbar">
          <div className="sticky top-0 z-50 flex items-center justify-between p-4 bg-white border-b rounded-t-2xl">
            <div className="flex items-center">
              <MdInfo className="mr-2 text-gray-500" />
              <span className="font-semibold">Transfer Items</span>
            </div>
            <span className="text-xs text-gray-500 pr-8">
              Select items to transfer
            </span>
          </div>
          <ScrollArea className="pb-[7rem]">
            {removeDeletedItems?.map((order) =>
              order.cart.map((item) => {
                const selectedItem = selectedItems.find(
                  (si) => si.itemId === item._id,
                );
                const isChecked = !!selectedItem;
                const transferQuantity = selectedItem?.quantity || item.quantity;
                const maxQuantity = item.quantity;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-12 gap-2 p-4 m-2 text-sm border rounded-md shadow-sm"
                  >
                    <div className="flex mt-1 col-span-1">
                      <Checkbox
                        className="mr-2"
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            item?._id,
                            checked === true,
                            item.quantity,
                          )
                        }
                      />
                    </div>
                    <div className="flex flex-col col-span-5">
                      <span>{item?.dish?.name}</span>
                      {item?.portion && (
                        <span className="ml-1 text-xs text-gray-500">
                          ({item?.portion?.name})
                        </span>
                      )}
                    </div>
                    {isChecked ? (
                      <div className="col-span-3 flex flex-col items-center justify-center gap-1">
                        <Input
                          type="number"
                          min={1}
                          max={maxQuantity}
                          value={transferQuantity}
                          onChange={(e) =>
                            handleQuantityInputChange(
                              item._id,
                              e.target.value,
                              maxQuantity,
                            )
                          }
                          className="h-7 w-16 text-center text-xs"
                        />
                        <section className="flex items-center gap-4">

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() =>
                            handleQuantityChange(
                              item._id,
                              transferQuantity - 1,
                              maxQuantity,
                            )
                          }
                          disabled={transferQuantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() =>
                            handleQuantityChange(
                              item._id,
                              transferQuantity + 1,
                              maxQuantity,
                            )
                          }
                          disabled={transferQuantity >= maxQuantity}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        </section>
                      
                      </div>
                    ) : (
                      <div className="col-span-3 text-center text-gray-500">
                        x{item?.quantity}
                      </div>
                    )}
                    <div className="col-span-3 text-right">
                      ₹
                      {isChecked
                        ? (
                            item?.dish?.price * transferQuantity +
                            (item.portion
                              ? item.portion.price * transferQuantity
                              : 0)
                          ).toFixed(2)
                        : (
                            item?.dish?.price * item?.quantity +
                            (item.portion
                              ? item.portion.price * item?.quantity
                              : 0)
                          ).toFixed(2)}
                    </div>
                    {item?.extras && item.extras.length > 0 && (
                      <div className="col-span-12 ml-8 space-y-1 text-xs text-gray-500">
                        {item.extras.map((extra) => (
                          <div
                            key={extra.id}
                            className="grid grid-cols-12 gap-2"
                          >
                            <span className="col-span-8">
                              {extra.name} (x{extra.quantity})
                            </span>
                            <span className="col-span-4 text-right">
                              ₹{(extra.price * extra.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              }),
            )}
          </ScrollArea>
          <CommonBottomButton
            fixed
            maxWidth="30rem"
            position="mid"
            buttons={[
              {
                text: "Cancel",
                onClick: closeModal,
                isBackButton: true,
                className: "pl-3 rounded-md",
              },
              {
                text: "Transfer Items",
                onClick: () => {
                  openSelectTable();
                },
                disable: selectedItems.length === 0 || selectedItems.some(item => item.quantity <= 0),
                className: "rounded-full",
                swipe: true,
              },
            ]}
          />
        </section>
      )}
    </>
  );
};

const TransferItem = memo(MemoTransferItem);
export default TransferItem;
