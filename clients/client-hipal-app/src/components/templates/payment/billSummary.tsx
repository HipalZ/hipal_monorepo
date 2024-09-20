import useCouponTemp from "@/components/store/useCouponTemp";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { memo } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { RiEdit2Fill } from "react-icons/ri";

interface IBillSummary {
  clearTheTip: () => void;
  handleTipSelect: (tip: string) => void;
  handleCustomTip: (e: any) => void;
  handleSaveTip: () => void;
}

const BillSummary = (props: IBillSummary) => {
  const { setApplyCouponz } = useCouponTemp((s) => ({
    setApplyCouponz: s.setApplyCouponz,
  }));
  const {
    isTipActive,
    setIsTipActive,
    showInput,
    selectedTip,
    customTip,
    billValue,
    claimCouponz,
    claimedCoinz,
    tips,
  } = usePaymentStore((s) => ({
    billValue: s.billValue,
    claimCouponz: s.claimCouponz,
    claimedCoinz: s.claimedCoinz,
    tips: s.tips,
    isTipActive: s.isTipActive,
    setIsTipActive: s.setIsTipActive,
    showInput: s.showInput,
    selectedTip: s.selectedTip,
    customTip: s.customTip,
  }));

  const { clearTheTip, handleTipSelect, handleCustomTip, handleSaveTip } =
    props;
  return (
    <div className="flex flex-col pb-36 space-y-2 text-4xl transition-all rounded-t-3xl text-[#101018] poppins-regular mt-4">
      <h6 className="mx-4 mt-4 mb-2 text-xl">Bill Detailz</h6>
      <div
        style={{
          boxShadow: "0px 8px 18px 0px #00000024",
        }}
        className="relative mx-4 mt-4 text-[1.25rem] text-[#101018] py-4 rounded-2xl border"
      >
        <div className="text-base flex justify-between mx-4 mb-4 capitalize text-[#101018] leading-[1.25rem]">
          <h1 className="text-sm">Total bill amount</h1>
          <h1>₹ {billValue}</h1>
        </div>
        <hr
          className="mx-2 bg-white"
          style={{
            backgroundImage: `url(\"data:image/svg+xml,%3csvg width='100%25' height='10' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
              "#10101875",
            )}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            height: "1px",
            border: "none",
          }}
        />
        <div className="mx-2 mt-2">
          {claimCouponz > 0 || claimedCoinz > 0 ? (
            <article className="flex items-center justify-between mx-2 text-xs">
              <h1 className="text-[#4CAF50]">
                {claimedCoinz > 0 ? (
                  <>Hi-Coinz applied</>
                ) : (
                  <>Couponz applied</>
                )}
              </h1>
              <article className="self-end text-[#4CAF50] flex justify-between items-center gap-2 text-sm">
                <h1>₹ {claimedCoinz || claimCouponz} </h1>
                <span onClick={() => setApplyCouponz(true)}>
                  <RiEdit2Fill color="black" />
                </span>
              </article>
            </article>
          ) : null}
          <div className="flex justify-between m-2 text-sm capitalize text-[#101018]">
            <div className="flex items-center">
              <div
                className="flex items-center text-red-500"
                onClick={() => setIsTipActive(true)}
              >
                <span>
                  <CiCirclePlus size={20} />
                </span>
                <h1 className="ml-1 text-xs">Add Tip </h1>
              </div>
              {isTipActive ? (
                <span
                  onClick={clearTheTip}
                  className="mx-2 text-xs underline underline-offset-2"
                >
                  Clear Tip
                </span>
              ) : null}
            </div>
            <div className="flex">
              <span className="text-sm text-black">₹ {tips || 0}</span>
            </div>
          </div>
          {isTipActive ? (
            <div className="flex mx-2 space-x-2">
              {["100", "200", "500", "Other"].map((tip, index) => (
                <button
                  type="button"
                  key={index?.toString()}
                  onClick={() => handleTipSelect(tip)}
                  className={`px-4 py-1 rounded-lg text-xs ${
                    selectedTip === tip ? "bg-black text-white" : "bg-gray-200"
                  }`}
                >
                  {tip}
                </button>
              ))}
            </div>
          ) : null}
          {selectedTip === "Other" && showInput && (
            <div className="flex mx-2 my-4 space-x-6">
              <input
                type="text"
                onChange={handleCustomTip}
                value={customTip}
                maxLength={5}
                placeholder="Enter tip amount"
                className="w-[70%] border border-[#000] pl-2 font-semibold text-[0.75rem] rounded-lg h-8"
              />
              <button
                type="button"
                onClick={handleSaveTip}
                className="h-8 px-2 text-xs text-white bg-black rounded-lg"
              >
                Save
              </button>
            </div>
          )}
          <hr
            className="mt-3 bg-white"
            style={{
              backgroundImage: `url(\"data:image/svg+xml,%3csvg width='100%25' height='10' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
                "#10101875",
              )}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              height: "1px",
              border: "none",
            }}
          />
          <div className="flex justify-between mx-2 mt-4">
            <h1 className="text-sm font-bold">
              To Pay <span className="text-xs">(rounded off)</span>
            </h1>
            <span className="text-base font-bold">
              {" "}
              ₹ {billValue - claimedCoinz - claimCouponz + tips}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MemoBillSummary = memo(BillSummary);
export default MemoBillSummary;
