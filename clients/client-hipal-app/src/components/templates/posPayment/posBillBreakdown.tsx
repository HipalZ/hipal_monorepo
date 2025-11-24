import { useBillSummary } from "@/components/hooks/usePayments";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import useCouponTemp from "@/components/store/useCouponTemp";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { Receipt } from "lucide-react";
import { CiCirclePlus } from "react-icons/ci";
import { FaMoneyBillWave, FaTags } from "react-icons/fa";
import { RiEdit2Fill } from "react-icons/ri";

// --- helper to keep formatting consistent
const fmt = (sym: string | undefined, n: number) =>
  `${sym ?? ""}${
    Number.isFinite(n) ? Number(n).toFixed(2).replace(/\.00$/, "") : "0"
  }`;

const PosBillBreakdown = () => {
  const { billData } = usePaymentStore();
  const { setApplyCouponz } = useCouponTemp();
  const currencySymbol = useBusinessDetails(
    (s) => s.businessDetails?.currencySymbol,
  );

  const {
    isTipActive,
    showInput,
    selectedTip,
    customTip,
    billValue,
    claimCouponz,
    claimedCoins,
    tips,
    setIsTipActive,
  } = usePaymentStore();

  function getDisplayValue(
    billValue: number,
    claimedCoins: number,
    claimCouponz: number,
  ): number {
    if (claimedCoins > 0) return claimedCoins;
    if (claimCouponz > billValue) return billValue;
    return claimCouponz;
  }

  const { clearTheTip, handleTipSelect, handleCustomTip, handleSaveTip } =
    useBillSummary();

  // ---- derive values from billData (with safe defaults)
  const subTotal = Number(billData?.subTotal ?? 0);
  const serviceCharge = Number(billData?.serviceCharge ?? 0);
  const tipsValue = Number(billData?.tips ?? tips ?? 0);
  const discount = Number(billData?.discount ?? 0);
  const gstTotal = Number(billData?.gst ?? 0);
  const cgst = Number((gstTotal / 2).toFixed(2));
  const sgst = Number((gstTotal / 2).toFixed(2));
  const otherTax = Number(billData?.otherTax ?? 0);
  const coins = Number(billData?.claimedCoins ?? claimedCoins ?? 0);
  const coupon = Number(billData?.couponDiscount ?? 0);
  const grandTotal = Number(billData?.total ?? 0);

  return (
    <section className="flex flex-col pb-8 space-y-2 text-4xl transition-all rounded-t-3xl text-[#101018] poppins-regular mt-4">
      <h6 className="mx-4 mt-4 mb-2 text-xl">Bill Detailz</h6>

      <div
        style={{ boxShadow: "0px 8px 18px 0px #00000024" }}
        className="relative mx-4 mt-4 text-[1.25rem] text-[#101018] py-4 rounded-2xl border"
      >
        <div className="px-4 space-y-3">
          <BillItem
            icon={<FaMoneyBillWave />}
            label="Subtotal"
            value={fmt(currencySymbol, subTotal)}
          />
          <BillItem
            icon={<Receipt size={12} />}
            label="Service Charge"
            value={fmt(currencySymbol, serviceCharge)}
          />
          <BillItem
            icon={<Receipt size={12} />}
            label="Tips"
            value={fmt(currencySymbol, tipsValue)}
          />
          {/* Deductions */}
          <BillItem
            icon={<FaTags />}
            label="Discount"
            value={`-${fmt(currencySymbol, discount)}`}
            negative
          />
          {coins > 0 && (
            <BillItem
              icon={<FaTags />}
              label="Claimed Coins"
              value={`-${fmt(currencySymbol, coins)}`}
              negative
            />
          )}
          {coupon > 0 && (
            <BillItem
              icon={<FaTags />}
              label="Coupon Discount"
              value={`-${fmt(currencySymbol, coupon)}`}
              negative
            />
          )}
          {/* Tax breakdown */}
          <BillItem
            icon={<Receipt size={12} />}
            label="CGST"
            value={fmt(currencySymbol, cgst)}
          />
          <BillItem
            icon={<Receipt size={12} />}
            label="SGST"
            value={fmt(currencySymbol, sgst)}
          />
          {otherTax > 0 && (
            <BillItem
              icon={<Receipt size={12} />}
              label="Other Tax"
              value={fmt(currencySymbol, otherTax)}
            />
          )}
        </div>

        <hr
          className="mx-2 my-2 bg-white"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='10' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
              "#10101875",
            )}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            height: "1px",
            border: "none",
          }}
        />

        {/* Coins/Coupon banner (kept from your code) */}
        <div className="mx-2 mt-2">
          {claimCouponz > 0 || claimedCoins > 0 ? (
            // <article className="flex items-center justify-between m-2 text-xs">
            //   <h1 className="text-[#4CAF50]">
            //     {claimedCoins > 0 && !billData?.couponId ? (
            //       <>Hi-Coinz applied</>
            //     ) : (
            //       <>Couponz applied</>
            //     )}
            //   </h1>
            //   <article className="self-end text-[#4CAF50] flex justify-between items-center gap-2 text-sm">
            //     <h1>
            //       {currencySymbol}{" "}
            //       {getDisplayValue(billValue, claimedCoins, claimCouponz)}
            //     </h1>
            //     <span
            //       onClick={() => setApplyCouponz(true)}
            //       onKeyDown={() => setApplyCouponz(true)}
            //     >
            //       <RiEdit2Fill color="black" />
            //     </span>
            //   </article>
            // </article>
            <></>
          ) : null}

          {/* Tip controls (unchanged) */}
          <div className="flex justify-between px-2 text-sm capitalize text-[#101018]">
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
                  className="ml-4 text-xs underline underline-offset-2"
                >
                  Clear Tip
                </span>
              ) : null}
            </div>
            <div className="flex">
              <span className="text-sm text-black">
                {currencySymbol} {tipsValue}
              </span>
            </div>
          </div>

          {isTipActive ? (
            <div className="flex m-2 space-x-2">
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
            className="bg-white my-2"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='10' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
                "#10101875",
              )}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
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
              {currencySymbol} {grandTotal}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PosBillBreakdown;

// Highlight negative numbers in red if `negative` is true
export const BillItem = ({
  icon,
  label,
  value,
  className = "",
  negative = false,
  hideWhenZero = true,
  epsilon = 0.000001, // treat near-zero as zero
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  className?: string;
  negative?: boolean;
  hideWhenZero?: boolean;
  epsilon?: number;
}) => {
  // Convert value to a number for zero-check (handles "₹0", "0.00", "-₹0")
  const toNumber = (v: string | number) => {
    if (typeof v === "number") return Object.is(v, -0) ? 0 : v;
    const n = Number(v.toString().replace(/[^\d.-]/g, "")); // strip currency/symbols
    return Object.is(n, -0) ? 0 : n;
  };

  const num = toNumber(value);

  // Skip rendering if zero (or effectively zero)
  if (hideWhenZero && Number.isFinite(num) && Math.abs(num) < epsilon)
    return null;

  return (
    <div
      className={`poppins-regular flex items-center justify-between ${className}`}
    >
      <div className="flex items-center">
        <h3 className="mr-2 text-sm text-black">{icon}</h3>
        <h3 className="text-sm text-black">{label}</h3>
      </div>
      <h3 className={`text-sm ${negative ? "text-red-600" : "text-black"}`}>
        {value ?? 0}
      </h3>
    </div>
  );
};
