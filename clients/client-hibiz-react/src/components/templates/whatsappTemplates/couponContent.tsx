import { memo, useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiTag } from "react-icons/fi";
import useWhatsapp from "@/components/store/useWhatsapp";
import type { ICouponzLinks } from "@/components/types/businessData";
import { useCouponzLinks } from "@/hooks/useTemplates";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

const MemoCouponContent = () => {
  const { couponzLinks, selectedCoupon, setSelectedCoupon, addCouponzText } =
    useWhatsapp((s) => ({
      couponzLinks: s.couponzLinks,
      selectedCoupon: s.selectedCoupon,
      setSelectedCoupon: s.setSelectedCoupon,
      addCouponzText: s.addCouponzText,
    }));

  const { getCouponzLinks } = useCouponzLinks();
  const [open, setOpen] = useState(false);

  const { data: fetched, isLoading } = useQuery({
    queryKey: ["couponzLinks"],
    queryFn: getCouponzLinks,
    enabled: open && couponzLinks.length === 0,
  });

  const displayedCouponzLinks: ICouponzLinks[] = useMemo(
    () => (couponzLinks.length > 0 ? couponzLinks : fetched?.data || []),
    [couponzLinks, fetched],
  );

  const handleChange = useCallback(
    (value: string) => {
      const c = displayedCouponzLinks.find((x) => x.name === value);
      if (!c) return;
      setSelectedCoupon(c.name);
      addCouponzText(c);
    },
    [displayedCouponzLinks, setSelectedCoupon, addCouponzText],
  );

  return (
    <div className="mb-4 space-y-2">
      <Label htmlFor="couponSelect" className="font-semibold">
        Add Coupon
      </Label>
      <p className="text-xs text-muted-foreground">
        Share your coupon links from here
      </p>

      <Select
        open={open}
        onOpenChange={setOpen}
        value={selectedCoupon ?? ""}
        onValueChange={handleChange}
      >
        <SelectTrigger id="couponSelect" className="justify-start">
          <div className="mr-2 text-blue-500">
            <FiTag className="h-4 w-4" />
          </div>
          <SelectValue
            placeholder="Select a coupon"
            aria-label={selectedCoupon || "Select a coupon"}
          />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="__loading" disabled>
              Loading coupons…
            </SelectItem>
          ) : displayedCouponzLinks.length === 0 ? (
            <SelectItem value="__empty" disabled>
              No coupons found
            </SelectItem>
          ) : (
            <ScrollArea className="h-56">
              {displayedCouponzLinks.map((c) =>
                c?.name ? (
                  <SelectItem key={c.name} value={c.name}>
                    <div className="flex items-center">
                      <FiTag className="mr-2 h-4 w-4 text-blue-500" />
                      <span className="truncate">{c.name}</span>
                    </div>
                  </SelectItem>
                ) : null,
              )}
            </ScrollArea>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default memo(MemoCouponContent);
