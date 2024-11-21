import { memo, useCallback } from "react";
import Simple from "@/assets/coupon/simple.png";
import Special from "@/assets/coupon/special.png";
import Grab from "@/assets/coupon/grab.png";
import useCouponsStore, {
  type CouponFlowType,
} from "@/components/store/useCouponsStore";

const menuArray = [
  {
    id: 1,
    title: "Create Assign Couponz ",
    subTitle:
      "These are simple couponz that can be assigned to special guest , friends and family or staff",
    image: Grab,
    flow: "ASSIGN" as CouponFlowType,
  },
  {
    id: 2,
    title: "Create grab Couponz",
    subTitle:
      "Open couponz with links and Qrs for you to boost your marketing and attract customers ",
    image: Simple,
    flow: "GRAB" as CouponFlowType,
  },
  {
    id: 3,
    title: "You are special couponz",
    subTitle:
      "Give to your customers in place of refund or make unsatisfied customers visit you again",
    image: Special,
    flow: "SPECIAL" as CouponFlowType,
  },
];

const MemoCreateCouponPage = () => {
  const { setSelectedPage, setSelectFlow, resetCouponState } = useCouponsStore(
    (s) => ({
      setSelectedPage: s.setSelectedPage,
      setSelectFlow: s.setSelectFlow,
      resetCouponState: s.resetCouponState,
    }),
  );

  const handleSelect = useCallback((flow: CouponFlowType) => {
    setSelectedPage("DETAILS");
    resetCouponState();
    setSelectFlow(flow);
  }, []);

  return (
    <section>
      <div className="flex flex-wrap gap-2 mx-4 mt-4 lg:mx-0">
        {menuArray.slice(0, 2).map((menu) => {
          return (
            <button
              type="button"
              key={menu.id}
              onClick={() => handleSelect(menu.flow)}
              className="w-[100%] md:w-[40%] lg:w-[32%] bg-white shadow-md rounded-lg text-left"
            >
              <img
                src={menu.image}
                alt={menu.title}
                className="w-full h-[140px] object-cover object-left-top rounded-t-lg"
              />
              <div className="p-4 w-[95%]">
                <h2 className="text-xl font-bold">{menu.title}</h2>
                <p className="text-sm text-gray-500">{menu.subTitle}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
const CreateCouponPage = memo(MemoCreateCouponPage);
export default CreateCouponPage;
