import { memo } from "react";
import Normal from "@/assets/coupon/normal.png";
import Advanced from "@/assets/coupon/advanced.png";
import type { CouponFlow } from "@/components/store/useCouponsStore";
import useCouponsStore from "@/components/store/useCouponsStore";

const menuArray = [
  {
    id: 1,
    title: "Create a Simple Couponz",
    subTitle: "Couponz with fix discount easy options",
    navigate: "DETAILS" as CouponFlow,
    image: Normal,
  },
  {
    id: 2,
    title: "Advanced Couponz",
    subTitle:
      "Spice it up with different more and advanced options while creating a coupon",
    navigate: "DETAILS" as CouponFlow,
    image: Advanced,
  },
];

const MemoCreateCoupon = () => {
  const { setSelectedPage } = useCouponsStore((s) => ({
    setSelectedPage: s.setSelectedPage,
  }));

  return (
    <section>
      <div className="flex flex-wrap">
        {menuArray.map((menu) => {
          return (
            <button
              type="button"
              key={menu.id}
              className="w-[90%] md:w-[45%] lg:w-[35%] m-4 bg-white shadow-md rounded-lg text-left"
              onClick={() => setSelectedPage(menu.navigate)}
            >
              <img
                src={menu.image}
                alt={menu.title}
                className="w-full h-[130px] rounded-t-lg"
              />
              <div className="p-4">
                <h2 className="text-xl font-bold">{menu.title}</h2>
                <p className="text-sm text-gray-500">{menu.subTitle}</p>
                <button
                  type="button"
                  className="px-4 py-2 mt-2 text-white bg-black rounded-lg"
                >
                  Go to {menu.title}
                </button>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
const CreateCoupon = memo(MemoCreateCoupon);
export default CreateCoupon;
