import Background from "@/components/atom/feildBackground";
import useCouponsStore from "@/components/store/useCouponsStore";
import { memo } from "react";
import toast from "react-hot-toast";

const MemoInfoBottomSection = () => {
  const {
    couponName,
    couponType,
    couponDiscount,
    couponPrice,
    customDays,
    startTime,
    endTime,
    couponEndDate,
    expiryClaimLimitValue,
    couponForEveryOne,
    links,
    isPublish,
    couponImage
  } = useCouponsStore((s) => ({
    couponName: s.couponName,
    couponType: s.couponType,
    couponDiscount: s.couponDiscount,
    couponPrice: s.couponPrice,
    customDays: s.customDays,
    startTime: s.startTime,
    endTime: s.endTime,
    couponEndDate: s.couponEndDate,
    expiryClaimLimitValue: s.expiryClaimLimitValue,
    couponForEveryOne: s.couponForEveryOne,
    setSelectedPage: s.setSelectedPage,
    selectedPage: s.selectedPage,
    isActive: s.isActive,
    links: s.links,
    isPublish: s.isPublish,
    couponImage: s.couponImage,
  }));

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link).then(
      () => {
        toast.success("Link copied to clipboard");
      },
      (err) => {
        toast.error("Failed to copy the link");
        console.error("Failed to copy the link: ", err);
      },
    );
  };
  return (
    <section className="grid lg:gap-4 gap-4 lg:flex-2 md:grid-cols-2 grid-col-1 !mx-6 !lg:mx-0">
      <section>
        <h2 className="mb-2 font-bold opacity-60">Coupon Name</h2>
        <Background className="!my-0">
          <button
            type="button"
            className="w-full px-4 py-2 text-left border border-black opacity-50 rounded-2xl"
          >
            {couponName}
          </button>
        </Background>
      </section>
      <section>
        <h2 className="mb-2 font-bold opacity-60">Offer type</h2>
        <Background className="!my-0">
          <button
            type="button"
            className="w-full px-4 py-2 text-left border border-black opacity-50 rounded-2xl"
          >
            {couponType}
          </button>
        </Background>
      </section>
      <Background className="!my-0">
        <section className="flex justify-between">
          <h2>Whats the offer ?</h2>
          <h3>1/4</h3>
        </section>
        <button
          type="button"
          className="bg-[#E3DCFF] mt-2 px-4 py-1 rounded-full"
        >
          {" "}
          {couponType === "PERCENTAGE" && couponDiscount
            ? `${couponDiscount}% off`
            : `₹${couponPrice || "0"} off`}
        </button>
      </Background>{" "}
      <Background className="!my-0">
        <section className="flex justify-between">
          <h2>Valid on Days</h2>
          <h3>2/4</h3>
        </section>
        <section className="flex items-center space-x-4">
          <input
            type="radio"
            checked
            className="radio !radio-[#8c63ff] !bg-[#8c63ff] w-5 h-5 mt-2"
          />
          <h3 className="mt-2">Days</h3>
          <button
            type="button"
            className="relative bg-[#E3DCFF] mt-2 px-4 py-1 rounded-full"
          >
            {customDays && customDays.length > 0 && (
              <h3>{customDays.map((day) => day.slice(0, 2)).join(", ")}</h3>
            )}

            {customDays.length === 0 && (
              <h3 className="text-sm">All the time</h3>
            )}
          </button>
        </section>
        {endTime ? (
          <section className="flex items-center space-x-4">
            <input
              type="radio"
              checked
              className="radio !radio-[#8c63ff] !bg-[#8c63ff] w-5 h-5 mt-2"
            />
            <h3 className="mt-2">Time</h3>
            <button
              type="button"
              className="relative bg-[#E3DCFF] mt-2 px-4 py-1 rounded-full"
            >
              <h3>
                {startTime?.toString()?.split(".").join(":")}
                {startTime?.toString().length === 1 ? ":00" : ""} -{" "}
                {endTime?.toString()?.split(".").join(":")}
                {endTime?.toString().length === 1 ? ":00" : ""}
              </h3>
            </button>
          </section>
        ) : null}
      </Background>
      <Background className="!my-0">
        <section className="flex justify-between">
          <h2>When does it expire</h2>
          <h3>3/4</h3>
        </section>
        <section className="flex items-center space-x-4">
          <input
            type="radio"
            checked
            className="radio !radio-[#8c63ff] !bg-[#8c63ff] w-5 h-5 mt-2"
          />
          <h3 className="mt-2">custom</h3>
          <button
            type="button"
            className="relative bg-[#E3DCFF] mt-2 px-4 py-1 rounded-full"
          >
            {couponEndDate
              ? `Expires in ${Math.ceil(
                  (couponEndDate - Date.now()) / (1000 * 60 * 60 * 24),
                )} days`
              : "No expiry"}
          </button>
        </section>
        <section className="flex items-center mt-2 space-x-4">
          <input
            type="radio"
            checked
            className="radio !radio-[#8c63ff] !bg-[#8c63ff] w-5 h-5 mt-2"
          />
          <h3 className="mt-2">Limited Couponz</h3>
          <button
            type="button"
            className="relative bg-[#E3DCFF] mt-2 px-4 py-1 rounded-full"
          >
            {expiryClaimLimitValue
              ? `${expiryClaimLimitValue} uses`
              : "No Limit"}
          </button>
        </section>
      </Background>
      <Background className="!my-0">
        <section className="flex justify-between">
          <h2>Who can claim this</h2>
          <h3>4/4</h3>
        </section>
        <section className="flex items-center space-x-4">
          <input
            type="radio"
            checked
            className="radio !radio-[#8c63ff] !bg-[#8c63ff] w-5 h-5 mt-2"
          />
          <button
            type="button"
            className="relative bg-[#E3DCFF] mt-2 px-4 py-1 rounded-full"
          >
            {couponForEveryOne ? "Everyone can grab" : "Assign to selected"}
          </button>
        </section>
      </Background>
      {isPublish && links && links?.length > 0 && (
        <section>
          <h2 className="mt-4 mb-2 font-bold opacity-60">Links</h2>
          <Background className="!my-0">
            <ul className="pl-4 list-disc">
              {links?.map((link, index) => (
                <li
                  key={index}
                  className="mb-2 text-blue-500 underline cursor-pointer"
                  onClick={() => copyToClipboard(link?.link)}
                >
                  {link?.channelId?.name || "Link"}
                </li>
              ))}
            </ul>
          </Background>
        </section>
      )}
    </section>
  );
};

const InfoBottomSection = memo(MemoInfoBottomSection);
export default InfoBottomSection;
