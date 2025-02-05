import useCouponsStore from "@/components/store/useCouponsStore";
import { memo, useCallback } from "react";
import { cn } from "@hi/common";

export const discountArray = [
    {
        id: 1,
        name: "10% OFF",
        text: "10%",
    },
    {
        id: 2,
        name: "15% OFF",
        text: "15%",
    },
    {
        id: 3,
        name: "25% OFF",
        text: "25%",
    },
    {
        id: 4,
        name: "50% OFF",
        text: "50%",
    },
];

const MemoTextFixedDiscount = () => {
    const { couponDiscount, setCouponDiscount } = useCouponsStore((s) => ({
        couponDiscount: s.couponDiscount,
        setCouponDiscount: s.setCouponDiscount,
    }));

    const handlePredefinedDiscount = useCallback((discount: number) => {
        setCouponDiscount(discount);
    }, []);

    return (
        <article className="flex justify-between w-full gap-2 mt-4">
            {discountArray.map((discount) => (
                <button
                    key={discount.id}
                    type="button"
                    className={cn(
                        "p-2 rounded-xl text-sm w-full",
                        couponDiscount === Number(discount.text.replace("%", ""))
                            ? "bg-[#8C63FF] text-white"
                            : "bg-[#F1E9FB] text-[#8C63FF]",
                    )}
                    onClick={() =>
                        handlePredefinedDiscount(Number(discount.text.replace("%", "")))
                    }
                >
                    {discount.name}
                </button>
            ))}
        </article>
    );
};

const TextFixedDiscount = memo(MemoTextFixedDiscount);
export default TextFixedDiscount;
