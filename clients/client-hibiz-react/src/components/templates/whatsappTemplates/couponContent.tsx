import useWhatsapp from "@/components/store/useWhatsapp";
import type { ICouponzLinks } from "@/components/types/businessData";
import { useCouponzLinks } from "@/hooks/useTemplates";
import { useQuery } from "@tanstack/react-query";
import { memo, useCallback, useMemo, useState } from "react";
import { FiChevronDown, FiTag } from "react-icons/fi";

const MemoCouponContent = () => {
  const { couponzLinks, selectedCoupon, setSelectedCoupon, addCouponzText } =
    useWhatsapp((s) => ({
      couponzLinks: s.couponzLinks,
      selectedCoupon: s.selectedCoupon,
      setSelectedCoupon: s.setSelectedCoupon,
      addCouponzText: s.addCouponzText,
    }));
  const { getCouponzLinks } = useCouponzLinks();
  const [isCouponDropdownOpen, setIsCouponDropdownOpen] = useState(false);
  const handleCouponSelect = useCallback(
    (coupon: ICouponzLinks) => {
      setSelectedCoupon(coupon.name);
      addCouponzText(coupon);
      setIsCouponDropdownOpen(false);
    },
    [setSelectedCoupon, addCouponzText],
  );

  const { data: fetchedCouponzLinks, isLoading } = useQuery({
    queryKey: ["couponzLinks"],
    queryFn: getCouponzLinks,
    enabled: isCouponDropdownOpen && couponzLinks.length === 0,
  });

  const displayedCouponzLinks = useMemo(
    () =>
      couponzLinks.length > 0 ? couponzLinks : fetchedCouponzLinks?.data || [],
    [couponzLinks, fetchedCouponzLinks],
  );
  return (
    <div className="mb-4">
      <label htmlFor="couponSelect" className="block font-bold text-gray-700">
        Add Coupon
      </label>
      <h1 className="mb-2 text-xs font-medium text-gray-700">
        share your coupon links from here
      </h1>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsCouponDropdownOpen(!isCouponDropdownOpen)}
          className="w-full px-4 py-2 text-left text-gray-700 transition-colors duration-200 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiTag className="w-5 h-5 mr-2 text-blue-500" />
              <span className="truncate">
                {selectedCoupon || "Select a coupon"}
              </span>
            </div>
            <FiChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isCouponDropdownOpen ? "transform rotate-180" : ""
              }`}
            />
          </div>
        </button>
        {isCouponDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            {isLoading ? (
              <div className="p-4 text-center text-gray-600">
                Loading couponz...
              </div>
            ) : (
              <ul className="py-1 overflow-auto max-h-60">
                {displayedCouponzLinks.map((coupon: ICouponzLinks) => {
                  if (!coupon?.name) return null;
                  return (
                    <li
                      key={coupon.name}
                      className="px-4 py-2 transition-colors duration-200 cursor-pointer hover:bg-blue-50"
                      onClick={() => handleCouponSelect(coupon)}
                      onKeyDown={() => handleCouponSelect(coupon)}
                    >
                      <div className="flex items-center">
                        <FiTag className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="truncate">{coupon.name}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const CouponContent = memo(MemoCouponContent);
export default CouponContent;
