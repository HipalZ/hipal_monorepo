import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MdInfo, MdPerson, MdRestaurantMenu } from "react-icons/md";
import type { OrderData } from "@/components/types/hiClientzData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button.tsx";
import { BiSync } from "react-icons/bi";
import { memo, useCallback, useState, useMemo } from "react"; // Added useState and useMemo
import { useReprintKot } from "@/components/hooks/usePrint.ts";
import {
  GripVertical,
  User,
  MessageSquare,
  Trash2,
  EyeOff,
} from "lucide-react"; // Added Trash2, Eye, EyeOff icons

interface CompactOrderCardProps {
  order: OrderData;
}

const MemoEnhancedOrderCard = ({ order }: CompactOrderCardProps) => {
  const { isPending, mutateAsync } = useReprintKot();
  const [showDeletedOnly, setShowDeletedOnly] = useState(false); // New state for filtering

  const reprintKotHandler = useCallback((kotId: string) => {
    mutateAsync(kotId);
  }, []);

  // Filter items based on showDeletedOnly state
  const filteredCartItems = useMemo(() => {
    if (showDeletedOnly) {
      return order?.cart.filter((item) => item.isDeleted);
    }
    return order?.cart;
  }, [order?.cart, showDeletedOnly]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card className="mb-8 overflow-hidden ">
        <CardContent className="p-3">
          <div className="absolute top-2 right-2 z-[1] flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                  <GripVertical className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => reprintKotHandler(order._id.toString())}
                  disabled={isPending}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {isPending ? (
                    <span
                      className="
                        inline-block h-4 w-4
                        border-2 border-current border-t-transparent
                        rounded-full animate-spin
                      "
                    />
                  ) : (
                    <BiSync className="h-4 w-4" />
                  )}
                  {isPending ? "Re-Printing..." : "Re-Print KOT"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {order?.transferd && (
            <section className="flex items-center justify-between gap-2">
              <Badge variant="destructive" className="mb-2">
                <span>Transferred by {order?.transferedBy?.name}</span>
              </Badge>
              <Badge variant="secondary" className="mb-2 text-base">
                <span>{`${order?.fromTable} => ${order?.toTable}`}</span>
              </Badge>
            </section>
          )}
          <div className="flex items-center justify-between gap-1 mb-2">
            <div className="flex items-center truncate">
              <MdPerson className="mr-1 text-gray-500" />
              <span className="font-semibold">{order?.name}</span>
            </div>
            <h3 className="text-sm font-semibold opacity-60 pr-4">
              {new Date(order?.date).toLocaleString("en-In")}
            </h3>
          </div>
          <Separator className="my-2" />
          <div className="space-y-4">
            {filteredCartItems.length === 0 && showDeletedOnly ? (
              <div className="text-center text-gray-500 py-4">
                No deleted items to show.
              </div>
            ) : filteredCartItems.length === 0 && !showDeletedOnly ? (
              <div className="text-center text-gray-500 py-4">
                No items in this order.
              </div>
            ) : (
              filteredCartItems.map((item) => {
                const isItemDeleted = item.isDeleted;
                const itemContainerClasses = isItemDeleted
                  ? "bg-red-50 border border-red-200"
                  : "";
                const itemTextClasses = isItemDeleted
                  ? "line-through text-red-700"
                  : "";

                const itemTotal =
                  item.dish.price * item.quantity +
                  (item.portion ? item.portion.price * item.quantity : 0) +
                  (item.extras?.reduce(
                    (sum, extra) => sum + extra.price * extra.quantity,
                    0,
                  ) || 0);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`grid grid-cols-12 gap-2 text-sm p-2 rounded-md ${itemContainerClasses}`}
                  >
                    {/* Dish Name */}
                    <div className="flex items-center col-span-8">
                      <MdRestaurantMenu className="mr-2 text-gray-500" />
                      <span className={itemTextClasses}>
                        {item?.dish?.name}
                      </span>
                      {item?.portion && (
                        <span
                          className={`ml-1 text-xs text-gray-500 ${itemTextClasses}`}
                        >
                          ({item?.portion?.name})
                        </span>
                      )}
                      {isItemDeleted && (
                        <Badge variant="destructive" className="ml-2">
                          Deleted
                        </Badge>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2 text-center">
                      x{item?.quantity}
                    </div>

                    {/* Dish & Portion Price */}
                    <div className="col-span-2 text-right">
                      ₹{itemTotal.toFixed(2)}
                    </div>

                    {/* Extras */}
                    {item?.extras && item.extras.length > 0 && (
                      <div className="col-span-12 ml-8 space-y-1 text-xs text-gray-500">
                        {item.extras.map((extra) => (
                          <div
                            key={extra.id}
                            className="grid grid-cols-12 gap-2"
                          >
                            <span className={`col-span-8 ${itemTextClasses}`}>
                              {extra.name} (x{extra.quantity * item.quantity})
                            </span>
                            <span
                              className={`col-span-4 text-right ${itemTextClasses}`}
                            >
                              ₹
                              {(
                                extra.price *
                                extra.quantity *
                                item.quantity
                              ).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {item?.dish?.instruction && (
                      <div className="col-span-12 mt-2">
                        <div className="p-2 rounded-md bg-[#f7f7f7]">
                          <p className="flex items-start text-xs">
                            <MdInfo className="mr-1 mt-0.5 text-[#000000] flex-shrink-0" />
                            <span className="font-medium">
                              <span className="font-normal">
                                {item?.dish?.instruction}
                              </span>
                            </span>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Deletion Details (if item is deleted) */}
                    {isItemDeleted && (
                      <div className="col-span-12 mt-2 text-xs text-gray-800 bg-red-100 p-2 rounded-md">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-gray-600" />
                          <span className="font-medium">Deleted by:</span>{" "}
                          {item.deletedBy}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <MessageSquare className="h-3 w-3 text-gray-600" />
                          <span className="font-medium">Reason:</span>{" "}
                          {item.reasonOfDeletion}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
          <Separator className="my-2" />
          <div className="flex items-center justify-between text-sm font-medium">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-lg font-semibold">
              ₹
              {order?.cart
                ?.reduce((total, item) => {
                  const itemTotal = item.dish.price * item.quantity;
                  const portionTotal = item.portion
                    ? item.portion.price * item.quantity
                    : 0;
                  const extrasTotal =
                    (item.extras?.reduce(
                      (sum, extra) => sum + extra.price * extra.quantity,
                      0,
                    ) || 0) * item.quantity;
                  return total + itemTotal + portionTotal + extrasTotal;
                }, 0)
                .toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const EnhancedOrderCard = memo(MemoEnhancedOrderCard);
EnhancedOrderCard.displayName = "EnhancedOrderCard";
export default EnhancedOrderCard;
