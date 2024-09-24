import { memo } from "react";
import Normal from "@/assets/coupon/normal.png";
import Advanced from "@/assets/coupon/advanced.png";
import type { CouponFlow } from "@/components/store/useCouponsStore";
import useCouponsStore from "@/components/store/useCouponsStore";
import { cn } from "@hi/common";

const menuArray = [
  {
    id: 1,
    title: "Create a Simple Couponz",
    subTitle: "Couponz with fix discount easy options",
    navigate: "DETAILS" as CouponFlow,
    image: Normal,
    disable: false,
  },
  {
    id: 2,
    title: "Advanced Couponz",
    subTitle:
      "Spice it up with different more and advanced options while creating a coupon",
    navigate: "DETAILS" as CouponFlow,
    image: Advanced,
    disable: true,
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
              className={cn(
                "w-[92%] md:w-[45%] lg:w-[35%] m-4 bg-white shadow-md rounded-lg text-left",
                {
                  "opacity-50 cursor-not-allowed": menu.disable,
                  "cursor-pointer": !menu.disable,
                },
              )}
              onClick={() => !menu.disable && setSelectedPage(menu.navigate)}
              disabled={menu.disable}
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
                  className={cn(
                    "px-4 py-2 mt-2 text-white bg-black rounded-lg",
                    {
                      "opacity-50 cursor-not-allowed": menu.disable,
                    },
                  )}
                  disabled={menu.disable}
                >
                  {menu.disable ? "Coming soon" : `Go to ${menu.title}`}
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
