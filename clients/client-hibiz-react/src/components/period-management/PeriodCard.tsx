import { useCallback, useState, memo } from "react";
import { motion } from "framer-motion";
import {
  Edit2,
  ToggleLeft,
  ToggleRight,
  Tag,
  Ticket,
  DollarSign,
  Percent,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PeriodConfig } from "@/hooks/useBusinessPeriodConfig";
import PeriodEditForm from "./PeriodEditForm";
import { useGetBusinessCoupons } from "@/hooks/useBusinessCoupons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

type PeriodCardProps = {
  periodConfig: PeriodConfig;
  periodIndex: number;
  dayIndex: number;
  periodInfo: {
    icon: any;
    label: string;
    color: string;
  };
  dayName: string;
  onTogglePeriod: (dayOfWeek: number, period: number) => Promise<void>;
  onSavePeriod: (
    dayOfWeek: number,
    period: number,
    baseCharge: number,
    redeemableCoverCharge: number,
    isOpen: boolean,
    couponAllocations?: any[],
  ) => Promise<void>;
  isActionInProgress: boolean;
  viewMode: "day" | "period";
  businessId: string;
  onCreateCoupon: (payload: any) => Promise<void>;
  isCreatingCoupon: boolean;
};

const PeriodCard = ({
  periodConfig,
  periodIndex,
  dayIndex,
  periodInfo,
  dayName,
  onTogglePeriod,
  onSavePeriod,
  isActionInProgress,
  viewMode,
  businessId,
  onCreateCoupon,
  isCreatingCoupon,
}: PeriodCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    baseCharge: periodConfig.baseCharge,
    redeemableCoverCharge: periodConfig.redeemableCoverCharge,
    isOpen: periodConfig.isOpen,
    couponAllocations: periodConfig.couponAllocations || [],
  });
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);

  const { data: couponsResponse } = useGetBusinessCoupons(businessId);
  const coupons = couponsResponse?.data || [];
  const PeriodIcon = periodInfo.icon;

  // Get coupon names for display
  const getCouponName = useCallback(
    (couponId: string) => {
      const coupon = coupons.find((c) => c._id === couponId);
      return coupon ? coupon.name : "Unknown Coupon";
    },
    [coupons],
  );

  const handleStartEditing = useCallback(() => {
    setEditValues({
      baseCharge: periodConfig.baseCharge,
      redeemableCoverCharge: periodConfig.redeemableCoverCharge,
      isOpen: periodConfig.isOpen,
      couponAllocations: periodConfig.couponAllocations || [],
    });
    setIsEditing(true);
  }, [periodConfig]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSave = useCallback(async () => {
    await onSavePeriod(
      dayIndex,
      periodIndex,
      editValues.baseCharge,
      editValues.redeemableCoverCharge,
      editValues.isOpen,
      editValues.couponAllocations,
    );
    setIsEditing(false);
  }, [dayIndex, periodIndex, editValues, onSavePeriod]);

  const handleTogglePeriod = useCallback(() => {
    onTogglePeriod(dayIndex, periodIndex);
  }, [dayIndex, periodIndex, onTogglePeriod]);

  const handleEditFieldChange = useCallback((field: string, value: any) => {
    setEditValues((prev) => ({
      ...prev,
      [field]:
        field === "isOpen"
          ? value
          : field === "couponAllocations"
            ? value
            : Number(value),
    }));
  }, []);

  const handleCouponClick = useCallback(
    (couponId: string) => {
      const coupon = coupons.find((c) => c._id === couponId);
      if (coupon) {
        setSelectedCoupon(coupon);
      }
    },
    [coupons],
  );

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={`p-4 rounded-lg border ${
        periodConfig.isOpen
          ? periodConfig.couponAllocations?.length
            ? "bg-white border-purple-200 shadow-sm"
            : "bg-white border-gray-200 shadow-sm"
          : "bg-gray-50 border-gray-100"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {viewMode === "day" ? (
            <>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${periodInfo.color
                  .replace("text-", "bg-")
                  .replace("500", "100")} ${periodInfo.color}`}
              >
                <PeriodIcon size={16} />
              </div>
              <h4 className="font-medium">{periodInfo.label}</h4>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="text-xs font-medium">
                  {dayName.substring(0, 2)}
                </span>
              </div>
              <h4 className="font-medium">{dayName}</h4>
            </>
          )}
          <Badge
            variant={periodConfig.isOpen ? "default" : "secondary"}
            className="ml-1"
          >
            {periodConfig.isOpen ? "Open" : "Closed"}
          </Badge>
        </div>

        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStartEditing}
            className="h-8 w-8 p-0"
            disabled={isActionInProgress}
          >
            <Edit2 size={16} />
          </Button>
        )}
      </div>

      {isEditing ? (
        <PeriodEditForm
          editValues={editValues}
          onEditFieldChange={handleEditFieldChange}
          onCancel={handleCancelEdit}
          onSave={handleSave}
          isActionInProgress={isActionInProgress}
          businessId={businessId}
          onCreateCoupon={onCreateCoupon}
          isCreatingCoupon={isCreatingCoupon}
        />
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-md">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">Base Charge</span>
              <span className="font-medium">₹{periodConfig.baseCharge}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">
                Redeemable Cover
              </span>
              <span className="font-medium">
                ₹{periodConfig.redeemableCoverCharge}
              </span>
            </div>
          </div>

          {periodConfig.couponAllocations &&
          periodConfig.couponAllocations.length > 0 ? (
            <div className="bg-purple-50 p-3 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-purple-700 flex items-center gap-1.5">
                  <Tag size={12} />
                  Coupon Allocations
                </span>
                <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                  {periodConfig.couponAllocations.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {periodConfig.couponAllocations.map((coupon) => (
                  <Badge
                    key={coupon._id || coupon.couponId}
                    variant="outline"
                    className="flex items-center gap-1.5 py-1 px-2 cursor-pointer hover:bg-purple-100 transition-colors border-purple-200"
                    onClick={() => handleCouponClick(coupon.couponId)}
                  >
                    <span className="truncate max-w-[80px]">
                      {getCouponName(coupon.couponId)}
                    </span>
                    <span className="bg-purple-100 text-purple-700 px-1.5 rounded-full">
                      {coupon.remaining}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-3 rounded-md text-center">
              <span className="text-xs text-gray-500 flex items-center justify-center gap-1.5">
                <Tag size={12} />
                No coupons allocated
              </span>
            </div>
          )}

          <Button
            variant={periodConfig.isOpen ? "destructive" : "outline"}
            size="sm"
            onClick={handleTogglePeriod}
            className="w-full h-9 mt-1"
            disabled={isActionInProgress}
          >
            {periodConfig.isOpen ? (
              <span className="flex items-center gap-1.5">
                <ToggleLeft size={16} />
                Close Period
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <ToggleRight size={16} />
                Open Period
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Coupon Detail Modal */}
      <Dialog
        open={!!selectedCoupon}
        onOpenChange={(open) => !open && setSelectedCoupon(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              <span>Coupon Details</span>
            </DialogTitle>
            <DialogDescription>
              Information about this coupon allocation
            </DialogDescription>
          </DialogHeader>

          {selectedCoupon && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedCoupon.config.discountType === "PERCENTAGE"
                      ? "bg-green-100 text-green-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {selectedCoupon.config.discountType === "PERCENTAGE" ? (
                    <Percent size={24} />
                  ) : (
                    <DollarSign size={24} />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedCoupon.name}
                  </h3>
                  <Badge
                    variant={selectedCoupon.isActive ? "default" : "secondary"}
                  >
                    {selectedCoupon.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Discount Type
                  </h4>
                  <p className="text-base font-medium">
                    {selectedCoupon.config.discountType === "PERCENTAGE"
                      ? "Percentage"
                      : "Fixed Amount"}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Discount Value
                  </h4>
                  <p className="text-base font-medium">
                    {selectedCoupon.config.discountType === "PERCENTAGE"
                      ? `${selectedCoupon.config.value}%`
                      : `₹${selectedCoupon.config.value}`}
                  </p>
                </div>

                {selectedCoupon.config.discountType === "PERCENTAGE" &&
                  selectedCoupon.config.upto && (
                    <div className="col-span-2">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Maximum Discount
                      </h4>
                      <p className="text-base font-medium">
                        Up to ₹{selectedCoupon.config.upto}
                      </p>
                    </div>
                  )}
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Allocation Details
                </h4>
                <div className="bg-purple-50 p-3 rounded-md">
                  {periodConfig.couponAllocations.find(
                    (c) => c.couponId === selectedCoupon._id,
                  ) && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Available Quantity:</span>
                      <Badge variant="secondary" className="font-bold">
                        {periodConfig.couponAllocations.find(
                          (c) => c.couponId === selectedCoupon._id,
                        )?.remaining || 0}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default memo(PeriodCard);
