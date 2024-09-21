import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useCreateChannel, useGetAllChannelDashboard } from "@/hooks/useCoupon";
import { memo, useCallback, useState } from "react";
import AllChannelDetails from "./allChanelList";
import BottomButton from "@/components/atom/bottomButton";
import PopUp from "@/components/atom/popUp";
import toast from "react-hot-toast";
import useBusinessData from "@/components/store/useBusinessData";

const channelButton = [
  "Facebook",
  "Instagram",
  "Paid ads",
  "Youtube",
  "Influencer",
  "Marketing Team",
  "PR team",
];

const MemoChannel = () => {
  const { channels, isLoading } = useGetAllChannelDashboard();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [channelName, setChannelName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { createChannel, isPending } = useCreateChannel();

  const maxLength = 16;

  const isValidChannels =
    channels && typeof channels === "object" && !Array.isArray(channels);

  const openModalHandler = useCallback(() => {
    setOpenModal(true);
  }, []);

  const closeModalHandler = useCallback(() => {
    setOpenModal(false);
    setChannelName("");
    setError("");
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > maxLength) {
      setError(`Max limit is ${maxLength} characters`);
    } else {
      setError("");
      setChannelName(value);
    }
  };

  const handleSubmit = () => {
    if (channelName.length > maxLength) {
      setError(`Max limit is ${maxLength} characters`);
      return;
    }

    if (channelName.trim() === "") {
      toast.error("Channel name cannot be empty.");
      return;
    }

    const payload = {
      businessId,
      name: channelName,
    };
    createChannel(payload);
    closeModalHandler();
  };

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
      <section className="-mx-6 pb-[7rem]">
        <AllChannelDetails hide />
      </section>
      {openModal && (
        <PopUp show={openModal} onClose={closeModalHandler}>
          <center className="mt-6 text-xl font-semibold lg:text-3xl">
            Create a new channel
          </center>
          <section className="mx-6 pb-[7rem]">
            <div className="relative mt-4 ">
              <label className="font-semibold text-black opacity-60">
                Channel Name (Max {maxLength} characters)
              </label>
              <input
                type="text"
                value={channelName}
                onChange={handleInputChange}
                className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                maxLength={maxLength + 1}
              />
              <p className="absolute bottom-2 right-2">
                {channelName.length}/16
              </p>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
            {/* Channel Buttons */}
            <div className="mt-2">
              {channelButton.map((channel, index) => (
                <button
                  key={index}
                  type="button"
                  className="mt-4 mx-2 text-sm py-2 bg-[#E3DCFF] rounded-full px-4 border border-[#8C63FF50] text-[#00000050"
                  onClick={() => setChannelName(channel)}
                >
                  {channel}
                </button>
              ))}
            </div>
          </section>
          <BottomButton
            buttons={[
              {
                text: "save",
                onClick: handleSubmit,
              },
            ]}
          />
        </PopUp>
      )}
      <section className="-mx-6">
        <BottomButton
          fixed
          buttons={[
            {
              text: "Add Channel",
              onClick: openModalHandler,
            },
          ]}
        />
      </section>
    </section>
  );
};

const Channel = memo(MemoChannel);

export default Channel;
