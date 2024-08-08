import { Switch } from "@headlessui/react";
import { lazy, memo, useMemo, useState } from "react";
import { CiCircleMinus, CiCirclePlus } from "react-icons/ci";
import { FaRegUserCircle } from "react-icons/fa";
import { LuBellRing } from "react-icons/lu";
import { TiTick } from "react-icons/ti";
import { HiOutlineBellAlert } from "react-icons/hi2";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import {
  calculateFutureDate,
  calculateFutureTimestamp,
  cn,
  convertToMilliSeconds,
  formatDate,
  formatTime,
} from "@/components/utils/helper";
import { useCreateTag } from "@/hooks/useHipeople";
import { useParams } from "react-router-dom";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import toast from "react-hot-toast";
const BottomButton = lazy(() => import("@/components/atom/bottomButton"));

const MemoCreateTag = () => {
  const {
    singleTagData,
    showRemainder,
    setShowRemainder,
    displayToCaptain,
    setDisplayToCaptain,
    tagName,
    setTagName,
    tagNotes,
    setTagNotes,
    remainder,
    setRemainder,
    duration,
    setDuration,
    time,
    setTime,
    history,
    setHistory,
  } = useHiPeopleStore((s) => ({
    singleTagData: s.tagNotesData,
    showRemainder: s.showRemainder,
    setShowRemainder: s.setShowRemainder,
    displayToCaptain: s.displayToCaptain,
    setDisplayToCaptain: s.setDisplayToCaptain,
    tagName: s.tagName,
    setTagName: s.setTagName,
    tagNotes: s.tagNotes,
    setTagNotes: s.setTagNotes,
    remainder: s.remainder,
    setRemainder: s.setRemainder,
    duration: s.duration,
    setDuration: s.setDuration,
    time: s.time,
    setTime: s.setTime,
    history: s.history,
    setHistory: s.setHistory,
  }));

  const createdById = useOwnerLogin((s) => s?.user?._id);
  const createdBy = useOwnerLogin((s) => s?.user?.name);

  const [futureTimestamp, setFutureTimestamp] = useState<number>(0);

  const defaultBgOpacityColor = useMemo(() => {
    return singleTagData?.tagId?.tagType === "AUTO_TAG"
      ? "bg-[#FFA50020]"
      : "bg-[#8C63FF20]";
  }, [singleTagData?.tagId?.tagType]);

  const defaultColor = useMemo(() => {
    return singleTagData?.tagId?.tagType === "AUTO_TAG"
      ? "[#FFA500]"
      : "[#8C63FF]";
  }, [singleTagData?.tagId?.tagType]);

  const { businessId } = useParams<{
    businessId?: string;
  }>();

  const handleSave = () => {
    if (time === "") {
      return toast.error("Please select time");
    }
    if (duration === "") {
      return toast.error("Please select duration");
    }
    if (remainder === "") {
      return toast.error("Please select remainder");
    }
    const futureDate = calculateFutureDate(remainder, duration);
    const newHistoryItem = {
      remainder,
      duration,
      time: formatTime(time),
      futureDate: formatDate(futureDate),
      createdBy: createdBy,
    };
    setHistory([newHistoryItem]);
    const futureTimestamp = calculateFutureTimestamp(remainder, duration, time);
    setFutureTimestamp(futureTimestamp);
    setShowRemainder(false);
  };

  const toggleAddRemainder = () => {
    setShowRemainder(!showRemainder);
  };

  const { mutate } = useCreateTag();

  const handleApplyTags = () => {
    const date = Date.now();
    const differenceTimeStamp = futureTimestamp - date;
    const payload = {
      businessId: businessId,
      name: tagName,
      note: tagNotes,
      tagType: "MANUAL_TAG",
      displayForCaptains: displayToCaptain,
      duration: differenceTimeStamp,
      remainderInDuration: `${remainder} ${duration}`,
      time: convertToMilliSeconds(time),
      createdBy: createdById,
    };
    mutate(payload);
  };

  return (
    <>
      <section className="px-6 pt-2 bg-white rounded-2xl overflow-auto h-[80dvh] pb-[5rem]">
        <center className={cn("text-[#6F649B] text-3xl mt-2")}>Add Tagz</center>
        <section className="mt-4">
          <article>
            <div className="relative mt-4">
              <input
                type="text"
                value={tagName}
                minLength={4}
                maxLength={30}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="Enter the Tag Name..."
                className="w-full p-2 pr-14 bg-white border border-[#8C63FF] rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
              />
              <small className="absolute bottom-2 right-4">
                {tagName?.length || tagName?.length}/{30}
              </small>
            </div>
            <div className="relative mt-4">
              <textarea
                value={tagNotes}
                minLength={4}
                maxLength={200}
                onChange={(e) => setTagNotes(e.target.value)}
                placeholder="Add Note..."
                className="resize-none h-48 w-full p-2 pr-14 bg-white border border-[#8C63FF] rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
              />
              <small className="absolute bottom-2 right-4">
                {tagNotes?.length || tagNotes?.length}/{200}
              </small>
            </div>
          </article>
          <article className="flex justify-between mt-4">
            <div className="flex space-x-2">
              <h1 className="border border-1 border-[#000] rounded-full w-fit h-fit">
                <TiTick size={20} />
              </h1>
              <h1>Display this for captains</h1>
            </div>
            <Switch
              checked={displayToCaptain}
              onChange={setDisplayToCaptain}
              className={`mt-2 group relative flex h-3 w-10 cursor-pointer rounded-full border-2 border-${defaultColor} transition-colors duration-200 ease-in-out focus:outline-none ${
                displayToCaptain ? `bg-${defaultColor}` : "bg-transparent"
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform absolute -top-[6px] -left-1 rounded-full border-2 border-${defaultColor} transition duration-200 ease-in-out ${
                  displayToCaptain
                    ? "translate-x-5 bg-white"
                    : `bg-${defaultColor}`
                }`}
              />
            </Switch>
          </article>
          <article className="flex justify-between my-4">
            <div className="flex items-center space-x-2">
              <LuBellRing size={20} />
              <h1>Add remainder</h1>
            </div>
            {showRemainder ? (
              <CiCircleMinus
                onClick={toggleAddRemainder}
                size={24}
                className={`transition-transform transform rotate-0 text-${defaultColor}`}
              />
            ) : (
              <CiCirclePlus
                onClick={toggleAddRemainder}
                size={24}
                className={`transition-transform transform rotate-0 text-${defaultColor}`}
              />
            )}
          </article>

          {showRemainder ? (
            <>
              <section className="flex mb-4 space-x-2">
                <div className="relative">
                  <input
                    type="number"
                    value={remainder || 0}
                    onChange={(e) => setRemainder(e.target.value)}
                    id="remainder"
                    className={`block w-[6.4rem] h-[2.5rem] pt-2 pb-2 pl-3 pr-3 mb-0 ml-0 mr-0 text-sm text-gray-900 bg-transparent border border-${defaultColor} dark:text-base-100 focus:border-primary peer rounded-xl focus:outline-none dark:border-gray-600`}
                    placeholder="Remind"
                    required
                  />
                  <label
                    htmlFor="remainder"
                    className={`bg-base-100 peer-focus:text-primary peer-focus:dark:text-primary absolute left-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform px-2 text-xs text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 dark:text-${defaultColor}`}
                  >
                    Remainder in
                  </label>
                </div>
                <div className="relative">
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    id="duration"
                    className={`block w-[7rem] h-[2.5rem] pt-2 pb-2 pl-3 pr-3 mb-0 ml-0 mr-0 text-sm text-gray-900 bg-transparent border border-${defaultColor} dark:text-base-100 focus:border-primary peer rounded-xl focus:outline-none dark:border-gray-600`}
                    required
                  >
                    <option value="" disabled>
                      Duration
                    </option>
                    <option value="Days">Days</option>
                    <option value="Months">Months</option>
                    <option value="Years">Years</option>
                  </select>
                  <label
                    htmlFor="duration"
                    className={`bg-base-100 peer-focus:text-primary peer-focus:dark:text-primary absolute left-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform px-2 text-xs text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 dark:text-${defaultColor}`}
                  >
                    Duration
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    id="time"
                    className={`block w-[7rem] h-[2.5rem] pt-2 pb-2 pl-3 pr-3 mb-0 ml-0 mr-0 text-sm text-gray-900 bg-transparent border border-${defaultColor} dark:text-base-100 focus:border-primary peer rounded-xl focus:outline-none dark:border-gray-600`}
                    placeholder=""
                    required
                  />
                  <label
                    htmlFor="time"
                    className="bg-base-100 peer-focus:text-primary peer-focus:dark:text-primary absolute left-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform px-2 text-xs text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 dark:text-gray-400"
                  >
                    Time
                  </label>
                </div>
              </section>
              <button
                type="button"
                onClick={handleSave}
                className={`bg-${defaultColor} mb-4 px-4 py-2 text-white rounded-lg`}
              >
                Save
              </button>
            </>
          ) : null}
          <section className="relative">
            <h1 className="mb-2"># History of use</h1>
            {history.length > 0 ? (
              history.map((item, index) => (
                <article
                  key={item?.remainder + index.toString()}
                  className={`p-3 space-y-2 ${defaultBgOpacityColor} rounded-xl mb-2`}
                >
                  <div className="flex justify-between">
                    <h1>
                      {item.remainder} {item.duration}{" "}
                    </h1>
                    <h6 className="flex items-center space-x-2">
                      <HiOutlineBellAlert color="black" size={20} />
                      <span>{item.time}</span>
                    </h6>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaRegUserCircle />
                    <p>{createdBy || "Waiter"}</p>
                  </div>
                </article>
              ))
            ) : (
              <center className="mt-10">No history yet.</center>
            )}
          </section>
        </section>
      </section>
      <BottomButton
        buttons={[
          { text: "Create Tagz", type: "button", onClick: handleApplyTags },
        ]}
      />
    </>
  );
};

const CreateTag = memo(MemoCreateTag);
export default CreateTag;
