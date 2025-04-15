import { BiArrowBack } from 'react-icons/bi';
import { cn } from '@/lib/utils';
import { formatDate, formatDiscount } from '@/components/utils/helpers';
import dynamic from 'next/dynamic';
import React, { memo } from 'react'
import ShimmerImage from '@/components/atoms/imageshimmer';
import SkeletonLoader from '@/components/atoms/loader/skeletonLoader';
import type { BillData, Coupon } from '@/components/types/businessData';
import useBusinessDetails from '@/components/store/useBusinessDetails';

const AvailableDays = dynamic(() => import("./availableDays"), {
    loading: () => <SkeletonLoader height={20} />,
});

interface Props {
    billValue: number;
    greatDeals: Coupon[];
    missingOut: Coupon[];
    upcomingCouponz: Coupon[];
    removeCoupon: () => void;
    applyCoupon: (coupon: Coupon) => void;
    closeCouponz: () => void;
    availedCoupon?: Coupon;
    billData?: BillData;
}

const MemoApplyCouponz = (props: Props) => {
    const {
        billValue,
        greatDeals,
        missingOut,
        upcomingCouponz,
        removeCoupon,
        applyCoupon,
        closeCouponz,
        availedCoupon,
        billData
    } = props;

    const { logoUrl } = useBusinessDetails((s) => ({
        logoUrl: s.businessDetails?.logoUrl,
    }));

    return (
        <section className="bg-[#F1F0F5] overflow-y-auto h-full py-4 relative inter hide-scrollbar">
            <section className="fixed top-0 z-20 flex justify-between w-full gap-4 p-2 bg-white">
                <article className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={closeCouponz}
                        className="py-2 rounded-full z-[60] px-4 text-black bg-[#ffffff70] border"
                    >
                        <BiArrowBack />
                    </button>
                    <article>
                        <h1 className="text-lg text-black">Apply Couponz</h1>
                        <p className="text-[10px] text-[#676769]">
                            Bill Amount: ₹ {billValue}
                        </p>
                    </article>
                </article>
                <picture className="mr-6">
                    <ShimmerImage src={logoUrl} alt="logoUrl" width={44} height={44} />
                </picture>
            </section>
            <br />
            <br />
            <h1 className="mx-4 mt-6 text-xs font-bold text-black">
                Great deals you get on this billing
            </h1>
            {greatDeals?.length > 0 ? (
                greatDeals?.map((coupon) => (
                    <section
                        key={coupon?._id}
                        className="flex mx-4 my-4 rounded-2xl inter"
                    >
                        <article className="w-full px-2 py-4 text-black bg-white shadow-2xl rounded-2xl">
                            <div
                                className={cn(
                                    (availedCoupon?._id || billData?.couponId) === coupon?._id
                                        ? "bg-[#00C37E]"
                                        : "bg-[#9268EC]",
                                    "h-4 -mx-2 -my-4 overflow-hidden rounded-t-2xl mb-2",
                                )}
                            />
                            <article className="flex items-center justify-between">
                                <h1 className="p-1 mt-1 text-sm font-bold leading-none">
                                    {coupon?.name}
                                    <AvailableDays coupon={coupon} />
                                </h1>
                                {(availedCoupon?._id || billData?.couponId) === coupon?._id ? (
                                    <button
                                        type="button"
                                        className="text-[#f13f8a] text-sm mt-1 font-bold"
                                        onClick={removeCoupon}
                                    >
                                        Remove
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => applyCoupon(coupon)}
                                        className={cn(
                                            "on_active_bounce text-[#9268EC] text-sm mt-1 font-bold",
                                        )}
                                    >
                                        APPLY
                                    </button>
                                )}
                            </article>
                            <div className="relative z-10 gap-2 px-1 mt-2">
                                <div className="flex flex-col items-start space-y-1">
                                    <p className="text-xs font-semibold text-[#00C37E]">
                                        Get{" "}
                                        {formatDiscount(
                                            coupon?.config?.value,
                                            coupon?.config?.discountType,
                                        )}{" "}
                                        off on this bill
                                    </p>
                                </div>
                                <hr
                                    className="w-full col-span-2 my-3 -mx-2"
                                    style={{
                                        backgroundImage: `url(\"data:image/svg+xml,%3csvg width='100%25' height='1' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
                                            "#000000",
                                        )}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='10' stroke-linecap='square'/%3e%3c/svg%3e\")`,
                                        backgroundRepeat: "no-repeat",
                                        backgroundPosition: "center",
                                        height: "3px",
                                        border: "none",
                                    }}
                                />
                                <div className="flex flex-col items-start space-y-1">
                                    <h3 className="text-xs text-[#858585]">
                                        Use this coupon & get{" "}
                                        {formatDiscount(
                                            coupon?.config?.value,
                                            coupon?.config?.discountType,
                                        )}{" "}
                                        off on bill above ₹ {coupon?.conditions?.billValue}.
                                        Maximum discount: {coupon?.config?.upto}
                                    </h3>
                                </div>
                            </div>
                        </article>
                    </section>
                ))
            ) : (
                <center className="mt-6 text-xs text-black">
                    No Eligible Couponz
                </center>
            )}
            {missingOut?.length > 0 && (
                <>
                    <h1 className="mx-4 mt-8 text-xs font-bold text-black">
                        Coupons you are missing out
                    </h1>
                    {missingOut.map((coupon) => (
                        <section
                            key={coupon?._id}
                            className="flex mx-4 my-4 rounded-2xl inter"
                        >
                            <article className="w-full px-2 py-4 text-black bg-white shadow-2xl rounded-2xl">
                                <div className="h-4 bg-[#858585] -mx-2 -my-4 overflow-hidden rounded-t-2xl mb-2" />
                                <article className="flex items-center justify-between">
                                    <h1 className="text-[#858585] p-1 mt-1 text-sm font-bold leading-none">
                                        {coupon?.name}
                                        <AvailableDays coupon={coupon} />
                                    </h1>
                                    <button
                                        type="button"
                                        className="text-[#858585] mt-1 text-sm font-bold"
                                        disabled
                                    >
                                        APPLY
                                    </button>
                                </article>
                                <div className="relative z-10 gap-2 px-1 mt-2">
                                    <div className="flex flex-col items-start space-y-1">
                                        <p className="text-xs font-semibold text-[#f13f8a]">
                                            Add ₹ {coupon?.conditions?.billValue - billValue} more
                                            to get{" "}
                                            {formatDiscount(
                                                coupon?.config?.value,
                                                coupon?.config?.discountType,
                                            )}{" "}
                                            off on this bill
                                        </p>
                                    </div>
                                    <hr
                                        className="w-full col-span-2 my-3 -mx-2"
                                        style={{
                                            backgroundImage: `url(\"data:image/svg+xml,%3csvg width='100%25' height='1' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
                                                "#000000",
                                            )}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='10' stroke-linecap='square'/%3e%3c/svg%3e\")`,
                                            backgroundRepeat: "no-repeat",
                                            backgroundPosition: "center",
                                            height: "3px",
                                            border: "none",
                                        }}
                                    />
                                    <div className="flex flex-col items-start space-y-1">
                                        <h3 className="text-xs text-[#858585]">
                                            Use this coupon & get{" "}
                                            {formatDiscount(
                                                coupon?.config?.value,
                                                coupon?.config?.discountType,
                                            )}{" "}
                                            off on bill above ₹ {coupon?.conditions?.billValue}.
                                            Maximum discount: {coupon?.config?.upto}
                                        </h3>
                                    </div>
                                </div>
                            </article>
                        </section>
                    ))}
                </>
            )}
            {upcomingCouponz?.length > 0 && (
                <>
                    <h1 className="mx-4 mt-8 text-xs font-bold text-black">
                        Upcoming Couponz
                    </h1>
                    {upcomingCouponz?.map((coupon) => (
                        <section
                            key={coupon?._id}
                            className="flex mx-4 my-4 rounded-2xl inter"
                        >
                            <article className="w-full px-2 py-4 text-black bg-white shadow-2xl rounded-2xl">
                                <div className="h-4 bg-[#858585] -mx-2 -my-4 overflow-hidden rounded-t-2xl mb-2" />
                                <article className="flex items-center justify-between">
                                    <h1 className="text-[#858585] p-1 mt-1 text-sm font-bold leading-none">
                                        {coupon?.name}
                                        <AvailableDays coupon={coupon} />
                                    </h1>
                                    <button
                                        type="button"
                                        className="text-[#858585] mt-1 text-xs font-bold"
                                        disabled
                                    >
                                        Available From{" "}
                                        {formatDate(coupon?.conditions?.couponStartDate)}
                                    </button>
                                </article>
                                <div className="relative z-10 gap-2 px-1 mt-2">
                                    <hr
                                        className="w-full col-span-2 my-3 -mx-2"
                                        style={{
                                            backgroundImage: `url(\"data:image/svg+xml,%3csvg width='100%25' height='1' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
                                                "#000000",
                                            )}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='10' stroke-linecap='square'/%3e%3c/svg%3e\")`,
                                            backgroundRepeat: "no-repeat",
                                            backgroundPosition: "center",
                                            height: "3px",
                                            border: "none",
                                        }}
                                    />
                                    <div className="flex flex-col items-start space-y-1">
                                        <h3 className="text-xs text-[#858585]">
                                            Use this coupon & get{" "}
                                            {formatDiscount(
                                                coupon?.config?.value,
                                                coupon?.config?.discountType,
                                            )}{" "}
                                            off on bill above ₹ {coupon?.conditions?.billValue}.
                                            Maximum discount: {coupon?.config?.upto}
                                        </h3>
                                    </div>
                                </div>
                            </article>
                        </section>
                    ))}
                </>
            )}
        </section>
    );
};

const ApplyCouponzComponent = memo(MemoApplyCouponz)
export default ApplyCouponzComponent