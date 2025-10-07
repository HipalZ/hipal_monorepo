"use client";

import { memo, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { CoinsIcon, TicketIcon } from "lucide-react";
import CoinzBottomPopup from "./JewelleryAddCoinz";
import CouponBottomPopup from "./JewelleryAddCoupon";

interface ActionButtonsProps {
  onAddCoupon?: () => void;
  disabled?: boolean;
}

const ActionButtonsComponent = ({
  onAddCoupon,
  disabled = false,
}: ActionButtonsProps = {}) => {
  const [coinzOpen, setCoinzOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);

  const handleAddCoins = useCallback(() => {
    setCoinzOpen(true);
  }, []);

  const handleAddCoupon = useCallback(() => {
    setCouponOpen(true);
  }, []);

  return (
    <div className="my-4 space-y-3">
      <Button
        variant="outline"
        className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 bg-transparent"
        onClick={handleAddCoins}
        disabled={disabled}
      >
        <CoinsIcon className="mr-2 h-4 w-4" />
        Add Coinz
      </Button>
      <Button
        variant="outline"
        className="w-full border-blue-500 text-blue-500 hover:bg-blue-500/10 bg-transparent"
        onClick={handleAddCoupon}
        disabled={disabled}
      >
        <TicketIcon className="mr-2 h-4 w-4" />
        Add Coupon
      </Button>

      {coinzOpen && (
        <CoinzBottomPopup
          open={coinzOpen}
          onClose={() => setCoinzOpen(false)}
          maxCoins={4999}
          title="Add Coinz"
        />
      )}
      {couponOpen && (
        <CouponBottomPopup
          open={couponOpen}
          onClose={() => setCouponOpen(false)}
        />
      )}
    </div>
  );
};

export const ActionButtons = memo(ActionButtonsComponent);
