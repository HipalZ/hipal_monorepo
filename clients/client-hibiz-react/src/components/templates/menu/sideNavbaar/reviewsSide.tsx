import logoPlaceholder from "@/assets/hisite/logoPlaceholder.png";
import useBusinessData from "@/components/store/useBusinessData";
import { type ReviewPages, useReview } from "@/components/store/useReview";
import { cn } from "@hi/common";
import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface ReviewSidebarProps {
  items: { icon: string; text: string; onClick: () => void }[];
}

const MemoiseReviewSidebar: React.FC<ReviewSidebarProps> = ({ items }) => {
  const navigate = useNavigate();
  const businessId = useBusinessData((state) => state.businessData?._id);
   const businessLogo = useBusinessData((s) => s?.businessData?.logo);
    const fallbackBusinessLogo = useBusinessData((s) => s?.outletInfo?.logoUrl);

  const goToHome = useCallback(() => {
    navigate(`/app/business/${businessId}`);
  }, [navigate]);
  const { page } = useReview();

  const removeAllUnwanted = useCallback((page: ReviewPages, text: string) => {
    const normalize = (str: string) =>
      str.toLowerCase().replace(/[^a-z0-9]/g, "");
    const isMatch = normalize(page) === normalize(text);
    return isMatch;
  }, []);

  return (
    <section className="sidebar">
    <button
        type="button"
        onClick={goToHome}
        className="flex flex-col items-center justify-center mx-auto mt-8 mb-4 text-center cursor-pointer"
      >
        <img
          src={businessLogo || fallbackBusinessLogo || logoPlaceholder}
          alt="logo placeholder"
          className="w-[75px] h-[75px] object-cover rounded-full"
        />
        <span className="mt-2">Home</span>
      </button>
      {items.map((item, index) => (
        <center
          className={cn(
            "sidebar-item",
            removeAllUnwanted(page, item.text)
              ? " !transition-all !bg-[#C3B3F850]"
              : "",
          )}
          key={index}
          onClick={item.onClick}
        >
          <span>{item.text}</span>
        </center>
      ))}
    </section>
  );
};

const ReviewSidebar = memo(MemoiseReviewSidebar);

export default ReviewSidebar;
