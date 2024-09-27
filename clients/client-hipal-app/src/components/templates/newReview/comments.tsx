import { useReview } from "@/components/store/useReview";
import React, { type ChangeEvent, memo, useCallback } from "react";
import { reviewColors } from "@/components/utils/helpers";

const MemoComments = () => {
  const { selectedEmoji, openComment, description, setDescription } = useReview(
    (s) => ({
      selectedEmoji: s.selectedEmoji,
      openComment: s.openComment,
      description: s.description,
      setDescription: s.setDescription,
    }),
  );
  const handleDescriptionChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.target.value;
      setDescription(value);
    },
    [setDescription],
  );
  return (
    <>
      {openComment && (
        <>
          <h1 className="mx-6 mt-4 mb-2 text-black">Comment</h1>
          <section className="mx-6 mb-6 shadow-base-100">
            <div className="relative">
              <textarea
                onChange={handleDescriptionChange}
                value={description}
                style={{
                  color:
                    selectedEmoji !== null
                      ? reviewColors[selectedEmoji]?.textColor
                      : "#000",
                  borderColor:
                    selectedEmoji !== null
                      ? reviewColors[selectedEmoji]?.buttonTextColor
                      : "#000",
                  boxShadow:
                    "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px",
                }}
                id="floating_outlined"
                className="bg-[#FBFEFC] relative z-1 resize-none !text-black text-sm h-36 block w-full pt-2 pb-3 pl-2 pr-[1rem] mb-0 ml-0 mr-0 rounded-lg border dark:text-[#ffffff] focus:outline-none focus:ring-0 peer"
                placeholder="Please leave a comment"
                maxLength={600}
              />
              <small className="absolute z-10 p-2 text-xs text-black bottom-1 right-1">
                {description.length}/600{" "}
              </small>
            </div>
          </section>
        </>
      )}
    </>
  );
};

const Comments = memo(MemoComments);
export default Comments;
