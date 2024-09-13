import CouponImages from "@/assets/coupon/coupon card.png";
import { useGetAllCoupons } from "@/hooks/useCoupon";
import { memo } from "react";

const MemoListCoupons = () => {
  const { coupons, isLoading } = useGetAllCoupons();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col flex-wrap gap-6 mx-4 mt-6 md:flex-wrap md:flex-row pb-[5rem]">
      {coupons?.length ? (
        coupons.map((coupon: any) => (
          <div
            key={coupon._id}
            className="relative w-full md:w-full lg:max-w-[19.5rem]"
          >
            <article
              className=" rounded-t-2xl bg-[#6A32DF30] flex h-16 overflow-hidden shadow-light"
              style={{ backgroundColor: coupon.bgColour || "#6A32DF30" }}
            >
              <figure>
                <img
                  src={coupon.image || CouponImages}
                  alt={coupon.name}
                  className="w-[5rem] mt-2 ml-2 rounded-xl"
                />
              </figure>
              <section className="flex flex-col justify-center flex-1 ml-4">
                <h3 className="text-lg font-semibold text-black">
                  {coupon.name}
                </h3>
                <p className="text-sm text-black">
                  {coupon.conditions?.couponEndDate
                    ? `Expires in ${Math.ceil(
                        (coupon.conditions.couponEndDate - Date.now()) /
                          (1000 * 60 * 60 * 24),
                      )} days`
                    : "No expiry"}
                </p>
              </section>
            </article>
            <article className="flex items-center justify-between p-4 bg-white rounded-b-2xl shadow-dark">
              <small>
                {coupon.config.discountType === "PERCENTAGE"
                  ? `${coupon.config.value}% Discount`
                  : `₹ ${coupon.config.value} Fixed Discount`}
              </small>
              <small>
                {coupon.conditions?.expiryClaimLimit?.overAllLimit
                  ? "Limited expiry"
                  : "No expiry"}
              </small>
            </article>
            <button
              type="button"
              className={`px-4 py-1 rounded-2xl absolute -top-3 right-4 text-xs ${
                coupon.isActive
                  ? "bg-[#24C163] text-white"
                  : "bg-gray-400 text-black"
              }`}
            >
              {coupon.isActive ? "ACTIVE" : "INACTIVE"}
            </button>
          </div>
        ))
      ) : (
        <p>No coupons available</p>
      )}
    </div>
  );
};

const ListCoupons = memo(MemoListCoupons);
export default ListCoupons;
