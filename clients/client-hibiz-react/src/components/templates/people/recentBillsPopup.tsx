import { memo, useState } from "react";
import OnlineImgCard from "./onlineImgCard";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import { MdOutlineMessage } from "react-icons/md";
import { AiOutlineClose } from "react-icons/ai";
import { cn } from "@/components/utils/helper";
import { LiaTagSolid } from "react-icons/lia";
import BottomButton from "@/components/atom/bottomButton";

const review = [
  {
    name: "Food & Taste",
    rating: true,
  },
  {
    name: "Behavior",
    rating: true,
  },
  {
    name: "Ambience",
    rating: true,
  },
  {
    name: "Vibe",
    rating: true,
  },
];

const MemoRecentBillsPopup = () => {
  const { singleBillData: data } = useHiPeopleStore((s) => ({
    singleBillData: s.singleBillData,
  }));

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    if (tagInput.trim() !== "") {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <section className="p-4 overflow-y-auto bg-white rounded-t-2xl">
      <OnlineImgCard data={data} />
      <section className="grid grid-cols-2 gap-x-16 md:gap-x-0 md:grid-cols-4">
        {review.map((item, index) => (
          <section
            key={index.toString()}
            className="flex justify-between py-0.5"
          >
            <article>
              <small className="text-base">
                {item.name} : {item.rating ? "👍" : "👎"}
              </small>
            </article>
          </section>
        ))}
      </section>
      <br />
      <article className="flex items-center space-x-2">
        <MdOutlineMessage size={22} />
        <span>Comment</span>
      </article>
      <div className="mt-2 mb-4">
        <textarea
          id="floating_outlined3"
          className="block w-full mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border border-black focus:border-primary peer rounded-xl focus:outline-none dark:border-gray-600 dark:text-white"
          placeholder="Enter Comment here..."
          required
          style={{
            resize: "none",
          }}
        />
      </div>
      <h1># Add Tags</h1>
      <article className="flex items-center gap-4 mt-2 ">
        <input
          className="border border-[#8C63FF] rounded-md h-10 pl-2"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="Enter tag"
        />
        <button
          type="button"
          className="h-10 px-8 text-white bg-black rounded-full"
          onClick={handleAddTag}
        >
          Add
        </button>
      </article>
      <section className="flex flex-wrap gap-4 my-2">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            className="mt-2 flex items-center justify-center space-x-2 rounded-2xl bg-[#E3DCFF] px-2 py-1 text-[#6F649B] text-sm"
          >
            <span># {tag}</span>
            <AiOutlineClose
              size={12}
              onClick={() => handleRemoveTag(tag)}
              className="cursor-pointer"
            />
          </button>
        ))}
      </section>
      <section className="flex gap-4 mt-6 pb-[5rem]">
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
      <BottomButton buttons={[{ text: "Apply", type: "button" }]} />
    </section>
  );
};

const RecentBillsPopup = memo(MemoRecentBillsPopup);
export default RecentBillsPopup;
