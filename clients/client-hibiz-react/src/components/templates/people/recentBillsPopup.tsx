import { type ChangeEvent, memo, useCallback } from "react";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import { MdOutlineMessage } from "react-icons/md";
import { cn } from "@/components/utils/helper";
import { LiaTagSolid } from "react-icons/lia";
import { useUserUpdateTags } from "@/hooks/useHipeople";
import { lazy } from "react";

const TagsComboBox = lazy(() => import("./tagsComboBox"));
const BottomButton = lazy(() => import("@/components/atom/bottomButton"));
const OnlineImgCard = lazy(() => import("./onlineImgCard"));

const MemoRecentBillsPopup = () => {
  const {
    singleBillData: data,
    setUserComment,
    userComment,
    tags,
  } = useHiPeopleStore((s) => ({
    singleBillData: s.singleBillData,
    setUserComment: s.setUserComment,
    userComment: s.userComment,
    tags: s.tags,
  }));

  const handleComment = useCallback((e: ChangeEvent<HTMLAreaElement>) => {
    setUserComment(e.target.value);
  }, []);

  const { mutate } = useUserUpdateTags();

  const handleApply = () => {
    mutate(tags);
  };

  return (
    <>
      <section className="p-4 overflow-y-auto bg-white h-[80vh] md:h-[60vh] rounded-2xl">
        <OnlineImgCard data={data} />
        <section className="grid grid-cols-2 md:gap-x-20 gap-x-16 md:grid-cols-4">
          {Object.entries(data?.reviewId || {})
            .filter(([key]) => key !== "_id" && key !== "reviewRating")
            .map(([key, value], index) => (
              <section
                key={index.toString()}
                className="flex justify-between py-0.5"
              >
                <article>
                  <small className="text-base">
                    {key.charAt(0).toUpperCase() + key.slice(1)} :{" "}
                    {value === 1 ? "👍" : "👎"}
                  </small>
                </article>
              </section>
            ))}
        </section>

        <br />
        <div className="md:flex md:justify-between">
          <section>
            <article className="flex items-center space-x-2">
              <MdOutlineMessage size={22} />
              <span>Comment</span>
            </article>
            <div className="mt-2 mb-4">
              <textarea
                id="floating_outlined3"
                value={data?.comment || userComment}
                onChange={handleComment}
                className="block w-full md:w-[20rem] mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border border-black focus:border-primary peer rounded-xl focus:outline-none dark:border-gray-600 dark:text-white"
                placeholder="Enter Comment here..."
                required
                style={{
                  resize: "none",
                }}
              />
            </div>
          </section>
          <article>
            <h1 className="mb-2"># Add Tags</h1>
            <TagsComboBox />
          </article>
        </div>
        <section className="flex gap-4 pb-[5rem]">
          <button
            type="button"
            className={cn(
              "flex items-center justify-center space-x-2 rounded-2xl px-2 py-1",
              data?.paymentMode === "online"
                ? "bg-[#e7fedc] text-[#23B371]"
                : "bg-orange-200 text-orange-500",
            )}
          >
            <small className="capitalize">{data?.paymentMode} Payment</small>
          </button>
          <button
            type="button"
            className="flex items-center justify-center space-x-2 rounded-2xl bg-[#e7fedc] px-2 py-1 text-[#23B371]"
          >
            <LiaTagSolid />
            <small>{data?.order_id?.claimedCoins} Coinz used </small>
          </button>
        </section>
      </section>
      <BottomButton
        buttons={[
          {
            text: "Apply",
            type: "button",
            onClick: handleApply,
          },
        ]}
      />
    </>
  );
};

const RecentBillsPopup = memo(MemoRecentBillsPopup);
export default RecentBillsPopup;
