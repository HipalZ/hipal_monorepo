import Online from "@/assets/online.png";
import type {  IExistingPayments } from "@/components/types/businessData";
import { cn, hideMiddleNumbers } from "@/components/utils/helper";
import { memo } from "react";

interface SalesCardsProps {
    data: IExistingPayments
    openModel: (data: IExistingPayments) => void
}

const MemoSalesCards: React.FC<SalesCardsProps> = ({ data, openModel }) => {
  return (
    <section
    key={data?._id}
    className="payment_card_ui w-[100%]"
    onClick={() => openModel(data)}
    onKeyDown={() => openModel(data)}
  >
    <section className="flex justify-between">
      <section>
        <figure className="flex items-center space-x-2">
          <img src={Online} alt="online" />
          <figcaption className="font-semibold opacity-50">
            <h6>order id : {data?._id?.slice(-6)}</h6>
          </figcaption>
        </figure>
      </section>
      <section>
        <h3 className="text-2xl text-[#23B371]">
          ₹ {data?.order_id?.total}
        </h3>
      </section>
    </section>
    <section className="py-4">
      <section className="flex items-center justify-between">
        <b>{data?.userId?.name || "Customer"}</b>{" "}
        <h3 className="opacity-50">
          {hideMiddleNumbers(data?.userId?.phone || "")}
        </h3>
      </section>
      <b className="flex items-center justify-between">
        <h3>₹ {data?.order_id?.billValue}</h3>
        <h3 className="text-sm">{data?.settleType}</h3>
      </b>
    </section>
    <section className="flex gap-4">
      <button
        type="button"
        className={cn(
          "flex items-center justify-center space-x-2 rounded-2xl px-2 py-1",
          data?.mode === "online"
            ? "bg-green-200 text-green-700"
            : "bg-orange-200 text-orange-500",
        )}
      >
        <small>{data?.mode} Payment</small>
      </button>
      <button
        type="button"
        className="flex items-center justify-center space-x-2 rounded-2xl bg-[#e7fedc] px-2 py-1 text-[#23B371]"
      >
        <small>
          {data?.order_id?.claimedCoins} Coinz used
        </small>
      </button>
    </section>
  </section>
  )
}

const SalesCards = memo(MemoSalesCards)
export default SalesCards
