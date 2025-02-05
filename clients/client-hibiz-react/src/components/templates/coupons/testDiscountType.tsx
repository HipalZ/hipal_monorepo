import useCouponsStore from "@/components/store/useCouponsStore";
import { Percent } from "lucide-react";
import { memo, useState } from "react";
import { BiRupee } from "react-icons/bi";

const MemoTestDiscountType = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const handleOptionClick = (value) => {
        setCouponDiscount(value);
        setShowDropdown(false);
    };

    const {
        couponType,
        setCouponType,
        couponDiscount,
        setCouponDiscount,
    } = useCouponsStore((s) => ({
        couponType: s.couponType,
        setCouponType: s.setCouponType,
        couponDiscount: s.couponDiscount,
        setCouponDiscount: s.setCouponDiscount,
    }));

    const discountOptions = [10, 15, 25, 50];

    return (
        <section>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type & Value
            </label>
            <div className="flex gap-2">
                <div className="flex-1">
                    <select
                        value={couponType}
                        onChange={(e) => setCouponType(e.target.value)}
                        className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FIXED">Fixed Amount (₹)</option>
                    </select>
                </div>
                <div className="flex-1 relative">
                    {couponType === 'PERCENTAGE' ? (
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    ) : (
                        <BiRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    )}
                    <input
                        type="number"
                        value={couponDiscount}
                        onChange={(e) => setCouponDiscount(e.target.value)}
                        onBlur={() => setShowDropdown(false)}
                        onClick={() => setShowDropdown(true)}
                        className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder={couponType === 'PERCENTAGE' ? "Enter percentage" : "Enter amount"}
                    />

                    {showDropdown && couponType === 'PERCENTAGE' && (
                        <article className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                            {discountOptions.map((option) => (
                                <div
                                    key={option}
                                    className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleOptionClick(option)}
                                >
                                    {option}%
                                </div>
                            ))}
                        </article>
                    )}
                </div>
            </div>
        </section>
    );
};

const TestDiscountType = memo(MemoTestDiscountType);
export default TestDiscountType;