import { useState, memo, type ChangeEvent, useCallback } from "react";
import BottomButton from "@/components/atom/bottomButton";
import useBusinessData from "@/components/store/useBusinessData";
import useCouponsStore from "@/components/store/useCouponsStore";
import { useGenerateLinks, useGetAllChannels } from "@/hooks/useCoupon";
import toast, { Toaster } from "react-hot-toast";
import LoadingSpinner from "@/components/atom/loadingSpinner";

// Define the structure for the Channel interface
interface Channel {
  couponIds: string[];
  _id: string;
  businessId: string;
  name: string;
  count: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const MemoAllLinkChannels: React.FC = () => {
  const { channels, isLoading } = useGetAllChannels();
  const businessData = useBusinessData((state) => state.businessData);
  const { couponId } = useCouponsStore((s) => ({
    couponId: s.couponId,
  }));
  const businessId = businessData?._id ?? "";

  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { generateLinks, isPending } = useGenerateLinks();

  // Handle checkbox selection/deselection
  const handleCheckboxChange = (channelId: string) => {
    setSelectedChannelIds((prevSelected) =>
      prevSelected.includes(channelId)
        ? prevSelected.filter((id) => id !== channelId)
        : [...prevSelected, channelId],
    );
  };

  const handleSave = useCallback(async () => {
    if (!couponId || !businessId) {
      toast.error("Coupon ID or Business ID is missing.");
      return;
    }
    if (selectedChannelIds.length === 0) {
      toast.error("Please select at least one channel.");
      return;
    }

    const payload = {
      couponId,
      channelIds: selectedChannelIds,
      businessId,
    };

    generateLinks(payload);
  }, [businessId, couponId, selectedChannelIds]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  if (isLoading || isPending) {
    return <LoadingSpinner />;
  }

  if (!channels || channels.length === 0) {
    return (
      <center className="font-bold text-[#9267EC]">
        No channels available.
      </center>
    );
  }

  const visibleChannels = channels.filter((channel: Channel) => {
    return couponId ? !channel.couponIds.includes(couponId) : true;
  });

  const filteredChannels =
    searchQuery.length >= 2
      ? visibleChannels.filter((channel) =>
          channel.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : visibleChannels;

  if (filteredChannels.length === 0) {
    return (
      <center className="font-bold text-[#9267EC]">
        No matching channels found.
      </center>
    );
  }

  return (
    <section className="">
      <input
        type="search"
        placeholder="Search channels..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="w-[86%] p-2 mb-4 border border-gray-300 rounded-lg mx-6"
      />
      <div className="flex flex-col gap-4 mx-6 lg:flex-row">
        {filteredChannels.map((channel: Channel) => (
          <article
            key={channel._id}
            className="w-full max-w-[28rem] md:max-w-[21rem] lg:max-w-[21rem] py-4 border-b border-[#00000050]"
            onClick={() => handleCheckboxChange(channel._id)}
          >
            <input
              type="checkbox"
              value={channel._id}
              checked={selectedChannelIds.includes(channel._id)}
              onChange={() => handleCheckboxChange(channel._id)}
              className="text-black rounded"
            />
            &nbsp; &nbsp;
            {channel.name}
          </article>
        ))}
      </div>
      <BottomButton
        fixed
        buttons={[
          {
            text: "Save",
            onClick: handleSave,
          },
        ]}
      />
    </section>
  );
};

const AllLinkChannels = memo(MemoAllLinkChannels);

export default AllLinkChannels;
