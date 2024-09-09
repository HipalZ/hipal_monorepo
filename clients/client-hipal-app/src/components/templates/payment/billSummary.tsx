import { memo } from "react";
import { BsPatchPlusFill } from "react-icons/bs";
import { CiCirclePlus } from "react-icons/ci";
import { RiEdit2Fill } from "react-icons/ri";

interface IBillSummary {
  billValue: number;
  claimedCoinz: number;
  tips: number;
  isTipActive: boolean;
  setIsTipActive: (value: boolean) => void;
  clearTheTip: () => void;
  handleTipSelect: (tip: string) => void;
  selectedTip: string;
  customTip: string;
  showInput: boolean;
  handleCustomTip: (e: any) => void;
  handleSaveTip: () => void;
}

const BillSummary = (props: IBillSummary) => {
  const {
    billValue,
    claimedCoinz,
    tips,
    isTipActive,
    setIsTipActive,
    clearTheTip,
    handleTipSelect,
    selectedTip,
    customTip,
    showInput,
    handleCustomTip,
    handleSaveTip,
  } = props;
  return (
    <div className="flex flex-col pb-20 space-y-2 text-4xl transition-all rounded-t-3xl text-[#101018] poppins-regular mt-4">
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
        <hr className="mx-4 border border-dashed border-[#10101875] border-0.5" />
        {claimedCoinz > 0 && (
          <div className="flex justify-between mx-4 mt-1 text-sm capitalize text-[#101018] ">
            <h1 className="text-[1rem]">Hi-Coinz</h1>
            <div className="flex">
              <span className="text-base">₹ {claimedCoinz || 0}</span>
            </div>
          </div>
        )}
        <div className="mx-2 mt-2">
          <article className="flex items-center justify-between mx-2 text-xs">
            <h1>
              200 off <br />
              with coinz or couponz
            </h1>
            <article className="self-end text-[#4CAF50] flex justify-between gap-2">
              <h1>₹ 200 </h1>
              <span>
                <RiEdit2Fill color="black" />
              </span>
            </article>
          </article>
          <div className="flex justify-between m-2 text-sm capitalize text-[#101018]">
            <div className="flex items-center">
              <div
                className="flex items-center"
                onClick={() => setIsTipActive(true)}
              >
                <span>
                  <CiCirclePlus size={16} />
                </span>
                <h1 className="ml-1 text-xs">Add Tip</h1>
              </div>
              {isTipActive ? (
                <span onClick={clearTheTip} className="underline">
                  (Clear Tip)
                </span>
              ) : null}
            </div>
            <div className="flex">
              <span className="text-xs">₹ {tips || 0}</span>
            </div>
          </div>
          <hr className="mx-2 border border-dashed border-[#10101875] border-0.5" />
          {isTipActive ? (
            <div className="flex mx-2 space-x-2">
              {["100", "200", "500", "Other"].map((tip, index) => (
                <button
                  type="button"
                  key={index?.toString()}
                  onClick={() => handleTipSelect(tip)}
                  className={`px-4 py-1 rounded-lg text-xs ${
                    selectedTip === tip
                      ? "bg-primary text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {tip}
                </button>
              ))}
            </div>
          ) : null}
          {selectedTip === "Other" && showInput && (
            <div className="flex mt-4 space-x-6">
              <input
                type="text"
                onChange={handleCustomTip}
                value={customTip}
                maxLength={5}
                placeholder="Enter tip amount"
                className="w-[70%] border border-[#000] pl-4 font-semibold text-[1rem] rounded-[1rem]"
              />
              <button
                type="button"
                onClick={handleSaveTip}
                className="px-4 py-2 text-base text-white rounded-lg bg-primary"
              >
                Save
              </button>
            </div>
          )}
          <div className="flex justify-between mx-2 mt-4">
            <h1 className="text-sm font-bold">
              To Pay <span className="text-xs">(rounded off)</span>
            </h1>
            <span className="text-base font-bold">
              {" "}
              ₹ {billValue - claimedCoinz + tips}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MemoBillSummary = memo(BillSummary);
export default MemoBillSummary;
