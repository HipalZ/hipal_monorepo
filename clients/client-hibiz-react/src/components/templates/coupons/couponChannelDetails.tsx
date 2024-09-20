import { cn } from "@hi/common";
import { BsGraphUpArrow } from "react-icons/bs";
import { formatNumber } from "@/components/utils/helper";
import { FaPeopleGroup } from "react-icons/fa6";
import { TbTagStarred } from "react-icons/tb";
import { memo, useCallback, useState } from "react";
import {
  type IChannel,
  useDisableLink,
  useGetChannel,
  useGetCouponsChannel,
} from "@/hooks/useCoupon";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import toast from "react-hot-toast";
import PopUp from "@/components/atom/popUp";
import { RiLinkUnlink } from "react-icons/ri";
import useCouponsStore from "@/components/store/useCouponsStore";

const MemoCouponChannelDetails = ({ hide }: { hide?: boolean }) => {
  const { setSelectedPage } = useCouponsStore((s) => ({
    setSelectedPage: s.setSelectedPage,
  }));
  const { singleCouponChannel, isLoading } = useGetCouponsChannel();

  const [openChannel, setOpenChannel] = useState<boolean>(false);
  const [channelId, setChannelId] = useState<string>("");
  const [channelName, setChannelName] = useState<string>("");

  const { channel, isLoading: channelLoading } = useGetChannel(
    channelId,
    openChannel,
  );

  const { disableChannel, isPending } = useDisableLink();

  const openModal = useCallback((channel: IChannel) => {
    setOpenChannel(true);
    setChannelId(channel.channelId);
    setChannelName(channel.name);
  }, []);

  const closeModal = useCallback(() => {
    setOpenChannel(false);
  }, []);

  const copyLink = useCallback((link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link Copied");
  }, []);

  const disableChannelFunc = useCallback(
    (isActive: boolean, channelId: string) => {
      disableChannel({ channelId, isDisable: !isActive });
      setOpenChannel(false);
    },
    [disableChannel],
  );

  const goToChannels = useCallback(() => {
    setSelectedPage("CHANNELS");
  }, []);

  return (
    <section className="mx-6 mt-10 lg:mt-12">
      <article className="flex justify-between pb-3 w-full max-w-[32rem]">
        <h3 className="font-semibold opacity-50">Channels</h3>
        {!hide && (
          <button
            type="button"
            onClick={goToChannels}
            className="px-4 py-1 text-sm text-white bg-black rounded-3xl"
          >
            Manage Channel
          </button>
        )}
      </article>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <section className="analytics_cards_groups_channel">
          {singleCouponChannel?.map((item) => (
            <section
              key={item.name}
              className={cn(
                "bg-white rounded-2xl h-[14.5rem] relative p-2.5 shadow-xl",
                !item.isActive && "filter grayscale",
              )}
            >
              <button
                type="button"
                className={cn(
                  item.isActive ? "text-green-500" : "text-red-600",
                  "absolute top-2 right-2 text-sm",
                )}
              >
                {item.isActive ? "Active" : "Inactive"}
              </button>
              <article className="absolute px-4 flex bg-[#fafafa] justify-center items-center text-center h-[7rem] w-[7rem] transform -translate-x-1/2 -translate-y-1/2 border border-[#9267EC40] rounded-full left-1/2 top-[35%]">
                {item.name}
              </article>
              <section className="absolute text-center bottom-[2.5rem] text-xs flex justify-between items-center w-[90%] px-2">
                <center>
                  <TbTagStarred size={18} className="text-[#9267EC]" />
                  <p className="text-base">{formatNumber(item.totalReach)}</p>
                </center>
                <center>
                  <FaPeopleGroup size={18} className="text-[#9267EC]" />
                  <p className="text-base">{formatNumber(item.totalGrabbed)}</p>
                </center>
                <center>
                  <BsGraphUpArrow size={18} className="text-[#9267EC]" />
                  <p className="text-base">{formatNumber(item.totalSales)}</p>
                </center>
              </section>
              <button
                type="button"
                onClick={() => openModal(item)}
                className="absolute w-[90%] bottom-2 text-xs py-1 text-white bg-[#9267EC] rounded-3xl"
              >
                View Option
              </button>
            </section>
          ))}
        </section>
      )}
      {openChannel && (
        <PopUp show={openChannel} onClose={closeModal} width="w-[30rem]">
          {channelLoading ? (
            <LoadingSpinner />
          ) : (
            <article className="px-4 py-4 space-y-4 bg-white rounded-t-2xl">
              <center
                style={{
                  fontFamily: "bungee",
                }}
                className="text-2xl font-bold"
              >
                {channelName}
              </center>

              {channel?.isActive && (
                <button
                  className="w-full px-4 py-1 text-sm flex items-center justify-center bg-white border-[0.75rem] border-[#F4F4F4] rounded-full"
                  type="button"
                  onClick={() => copyLink(channel?.link)}
                >
                  <RiLinkUnlink /> &nbsp; Copy Channel Link
                </button>
              )}
              <button
                className={cn(
                  "w-full px-4 py-1 text-sm border-[0.75px] text-white rounded-full",
                  {
                    "bg-[#FF3B30]  border-[1rem] border-[#FFB1AD]":
                      channel?.isActive,
                    "bg-[#24C163] border-[1rem] border-[#d9f7e5]":
                      !channel?.isActive,
                  },
                )}
                type="button"
                onClick={() => disableChannelFunc(channel?.isActive, channelId)}
                disabled={isPending}
              >
                {isPending
                  ? "Disabling..."
                  : channel?.isActive
                    ? "Disable Channel Link"
                    : "Active Channel Link"}
              </button>
            </article>
          )}
        </PopUp>
      )}
    </section>
  );
};

const CouponChannelDetails = memo(MemoCouponChannelDetails);

export default CouponChannelDetails;
