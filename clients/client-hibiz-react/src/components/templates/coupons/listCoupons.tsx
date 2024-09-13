import CouponImages from "@/assets/coupon/coupon card.png";
import { memo } from "react";

const MemoListCoupons = () => {
  return (
    <div className="relative w-full max-w-[30rem] mx-auto">
      <article className="w-[92%] mx-4 mt-6 rounded-t-2xl bg-[#6A32DF30] flex h-16 overflow-hidden shadow-light">
        <figure>
          <img src={CouponImages} alt="Stairs" className="w-[5rem] mt-2 ml-2" />
        </figure>
        <section className="flex flex-col justify-center flex-1 ml-4">
          <h3 className="text-lg font-semibold text-black">Birthday Coupon</h3>
          <p className="text-sm text-black">Expires in 3 days</p>
        </section>
      </article>
      <article className=" w-[92%] mx-4 p-4 flex items-center justify-between bg-white rounded-b-2xl shadow-dark">
        <small>25% Fixed Discount</small>
        <small>31 users</small>
        <small>No expiry</small>
      </article>
      <button
        type="button"
        className="px-4 bg-[#24C163] text-white text-xs py-1 rounded-2xl absolute -top-3 right-8"
      >
        ACTIVE
      </button>
    </div>
  );
};

const ListCoupons = memo(MemoListCoupons);
export default ListCoupons;
