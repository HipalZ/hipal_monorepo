import { memo } from "react";
import { BsGraphUpArrow } from "react-icons/bs";
import { PiFireFill } from "react-icons/pi";
import Background from "@/components/atom/feildBackground";
import type { IAnalytics } from "@/hooks/useCoupon";

const MemoBottomSection = ({ analytics }: { analytics?: IAnalytics }) => {
  if (!analytics) {
    return (
      <section>
        <p>No analytics data available.</p>
      </section>
    );
  }
  return (
    <section className="flex-1 mx-6 lg:mx-0">
      <section className="w-full">
        <h3 className="font-semibold opacity-50 lg:ml-0">Summary</h3>
        <Background className="flex items-center gap-4">
          <div className="bg-[#16DBCC20] rounded-xl p-3 w-[3rem] h-[3rem]">
            <BsGraphUpArrow className="text-[#16DBCC]" size={24} />
          </div>
          <div>
            <h3 className="opacity-50">Total sales contribution</h3>
            <p className="text-black ">₹ {analytics?.totalSales}</p>
          </div>
        </Background>
        <Background className="flex items-center gap-4">
          <div className="bg-[#FF82AC20] rounded-xl p-3 w-[3rem] h-[3rem]">
            <PiFireFill className="text-[#FF82AC]" size={24} />
          </div>
          <div>
            <h3 className="opacity-50">Total discount</h3>
            <p className="text-black ">₹ {analytics?.totalDiscount}</p>
          </div>
        </Background>
      </section>
      <section className="flex flex-wrap gap-2">
        {Object.keys(analytics)
          .slice(5)
          .map((key, index) => {
            return (
              <center
                key={index}
                className="w-[48%] lg:w-[49%] rounded-2xl bg-[#FFFFFF] px-2 py-6 capitalize text-[#6F649B]" // Setting width to achieve 2 columns
              >
                <h3 className="text-sm">{key?.split(/(?=[A-Z])/).join(" ")}</h3>
                <p className="mt-2 text-xl font-semibold text-black">
                  {analytics?.[key]}
                </p>
              </center>
            );
          })}
      </section>
    </section>
  );
};

const BottomSection = memo(MemoBottomSection);

export default BottomSection;
