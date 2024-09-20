import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useGetAllChannelDashboard } from "@/hooks/useCoupon";
import { memo } from "react";
import AllChannelDetails from "./allChanelList";

const MemoChannel = () => {
  const { channels, isLoading } = useGetAllChannelDashboard();

  const isValidChannels =
    channels && typeof channels === "object" && !Array.isArray(channels);

  return (
    <section className="mx-6">
      {isLoading ? (
        <LoadingSpinner />
      ) : isValidChannels && Object.keys(channels).length > 0 ? (
        <section className="flex flex-wrap gap-2 ">
          {Object.keys(channels).map((key, index) => (
            <center
              key={index}
              className="w-[48%] lg:w-[49%] rounded-2xl bg-[#FFFFFF] px-2 py-6 capitalize text-[#6F649B]" // Setting width to achieve 2 columns
            >
              <h3 className="text-sm">{key?.split(/(?=[A-Z])/).join(" ")}</h3>
              <p className="mt-2 text-xl font-semibold text-black">
                {channels?.[key]}
              </p>
            </center>
          ))}
        </section>
      ) : (
        <p>No channels data available.</p>
      )}
      <section className="-mx-6">
        <AllChannelDetails hide />
      </section>
    </section>
  );
};

const Channel = memo(MemoChannel);

export default Channel;
