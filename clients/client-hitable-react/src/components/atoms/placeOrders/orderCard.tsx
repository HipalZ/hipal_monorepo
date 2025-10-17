import { useReprintKot } from '@/components/hooks/usePrint.ts';
import type { OrderData } from '@/components/types/hiClientzData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { GripVertical, MessageSquare, User } from 'lucide-react'; // Added Trash2, Eye, EyeOff icons
import { memo, useCallback, useMemo } from 'react'; // Added useState and useMemo
import { BiSync } from 'react-icons/bi';
import { MdInfo, MdPerson, MdRestaurantMenu } from 'react-icons/md';

interface CompactOrderCardProps {
  order: OrderData;
}

const MemoEnhancedOrderCard = ({ order }: CompactOrderCardProps) => {
  const { isPending, mutateAsync } = useReprintKot();

  const reprintKotHandler = useCallback(
    (kotId: string) => {
      mutateAsync(kotId);
    },
    [mutateAsync],
  );

  const filteredCartItems = useMemo(() => {
    return order?.cart;
  }, [order?.cart]);

  const calculateTotalPrice = useCallback((cartItem: ICartItem) => {
    const hasPortion = !!cartItem.portion?.price;

    const basePrice = hasPortion ? 0 : cartItem.dish.price * cartItem.quantity;
    const portionPrice = hasPortion ? cartItem.portion!.price * cartItem.quantity : 0;

    const extrasPrice = (cartItem.extras?.reduce((sum, extra) => sum + extra.price * extra.quantity, 0) || 0) * cartItem.quantity;

    return basePrice + portionPrice + extrasPrice;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative mx-auto w-full max-w-lg"
    >
      <Card className="mb-8 overflow-hidden">
        <CardContent className="p-3">
          <div className="absolute right-2 top-2 z-[1] flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                  <GripVertical className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => reprintKotHandler(order._id.toString())}
                  disabled={isPending}
                  className="flex cursor-pointer items-center gap-2"
                >
                  {isPending ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <BiSync className="h-4 w-4" />
                  )}
                  {isPending ? 'Re-Printing...' : 'Re-Print KOT'}
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
          <div className="mb-2 flex items-center justify-between gap-1">
            <div className="flex items-center truncate">
              <MdPerson className="mr-1 text-gray-500" />
              <span className="font-semibold">{order?.name}</span>
            </div>
            <h3 className="pr-4 text-sm font-semibold opacity-60">{new Date(order?.date).toLocaleString('en-In')}</h3>
          </div>

          <Separator className="my-2" />

          <div className="space-y-4">
            {filteredCartItems.length === 0 && showDeletedOnly ? (
              <div className="py-4 text-center text-gray-500">No deleted items to show.</div>
            ) : filteredCartItems.length === 0 && !showDeletedOnly ? (
              <div className="py-4 text-center text-gray-500">No items in this order.</div>
            ) : (
              filteredCartItems.map((item) => {
                const isItemDeleted = item.isDeleted;
                const itemContainerClasses = isItemDeleted ? 'bg-red-50 border border-red-200' : '';
                const itemTextClasses = isItemDeleted ? 'line-through text-red-700' : '';

                const itemTotal =
                  item.dish.price * item.quantity +
                  (item.portion ? item.portion.price * item.quantity : 0) +
                  (item.extras?.reduce((sum, extra) => sum + extra.price * extra.quantity, 0) || 0);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`grid grid-cols-12 gap-2 rounded-md p-2 text-sm ${itemContainerClasses}`}
                  >
                    {/* Dish Name */}
                    <div className="col-span-8 flex items-center">
                      <MdRestaurantMenu className="mr-2 text-gray-500" />
                      <span className={itemTextClasses}>{item?.dish?.name}</span>
                      {item?.portion && <span className={`ml-1 text-xs text-gray-500 ${itemTextClasses}`}>({item?.portion?.name})</span>}
                      {isItemDeleted && (
                        <Badge variant="destructive" className="ml-2">
                          Deleted
                        </Badge>
                      )}
                      {item?.portion && <p className={`ml-1 text-xs text-gray-500 ${itemTextClasses}`}>({item?.portion?.name})</p>}
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2 text-center">x{item?.quantity}</div>

                    {/* Dish & Portion Price */}
                    <div className="col-span-2 text-right">₹{itemTotal.toFixed(2)}</div>

                    {/* Extras */}
                    {item?.extras && item.extras.length > 0 && (
                      <div className="col-span-12 ml-8 space-y-1 text-xs text-gray-500">
                        {item.extras.map((extra) => (
                          <div key={extra.id} className="grid grid-cols-12 gap-2">
                            <span className={`col-span-8 ${itemTextClasses}`}>
                              {extra.name} (x{extra.quantity * item.quantity})
                            </span>
                            <span className={`col-span-4 text-right ${itemTextClasses}`}>
                              ₹{(extra.price * extra.quantity * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {item?.dish?.instruction && (
                      <div className="col-span-12 mt-2">
                        <div className="rounded-md bg-[#f7f7f7] p-2">
                          <p className="flex items-start text-xs">
                            <MdInfo className="mr-1 mt-0.5 flex-shrink-0 text-[#000000]" />
                            <span className="font-medium">
                              <span className="font-normal">{item?.dish?.instruction}</span>
                            </span>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Deletion Details */}
                    {isItemDeleted && (
                      <div className="col-span-12 mt-2 rounded-md bg-red-100 p-2 text-xs text-gray-800">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-gray-600" />
                          <span className="font-medium">Deleted by:</span> {item.deletedBy}
                        </div>
                        <div className="mt-1 flex items-center gap-1">
                          <MessageSquare className="h-3 w-3 text-gray-600" />
                          <span className="font-medium">Reason:</span> {item.reasonOfDeletion}
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
                  const portionTotal = item.portion ? item.portion.price * item.quantity : 0;
                  const extrasTotal = (item.extras?.reduce((sum, extra) => sum + extra.price * extra.quantity, 0) || 0) * item.quantity;
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
EnhancedOrderCard.displayName = 'EnhancedOrderCard';
export default EnhancedOrderCard;
