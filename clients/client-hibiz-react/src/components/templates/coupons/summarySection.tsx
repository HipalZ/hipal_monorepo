import type { IAnalytics } from "@/hooks/useCoupon";
import { memo } from "react";

const MemoSummarySection = ({ analytics }: { analytics?: IAnalytics }) => {
  if (!analytics) {
    return (
      <section>
        <p>No analytics data available.</p>
      </section>
    );
  }

  return (
    <section>
      <section className="flex gap-4 mx-4 mt-4 lg:mx-0 lg:max-w-[28rem]">
        {Object.keys(analytics)
          .slice(0, 3)
          .map((key, index) => {
            return (
              <center
                key={index}
                className="rounded-2xl w-full max-w-[7.75rem] lg:w-[8.5rem] lg:max-w-[9.25rem] bg-[#FFFFFF] py-3 capitalize text-[#6F649B]"
              >
                <h3 className="text-sm">{key?.slice(5)}</h3>
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

const SummarySection = memo(MemoSummarySection);

export default SummarySection;
