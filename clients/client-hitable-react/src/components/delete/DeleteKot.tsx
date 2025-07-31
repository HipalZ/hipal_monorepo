import { memo, useMemo, useState, useCallback, Fragment } from "react";
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
import { Info, User, MessageSquare, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { useDeleteKot } from "@/components/hooks/useOrder";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import type { OrderData } from "@/components/types/hiClientzData";
import CommonBottomButton from "../atoms/bottomButton/index.tsx";
import { useIsPasswordActive } from "../hooks/usePasswordManager.ts";
import SpinnerMemo from "../atoms/loadingSpinner/index.tsx";

interface SelectedItemWithQuantity {
  itemId: string;
  quantity: number;
  maxQuantity: number;
}

interface SelectedMap {
  [orderId: string]: Map<string, SelectedItemWithQuantity>;
}

const MemoDeleteKot = () => {
  const ordersData = useOrderStore((s) => s.orderDataStore);
  const { isPending, mutateAsync, isError } = useDeleteKot();
  const { isLoading, isActive } = useIsPasswordActive("DELETE_KOT");
  const userId = useHiClientZ((s) => s.captainData._id);

  console.log(isError);

  const ordersWithActiveItems = useMemo(() => {
    return ordersData.filter((order) => order.cart);
  }, [ordersData]);

  const [selected, setSelected] = useState<SelectedMap>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState(""); // Add password state

  const totalSelectedItems = useMemo(() => {
    let count = 0;
    for (const orderId in selected) {
      count += selected[orderId].size;
    }
    return count;
  }, [selected]);

  const totalSelectedQuantity = useMemo(() => {
    let totalQty = 0;
    for (const orderId in selected) {
      for (const [, itemData] of selected[orderId]) {
        totalQty += itemData.quantity;
      }
    }
    return totalQty;
  }, [selected]);

  const toggleItem = useCallback(
    (
      orderId: string,
      itemId: string,
      maxQuantity: number,
      checked: boolean,
    ) => {
      setSelected((prev) => {
        const clone = { ...prev };
        if (!clone[orderId]) clone[orderId] = new Map();
        if (checked) {
          clone[orderId].set(itemId, {
            itemId,
            quantity: maxQuantity,
            maxQuantity,
          });
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

  const updateItemQuantity = useCallback(
    (orderId: string, itemId: string, newQuantity: number) => {
      setSelected((prev) => {
        const clone = { ...prev };
        if (clone[orderId] && clone[orderId].has(itemId)) {
          const itemData = clone[orderId].get(itemId)!;
          clone[orderId].set(itemId, {
            ...itemData,
            quantity: Math.max(1, Math.min(newQuantity, itemData.maxQuantity)),
          });
        }
        return clone;
      });
    },
    [],
  );

  const toggleAll = useCallback(
    (
      orderId: string,
      availableItems: Array<{ id: string; quantity: number }>,
      checked: boolean,
    ) => {
      setSelected((prev) => {
        const clone = { ...prev };
        if (checked) {
          clone[orderId] = new Map();
          availableItems.forEach((item) => {
            clone[orderId].set(item.id, {
              itemId: item.id,
              quantity: item.quantity,
              maxQuantity: item.quantity,
            });
          });
        } else {
          delete clone[orderId];
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
    setReason("");
    setPassword(""); // Reset password when opening dialog
    setIsDialogOpen(true);
  }, [totalSelectedItems]);

  const handleConfirmGlobalDelete = useCallback(async () => {
    const kotItems: Array<{ itemId: string; quantity: number }> = [];
    for (const orderId in selected) {
      for (const [, itemData] of selected[orderId]) {
        kotItems.push({
          itemId: itemData.itemId,
          quantity: itemData.quantity,
        });
      }
    }

    if (kotItems.length === 0) {
      toast.error("No items selected for deletion.");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason for deletion.");
      return;
    }

    // Check if password is required and validate
    if (isActive && !password.trim()) {
      toast.error("Please enter the delete KOT password.");
      return;
    }

    try {
      const payload = {
        kotItems,
        deletedBy: userId,
        reasonOfDeletion: reason,
        ...(isActive && { password }),
      };

      const res = await mutateAsync(payload);
      if (res.status === 200) {
        toast.success("Selected KOT items deleted successfully!");
        setSelected({});
        setIsDialogOpen(false);
        setPassword("");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete KOT items.");
    }
  }, [selected, reason, password, userId, mutateAsync, isActive]);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setPassword(""); // Clear password when closing dialog
  }, []);

  if (isLoading) return <SpinnerMemo />;

  return (
    <>
      <ScrollArea className="h-[100dvh] lg:h-[90dvh] pb-20">
        <div className="space-y-6 pb-20">
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
              const availableItemsData = availableCartItems.map((item) => ({
                id: item._id,
                quantity: item.quantity,
              }));
              const checkedMap = selected[order._id] || new Map();
              const allCheckedForOrder =
                availableCartItems.length > 0 &&
                availableCartItems.every((item) => checkedMap.has(item._id));

              return (
                <Card
                  key={order._id}
                  className="w-full border-none shadow-none"
                >
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
                            toggleAll(order._id, availableItemsData, !!checked)
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
                        const baseTotal = item.dish.price * item.quantity;
                        const portionTotal = item.portion
                          ? item.portion.price * item.quantity
                          : 0;
                        const extrasTotal =
                          item.extras?.reduce(
                            (sum, ext) =>
                              sum + ext.price * ext.quantity * item.quantity,
                            0,
                          ) ?? 0;
                        const itemTotal =
                          baseTotal + portionTotal + extrasTotal;
                        const isItemDeleted = item.isDeleted;
                        const isSelected = checkedMap.has(item._id);
                        const selectedItemData = checkedMap.get(item._id);

                        return (
                          <Card
                            key={item._id}
                            className={`text-sm border rounded-md ${
                              isItemDeleted
                                ? "bg-gray-100 text-gray-500"
                                : isSelected
                                  ? "border-primary bg-primary/5"
                                  : "hover:bg-gray-50"
                            }`}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center flex-1">
                                  <Checkbox
                                    checked={isItemDeleted ? true : isSelected}
                                    onCheckedChange={(checked) =>
                                      !isItemDeleted &&
                                      toggleItem(
                                        order._id,
                                        item._id,
                                        item.quantity,
                                        !!checked,
                                      )
                                    }
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
                                        {item.extras.map((e, i) => (
                                          <Fragment key={e.id}>
                                            <span
                                              className={
                                                isItemDeleted
                                                  ? "line-through"
                                                  : ""
                                              }
                                            >
                                              {e.name}
                                              {e.quantity > 1 &&
                                                ` x${e.quantity}`}
                                            </span>
                                            {i < item.extras.length - 1 && ", "}
                                          </Fragment>
                                        ))}
                                        )
                                      </span>
                                    )}
                                    {isItemDeleted && (
                                      <div className="text-xs text-gray-600 flex flex-col mt-1">
                                        <span className="flex items-center gap-1">
                                          <User className="h-3 w-3" /> Deleted
                                          by: {item.deletedBy}
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
                              </div>
                              {/* Quantity Selector for Selected Items */}
                              {isSelected &&
                                selectedItemData &&
                                !isItemDeleted && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="flex items-center gap-3">
                                      <Label className="text-sm font-medium">
                                        Delete Quantity:
                                      </Label>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-8 w-8 bg-white"
                                          onClick={() =>
                                            updateItemQuantity(
                                              order._id,
                                              item._id,
                                              selectedItemData.quantity - 1,
                                            )
                                          }
                                          disabled={
                                            selectedItemData.quantity <= 1
                                          }
                                        >
                                          -
                                        </Button>
                                        <span className="w-8 text-center text-black font-semibold">
                                          {selectedItemData.quantity}
                                        </span>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-8 w-8 bg-white"
                                          onClick={() =>
                                            updateItemQuantity(
                                              order._id,
                                              item._id,
                                              selectedItemData.quantity + 1,
                                            )
                                          }
                                          disabled={
                                            selectedItemData.quantity >=
                                            selectedItemData.maxQuantity
                                          }
                                        >
                                          +
                                        </Button>
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        (Max: {selectedItemData.maxQuantity})
                                      </span>
                                    </div>
                                  </div>
                                )}
                            </CardContent>
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
            text: `Delete Selected (${totalSelectedItems} items, ${totalSelectedQuantity} qty)`,
            onClick: handleOpenDeleteDialog,
            className:
              "rounded-md w-full max-w-[24rem] bg-destructive hover:bg-destructive/90 text-white",
            disable: totalSelectedItems === 0,
            isLoading: isPending,
          },
        ]}
      />

      {/* Reason and Password Modal */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete KOT Items</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for deletion</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe why you're deleting these items"
              />
            </div>

            {/* Password Input - Only show if password is required */}
            {isActive && (
              <div>
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Delete KOT Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter delete KOT password"
                  className="mt-1"
                />
              </div>
            )}

            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-muted-foreground mb-2">
                You are about to delete {totalSelectedItems} item(s) with a
                total quantity of {totalSelectedQuantity} across multiple
                orders.
              </p>
              <div className="text-xs text-gray-600">
                {Object.entries(selected).map(([orderId, itemsMap]) => {
                  const order = ordersData.find((o) => o._id === orderId);
                  return (
                    <div key={orderId} className="mb-1">
                      <strong>Order {orderId.slice(-6)}:</strong>{" "}
                      {Array.from(itemsMap.values())
                        .map((item) => `${item.quantity} qty`)
                        .join(", ")}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                isPending || !reason.trim() || (isActive && !password.trim()) // Disable if password required but not provided
              }
              onClick={handleConfirmGlobalDelete}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {isPending ? (
                <span className="inline-block h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
