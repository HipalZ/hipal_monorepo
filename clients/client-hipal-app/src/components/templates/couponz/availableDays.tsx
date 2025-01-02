import { Coupon } from "@/components/types/businessData";
import React, { memo } from "react";

const MemoAvailableDays = ({ coupon }: { coupon: Coupon }) => {
  return (
    <p className="mt-1 text-[#858585] text-xs font-semibold">
      Available:{" "}
      {coupon?.conditions?.availability?.customDays?.length > 0
        ? coupon?.conditions?.availability?.customDays
            ?.map((day) => day.slice(0, 3))
            .join(", ")
        : "All Time"}
    </p>
  );
};

const AvailableDays = memo(MemoAvailableDays);
export default AvailableDays;
