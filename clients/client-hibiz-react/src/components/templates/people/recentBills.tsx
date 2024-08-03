import { cn } from "@/components/utils/helper";
import { billsCards } from "@/pages/app/business/[businessId]/people/[userId]";
import { memo } from "react";
import { LiaTagSolid } from "react-icons/lia";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import type { Payment } from "@/components/types/businessData";
import OnlineImgCard from "./onlineImgCard";

const MemoRecentBills = () => {
  const { setOpenBillPopup, setSingleBillData } = useHiPeopleStore((s) => ({
    setOpenBillPopup: s.setOpenBillPopup,
    setSingleBillData: s.setSingleBillData,
  }));

  const handleBillData = (data: Payment) => {
    setSingleBillData(data);
    setOpenBillPopup(true);
  };
  return (
    <section className="grid pb-[5rem] md:grid-cols-2 lg:grid-cols-3">
      {billsCards && billsCards.length > 0 ? (
        billsCards.map((data) => (
          <section
            key={data?._id}
            className="payment_card_ui"
            onClick={() => handleBillData(data)}
          >
            <OnlineImgCard data={data} />
            <section className="flex gap-4">
              <button
                type="button"
                className={cn(
                  "flex items-center justify-center space-x-2 rounded-2xl px-2 py-1",
                  data?.paymentMode === "online"
                    ? "bg-[#e7fedc] text-[#23B371]"
                    : "bg-orange-200 text-orange-500",
                )}
              >
                <small className="capitalize">
                  {data?.paymentMode} Payment
                </small>
              </button>
              <button
                type="button"
                className="flex items-center justify-center space-x-2 rounded-2xl bg-[#e7fedc] px-2 py-1 text-[#23B371]"
              >
                <LiaTagSolid />
                <small>{data?.order_id?.claimedCoins} Coinz used </small>
              </button>
            </section>
            <section className="flex gap-4 mt-2">
              <button
                type="button"
                className="flex items-center justify-center space-x-2 rounded-2xl bg-[#E3DCFF] px-2 py-1 text-[#6F649B] text-xs"
              >
                # Take Away
              </button>
            </section>
          </section>
        ))
      ) : (
        <div className="absolute text-2xl text-center -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
          No Data Found
        </div>
      )}
    </section>
  );
};

const RecentBills = memo(MemoRecentBills);
export default RecentBills;
