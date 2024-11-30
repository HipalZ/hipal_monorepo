import useBusinessDetails from "@/components/store/useBusinessDetails";
import { useReview } from "@/components/store/useReview";
import { cn, reviewColors } from "@/components/utils/helpers";
import { memo } from "react";
import { AiTwotoneEdit } from "react-icons/ai";
import { MdOutlinePerson } from "react-icons/md";

const MemoImprovements = () => {
  const {
    selectedEmoji,
    setOpenComment,
    openComment,
    showSuggestions,
    setShowSuggestions,
    improve,
    setImprove,
  } = useReview((s) => ({
    selectedEmoji: s.selectedEmoji,
    setOpenComment: s.setOpenComment,
    openComment: s.openComment,
    showSuggestions: s.showSuggestions,
    setShowSuggestions: s.setShowSuggestions,
    improve: s.improve,
    setImprove: s.setImprove,
  }));

  const { businessDetails } = useBusinessDetails((s) => ({
    businessDetails: s.businessDetails,
  }));

  const improvementAreas = [
    { name: businessDetails?.outLetType !== "MENU" ? "Service" : "Food Taste" },
    { name: "Staff & Behavior" },
    { name: "Ambience" },
    { name: "Hygiene & Cleanliness" },
  ];

  const handleFeedback = (area) => {
    setImprove({
      [area.name]: improve[area.name] ? null : 1,
    });
  };

  return (
    <>
      {selectedEmoji !== null ? (
        <>
          <section className="flex flex-wrap gap-3 mx-6 mt-24 mb-5">
            {improvementAreas?.map((area) => {
              return (
                <article
                  key={area?.name}
                  className="z-20 flex items-center justify-center px-4 py-2 text-xs border rounded-full cursor-pointer inter"
                  onClick={() => handleFeedback(area)}
                  style={{
                    backgroundColor: improve[area.name]
                      ? reviewColors[selectedEmoji]?.buttonTextColor
                      : "#FBFEFC",
                  }}
                >
                  <button
                    style={{
                      color: improve[area.name]
                        ? "#FBFEFC"
                        : reviewColors[selectedEmoji]?.buttonTextColor,
                    }}
                    type="button"
                  >
                    {area?.name}
                  </button>
                </article>
              );
            })}
          </section>
          <article className="flex justify-between mx-6 mt-10">
            <button
              type="button"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className={cn(
                "flex items-center space-x-2 px-3 py-1.5 rounded-full text-[#FBFEFC]",
              )}
              style={{
                backgroundColor: reviewColors[selectedEmoji]?.buttonTextColor,
              }}
            >
              <MdOutlinePerson size={16} />
              <span className="text-xs">Tag Staff</span>
            </button>
            <button
              type="button"
              onClick={() => setOpenComment(!openComment)}
              className={cn(
                "flex items-center space-x-2 px-3 py-1.5 rounded-full text-[#FBFEFC]",
              )}
              style={{
                backgroundColor: reviewColors[selectedEmoji]?.buttonTextColor,
              }}
            >
              <AiTwotoneEdit size={16} />
              <span className="text-xs">Review</span>
            </button>
          </article>
        </>
      ) : null}
    </>
  );
};

const Improvements = memo(MemoImprovements);
export default Improvements;
