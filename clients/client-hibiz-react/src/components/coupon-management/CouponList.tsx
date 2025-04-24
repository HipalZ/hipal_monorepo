import { Label } from "@/components/ui/label";
import { useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Percent,
  DollarSign,
  Edit,
  Search,
  Users,
  Filter,
  Ticket,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import CouponForm from "./CouponForm";
import type {
  Coupon,
  CouponCreatePayload,
  CouponUpdatePayload,
} from "@/hooks/useBusinessCoupons";
import AdvancedBottomButton from "../atom/bottomButton/advancedBottomButton";

type CouponListProps = {
  coupons: Coupon[];
  businessId: string;
  isLoading: boolean;
  onCreateCoupon: (payload: CouponCreatePayload) => Promise<void>;
  onUpdateCoupon: (
    couponId: string,
    payload: CouponUpdatePayload,
  ) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
};

// Update the CouponList component to include the new features
const CouponList = ({
  coupons,
  businessId,
  isLoading,
  onCreateCoupon,
  onUpdateCoupon,
  isCreating,
  isUpdating,
}: CouponListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "percentage" | "amount">(
    "all",
  );
  const [filterHasAllocations, setFilterHasAllocations] = useState<
    "all" | "yes" | "no"
  >("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [detailCoupon, setDetailCoupon] = useState<Coupon | null>(null);
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Filter coupons based on search term, filter type, and allocation status
  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "all" ||
      (filterType === "percentage" &&
        coupon.config.discountType === "PERCENTAGE") ||
      (filterType === "amount" && coupon.config.discountType === "AMOUNT");

    // Check if coupon has allocations (this is a placeholder - you'll need to implement the actual logic)
    const hasAllocations = coupon.isActive; // Replace with actual allocation check
    const matchesAllocation =
      filterHasAllocations === "all" ||
      (filterHasAllocations === "yes" && hasAllocations) ||
      (filterHasAllocations === "no" && !hasAllocations);

    return matchesSearch && matchesType && matchesAllocation;
  });

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [],
  );

  // Handle filter type change
  const handleFilterTypeChange = useCallback((value: string) => {
    setFilterType(value as "all" | "percentage" | "amount");
  }, []);

  // Handle allocation filter change
  const handleAllocationFilterChange = useCallback((value: string) => {
    setFilterHasAllocations(value as "all" | "yes" | "no");
  }, []);

  // Handle create coupon
  const handleCreateCoupon = useCallback(
    async (formData: CouponCreatePayload) => {
      await onCreateCoupon(formData);
      setIsCreateModalOpen(false);
    },
    [onCreateCoupon],
  );

  // Handle edit coupon
  const handleEditCoupon = useCallback(
    async (formData: CouponUpdatePayload) => {
      if (editingCoupon) {
        await onUpdateCoupon(editingCoupon._id, formData);
        setEditingCoupon(null);
      }
    },
    [editingCoupon, onUpdateCoupon],
  );

  // Start editing a coupon
  const startEditingCoupon = useCallback((coupon: Coupon) => {
    setEditingCoupon(coupon);
  }, []);

  // View coupon details
  const viewCouponDetails = useCallback((coupon: Coupon) => {
    setDetailCoupon(coupon);
  }, []);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setEditingCoupon(null);
  }, []);

  // Render filter controls
  const renderFilterControls = () => (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search coupons..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-10 h-10"
        />
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-xs font-medium text-gray-700 mb-2 block">
            Discount Type
          </Label>
          <Tabs
            defaultValue="all"
            value={filterType}
            onValueChange={handleFilterTypeChange}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="text-xs">
                All Types
              </TabsTrigger>
              <TabsTrigger
                value="percentage"
                className="text-xs flex items-center gap-1"
              >
                <Percent size={12} />
                Percentage
              </TabsTrigger>
              <TabsTrigger
                value="amount"
                className="text-xs flex items-center gap-1"
              >
                <DollarSign size={12} />
                Fixed
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div>
          <Label className="text-xs font-medium text-gray-700 mb-2 block">
            Allocation Status
          </Label>
          <Tabs
            defaultValue="all"
            value={filterHasAllocations}
            onValueChange={handleAllocationFilterChange}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="text-xs">
                All Coupons
              </TabsTrigger>
              <TabsTrigger
                value="yes"
                className="text-xs flex items-center gap-1"
              >
                <CheckCircle size={12} className="text-green-500" />
                Allocated
              </TabsTrigger>
              <TabsTrigger
                value="no"
                className="text-xs flex items-center gap-1"
              >
                <XCircle size={12} className="text-red-500" />
                Unallocated
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <motion.div
            className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            style={{
              perspective: "1000px",
              transformStyle: "preserve-3d",
            }}
          >
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{ rotateY: [0, 15, 0, -15, 0] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 6,
                ease: "easeInOut",
              }}
            >
              <div className="relative">
                <div className="absolute -right-1 -bottom-1 text-primary/20">
                  <Ticket size={24} strokeWidth={1.5} />
                </div>
                <div className="relative z-10 text-primary">
                  <Ticket size={24} strokeWidth={2} />
                </div>
              </div>
            </motion.div>
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Coupon Management
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Create and manage discount coupons for your business. Allocate
              coupons to specific periods.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="h-12 px-4 rounded-xl shadow-md"
          disabled={isCreating || isUpdating}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Create Coupon</span>
          </motion.div>
        </Button>
      </div>

      {/* Filters - Desktop */}
      <div className="hidden sm:block">
        <Card className="shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter size={16} />
              Filter Coupons
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {renderFilterControls()}
          </CardContent>
        </Card>
      </div>

      {/* Filters - Mobile */}
      {isMobile && (
        <div className="fixed z-40 bottom-4 right-4 sm:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="icon"
                className="w-12 h-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
              >
                <Filter size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[50vh] rounded-t-xl pt-4">
              <div className="flex flex-col h-full">
                <div className="px-1 pb-2 text-sm font-medium">
                  Filter Coupons
                </div>
                <div className="flex-1 pr-4 -mr-4 pb-16">
                  {renderFilterControls()}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Coupon list */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Ticket className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Coupons Found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchTerm ||
              filterType !== "all" ||
              filterHasAllocations !== "all"
                ? "No coupons match your search criteria. Try adjusting your filters."
                : "You haven't created any coupons yet. Create your first coupon to get started."}
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={16} className="mr-2" />
              Create New Coupon
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence initial={false}>
            {filteredCoupons.map((coupon) => (
              <motion.div
                key={coupon._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className={`h-full shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                    coupon.isActive ? "border-green-100" : "border-gray-200"
                  }`}
                  onClick={() => viewCouponDetails(coupon)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            coupon.config.discountType === "PERCENTAGE"
                              ? "bg-green-100 text-green-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {coupon.config.discountType === "PERCENTAGE" ? (
                            <Percent size={20} />
                          ) : (
                            <DollarSign size={20} />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-base">
                            {coupon.name}
                          </h3>
                          <Badge
                            variant={coupon.isActive ? "default" : "secondary"}
                            className="mt-1 text-xs"
                          >
                            {coupon.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingCoupon(coupon);
                          }}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewCouponDetails(coupon);
                          }}
                        >
                          <Info size={16} />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">Discount</span>
                        <Badge
                          variant="outline"
                          className={`${
                            coupon.config.discountType === "PERCENTAGE"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {coupon.config.discountType === "PERCENTAGE" ? (
                            <span>{coupon.config.value}%</span>
                          ) : (
                            <span>₹{coupon.config.value}</span>
                          )}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Base Charge
                        </span>
                        <span className="text-sm font-medium">
                          ₹{coupon.bookingMeta.baseCharge}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create coupon modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-h-[100dvh] md:max-h-[85dvh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              <span>Create New Coupon</span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4 -mr-4 overflow-x-hidden overflow-y-auto h-[90dvh] pb-[10rem]">
            <CouponForm
              onSubmit={handleCreateCoupon}
              onCancel={() => setIsCreateModalOpen(false)}
              isSubmitting={isCreating}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit coupon modal */}
      <Dialog
        open={!!editingCoupon}
        onOpenChange={(open) => !open && setEditingCoupon(null)}
      >
        <DialogContent className="max-h-[100dvh] md:max-h-[85dvh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              <span>Edit Coupon</span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4 -mr-4 overflow-x-hidden overflow-y-auto h-[90dvh] pb-[10rem]">
            {editingCoupon && (
              <CouponForm
                onSubmit={handleEditCoupon}
                onCancel={cancelEditing}
                isSubmitting={isUpdating}
                initialValues={{
                  name: editingCoupon.name,
                  config: {
                    value: editingCoupon.config.value,
                    discountType: editingCoupon.config.discountType,
                    upto: editingCoupon.config.upto,
                  },
                  bookingMeta: {
                    baseCharge: editingCoupon.bookingMeta.baseCharge,
                    redeemableCoverCharge:
                      editingCoupon.bookingMeta.redeemableCoverCharge,
                    minGuests: editingCoupon.bookingMeta.minGuests,
                  },
                }}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Coupon detail modal */}
      <Dialog
        open={!!detailCoupon}
        onOpenChange={(open) => !open && setDetailCoupon(null)}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              <span>Coupon Details</span>
            </DialogTitle>
            <DialogDescription>
              View detailed information about this coupon
            </DialogDescription>
          </DialogHeader>

          {detailCoupon && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    detailCoupon.config.discountType === "PERCENTAGE"
                      ? "bg-green-100 text-green-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {detailCoupon.config.discountType === "PERCENTAGE" ? (
                    <Percent size={24} />
                  ) : (
                    <DollarSign size={24} />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{detailCoupon.name}</h3>
                  <Badge
                    variant={detailCoupon.isActive ? "default" : "secondary"}
                  >
                    {detailCoupon.isActive ? "Active" : "Inactive"}
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
                    {detailCoupon.config.discountType === "PERCENTAGE"
                      ? "Percentage"
                      : "Fixed Amount"}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Discount Value
                  </h4>
                  <p className="text-base font-medium">
                    {detailCoupon.config.discountType === "PERCENTAGE"
                      ? `${detailCoupon.config.value}%`
                      : `₹${detailCoupon.config.value}`}
                  </p>
                </div>

                {detailCoupon.config.discountType === "PERCENTAGE" &&
                  detailCoupon.config.upto && (
                    <div className="col-span-2">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Maximum Discount
                      </h4>
                      <p className="text-base font-medium">
                        Up to ₹{detailCoupon.config.upto}
                      </p>
                    </div>
                  )}
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Booking Requirements
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <DollarSign size={14} className="text-gray-500" />
                      <span className="text-sm text-gray-500">Base Charge</span>
                    </div>
                    <p className="text-base font-medium">
                      ₹{detailCoupon.bookingMeta.baseCharge}
                    </p>
                  </div>

                  {detailCoupon.bookingMeta.redeemableCoverCharge && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <DollarSign size={14} className="text-gray-500" />
                        <span className="text-sm text-gray-500">
                          Redeemable Cover
                        </span>
                      </div>
                      <p className="text-base font-medium">
                        ₹{detailCoupon.bookingMeta.redeemableCoverCharge}
                      </p>
                    </div>
                  )}

                  {detailCoupon.bookingMeta.minGuests && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Users size={14} className="text-gray-500" />
                        <span className="text-sm text-gray-500">
                          Minimum Guests
                        </span>
                      </div>
                      <p className="text-base font-medium">
                        {detailCoupon.bookingMeta.minGuests}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Status
                  </h4>
                  <div className="flex items-center gap-2">
                    {detailCoupon.isActive ? (
                      <>
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-green-600 font-medium">
                          Active
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} className="text-red-500" />
                        <span className="text-red-600 font-medium">
                          Inactive
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setDetailCoupon(null);
                    startEditingCoupon(detailCoupon);
                  }}
                  className="flex items-center gap-1.5"
                >
                  <Edit size={16} />
                  <span>Edit Coupon</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile create button */}
      {isMobile && !isCreateModalOpen && !editingCoupon && !detailCoupon && (
        <AdvancedBottomButton
          fixed={true}
          maxWidth="100%"
          buttons={[
            {
              text: "Create New Coupon",
              onClick: () => setIsCreateModalOpen(true),
              swipe: true,
              disabled: isCreating || isUpdating,
            },
          ]}
        />
      )}
    </div>
  );
};

export default memo(CouponList);
