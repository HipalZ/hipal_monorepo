import type { IExistingPayments } from "@/components/types/businessData";
import { timestampToDateTime } from "@/components/utils/helper";
import { memo } from "react";
import { MdOutlineCall } from "react-icons/md";

interface PaymentModalProps {
  salesData: IExistingPayments | undefined;
}
const PaymentModal = (props: PaymentModalProps) => {
  const { salesData } = props;
  const hideMiddleNumbers = (phone: string) => {
    if (phone.length <= 4) return phone;
    const firstPart = phone.slice(0, 3);
    const lastPart = phone.slice(-3);
    return `${firstPart}****${lastPart}`;
  };

  return (
    <section className="relative">
      <button
        type="button"
        className="absolute top-0 text-[#334C38] left-1/2 px-4 py-1 rounded-full transform -translate-x-1/2 -translate-y-1/2 bg-[#EDFBE7]"
      >
        {salesData?.mode}
      </button>
      <section style={{ maxHeight: "90%", overflowY: "auto" }}>
        <div className="flex justify-between mx-6 mt-10">
          <h1 className="text-base text-gray-500">
            {timestampToDateTime(salesData?.date || 0)}
          </h1>
          <p>order id : {salesData?._id.slice(-5)}</p>
        </div>
        &nbsp;
        <div className="grid grid-cols-2 mx-6 mb-2">
          <h1>Paid Amount</h1>
          <p>: ₹ {salesData?.order_id?.total}</p>
        </div>
        <div className="grid grid-cols-2 mx-6 mb-2">
          <h1>Bil value entered</h1>
          <p>: ₹ {salesData?.order_id?.billValue}</p>
        </div>
        <div className="grid grid-cols-2 mx-6 mb-2">
          <h1>Including tips</h1>
          <p>: ₹ {salesData?.order_id?.tips}</p>
        </div>
        <div className="grid grid-cols-2 mx-6 mb-2">
          <h1>Discount</h1>
          <p>: {salesData?.order_id?.claimedCoins} Coin used</p>
        </div>
        <hr className="m-6 h-[0.1rem] bg-[#CACACA] text-black" />
        <div className="grid grid-cols-2 mx-6 mb-2">
          <h1>User</h1>
          <p>: {salesData?.order_id?.name}</p>
        </div>
        <div className="grid grid-cols-2 mx-6 mb-2">
          <h1>Table</h1>
          <p>: {salesData?.order_id?.tableName}</p>
        </div>
        <div className="grid grid-cols-2 mx-6 mb-2">
          <h1>Number</h1>
          <div className="flex">
            <span>
              :{" "}
              {salesData?.order_id?.phone
                ? hideMiddleNumbers(salesData.order_id.phone)
                : ""}
            </span>
            &nbsp;&nbsp;
            <a
              href={`tel:+91${salesData?.order_id?.phone}`}
              className="flex items-center rounded-full bg-[#f3eeff] px-2 py-1 text-[#6f2eff]"
            >
              <MdOutlineCall size={16} />
              <span className="text-sm">Call</span>
            </a>
          </div>
        </div>
        <h1 className="mx-6 font-semibold">Used reason</h1>
        <div className="flex flex-col p-4 m-6 bg-gray-300 rounded-2xl">
          <h1 id="discount-reason">
            User {salesData?.order_id?.name} has paid ₹{" "}
            {salesData?.order_id?.total} discount applied ₹{" "}
            {salesData?.order_id?.claimedCoins} transaction id {salesData?._id}
          </h1>
          <br />
        </div>
        {salesData?.comment && salesData?.comment.length > 0 ? (
          <>
            <h1 className="mx-6 font-semibold">Added Comment</h1>
            <div className="flex flex-col p-4 m-6 bg-gray-300 rounded-2xl">
              <p>{salesData?.comment}</p>
              <br />
            </div>
          </>
        ) : null}
      </section>
    </section>
  );
};
const MemoizedPaymentModal = memo(PaymentModal);
export default MemoizedPaymentModal;
