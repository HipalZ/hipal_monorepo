import { memo, useMemo, useState, useCallback } from "react";
import { useOrderStore } from "@/components/store/useOrderData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Info, User, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { useDeleteKot } from "@/components/hooks/useOrder";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import type { OrderData } from "@/components/types/hiClientzData";
import CommonBottomButton from "../atoms/bottomButton/index.tsx";

interface SelectedMap {
  [orderId: string]: Set<string>;
}

const MemoDeleteKot = () => {
  const ordersData = useOrderStore((s) => s.orderDataStore);
  const { isPending, mutateAsync } = useDeleteKot();
  const userId = useHiClientZ((s) => s.captainData._id);

  const ordersWithActiveItems = useMemo(() => {
    return ordersData.filter((order) => order.cart);
  }, [ordersData]);

  const [selected, setSelected] = useState<SelectedMap>({});

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reason, setReason] = useState("");

  const totalSelectedItems = useMemo(() => {
    let count = 0;
    for (const orderId in selected) {
      count += selected[orderId].size;
    }
    return count;
  }, [selected]);

  const toggleItem = useCallback(
    (orderId: string, itemId: string, checked: boolean) => {
      setSelected((prev) => {
        const clone = { ...prev };
        if (!clone[orderId]) clone[orderId] = new Set();

        if (checked) {
          clone[orderId].add(itemId);
        } else {
          clone[orderId].delete(itemId);
        }

        if (clone[orderId].size === 0) {
          delete clone[orderId];
        }
        return clone;
      });
    },
    [],
  );

  const toggleAll = useCallback(
    (orderId: string, allAvailableItemIds: string[], checked: boolean) => {
      setSelected((prev) => {
        const clone = { ...prev };
        if (checked) {
          clone[orderId] = new Set(allAvailableItemIds);
        } else {
          delete clone[orderId]; // Clear all for this order
        }
        return clone;
      });
    },
    [],
  );

  const handleOpenDeleteDialog = useCallback(() => {
    if (totalSelectedItems === 0) {
      toast.error("Please select at least one item to delete.");
      return;
    }
    setReason(""); // Clear reason when opening
    setIsDialogOpen(true);
  }, [totalSelectedItems]);

  const handleConfirmGlobalDelete = useCallback(async () => {
    const allKotItemIdsToDelete: string[] = [];
    for (const orderId in selected) {
      allKotItemIdsToDelete.push(...Array.from(selected[orderId]));
    }

    if (allKotItemIdsToDelete.length === 0) {
      toast.error("No items selected for deletion.");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason for deletion.");
      return;
    }

    try {
      await mutateAsync({
        deletedBy: userId,
        kotItemIds: allKotItemIdsToDelete,
        reasonOfDeletion: reason,
      });
      setSelected({}); 
      setIsDialogOpen(false);
      toast.success("Selected KOT items deleted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete KOT items.");
    }
  }, [selected, reason, userId, mutateAsync]);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  return (
    <>
      <ScrollArea className="h-[90dvh] pb-20">
        <div className="px-4 py-4 space-y-6 pb-20">
          {ordersWithActiveItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60dvh] text-center text-gray-500">
              <Info className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No active orders found.</p>
              <p className="text-sm">
                All items in all orders have been deleted or there are no new
                orders.
              </p>
            </div>
          ) : (
            ordersWithActiveItems.map((order: OrderData) => {
              const availableCartItems = order.cart.filter(
                (item) => !item.isDeleted,
              );
              const allAvailableItemIds = availableCartItems.map((c) => c._id);
              const checkedSet = selected[order._id] || new Set();
              const allCheckedForOrder =
                allAvailableItemIds.length > 0 &&
                checkedSet.size === allAvailableItemIds.length;

              return (
                <Card key={order._id} className="w-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>
                        Order ID: {order._id.slice(-6)} - Table:{" "}
                        {order.tableName}
                      </span>
                      <Badge variant="secondary">
                        {order.cart.length} Total Items
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {availableCartItems.length > 0 && (
                      <label className="flex items-center mb-2 cursor-pointer p-2 rounded-md hover:bg-gray-50">
                        <Checkbox
                          checked={allCheckedForOrder}
                          onCheckedChange={(checked) =>
                            toggleAll(order._id, allAvailableItemIds, !!checked)
                          }
                          className="mr-3"
                        />
                        <span className="font-medium text-gray-800 flex-1">
                          Select All Active Items ({availableCartItems.length}{" "}
                          items)
                        </span>
                      </label>
                    )}
                    {availableCartItems.length === 0 && (
                      <p className="text-sm text-gray-500 italic p-2">
                        All items in this KOT have been deleted.
                      </p>
                    )}

                    <div className="space-y-2">
                      {order.cart.map((item) => {
                        const itemTotal =
                          item.dish.price * item.quantity +
                          (item.portion
                            ? item.portion.price * item.quantity
                            : 0) +
                          (item.extras?.reduce(
                            (sum, ext) => sum + ext.price * ext.quantity,
                            0,
                          ) || 0);

                        const isItemDeleted = item.isDeleted;

                        return (
                          <Card
                            key={item._id}
                            className={`flex justify-between items-center text-sm p-3 border rounded-md ${
                              isItemDeleted
                                ? "bg-gray-100 text-gray-500"
                                : "hover:bg-gray-50 cursor-pointer"
                            }`}
                            onClick={() =>
                              !isItemDeleted &&
                              toggleItem(
                                order._id,
                                item._id,
                                !checkedSet.has(item._id),
                              )
                            }
                          >
                            <div className="flex items-center flex-1">
                              <Checkbox
                                checked={
                                  isItemDeleted
                                    ? true
                                    : checkedSet.has(item._id)
                                }
                                onCheckedChange={(checked) =>
                                  !isItemDeleted &&
                                  toggleItem(order._id, item._id, !!checked)
                                }
                                onClick={(e) => e.stopPropagation()}
                                disabled={isItemDeleted}
                                className="mr-3"
                              />
                              <div className="flex-1">
                                <span
                                  className={`font-medium text-base ${
                                    isItemDeleted ? "line-through" : ""
                                  }`}
                                >
                                  {item.dish.name} × {item.quantity}
                                </span>
                                {item.portion && (
                                  <span
                                    className={`ml-1 text-xs text-gray-500 ${
                                      isItemDeleted ? "line-through" : ""
                                    }`}
                                  >
                                    ({item.portion.name})
                                  </span>
                                )}
                                {item.extras && item.extras.length > 0 && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    (+
                                    {item.extras
                                      .map((e) => (
                                        <span
                                          key={e.id}
                                          className={`${
                                            isItemDeleted ? "line-through" : ""
                                          }`}
                                        >
                                          {e.name}
                                        </span>
                                      ))
                                      .join(", ")}
                                    )
                                  </span>
                                )}
                                {isItemDeleted && (
                                  <div className="text-xs text-gray-600 flex flex-col mt-1">
                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3" /> Deleted by:{" "}
                                      {item.deletedBy}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MessageSquare className="h-3 w-3" />{" "}
                                      Reason: {item.reasonOfDeletion}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <span
                              className={`font-semibold text-base ${
                                isItemDeleted ? "line-through" : ""
                              }`}
                            >
                              ₹{itemTotal.toFixed(2)}
                            </span>
                            {isItemDeleted && (
                              <Badge variant="destructive" className="ml-2">
                                Deleted
                              </Badge>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Universal Delete Button */}
      <CommonBottomButton
        fixed={true}
        maxWidth="48rem"
        buttons={[
          {
            text: `Delete Selected (${totalSelectedItems})`,
            onClick: handleOpenDeleteDialog,
            className:
              "rounded-md w-full max-w-[24rem] bg-destructive hover:bg-destructive/90 text-white",
            disable: totalSelectedItems === 0,
            isLoading: isPending,
          },
        ]}
      />

      {/* Reason Modal */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete KOT Items</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Label htmlFor="reason">Reason for deletion</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe why you're deleting these items"
            />
            <p className="text-sm text-muted-foreground">
              You are about to delete {totalSelectedItems} item(s) across
              multiple orders.
            </p>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isPending || !reason.trim()}
              onClick={handleConfirmGlobalDelete}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {isPending ? (
                <span
                  className="
                    inline-block h-4 w-4 mr-2
                    border-2 border-current border-t-transparent
                    rounded-full animate-spin
                  "
                />
              ) : null}
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const DeleteKot = memo(MemoDeleteKot);
export default DeleteKot;
