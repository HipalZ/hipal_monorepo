import MemoizedHeader from "@/components/molecules/header";
import { type ReviewPages, useReview } from "@/components/store/useReview";
import { FaArrowLeft } from "react-icons/fa";
import Hi from "@/assets/svg/hi.svg";
import { cn } from "@hi/common";
import { startTransition, useCallback } from "react";
import ReviewSidebar from "@/components/templates/menu/sideNavbaar/reviewsSide";
import ReviewSection from "@/components/templates/review/review";
import Star from "@/components/templates/review/star";
import StarUser from "@/components/templates/review/starUser";
import { useNavigate } from "react-router-dom";
import useBusinessData from "@/components/store/useBusinessData";
import Message from "@/components/templates/review/message";
const Review = () => {
  const { page, setPage } = useReview((s) => ({
    page: s.page,
    setPage: s.setPage,
  }));
  const navigate = useNavigate();
  const businessId = useBusinessData((state) => state.businessData?._id);

  const sidebarItems = [
    { icon: Hi, text: "Review", onClick: () => setPage("Review") },
    {
      icon: Hi,
      text: "Star Staff",
      onClick: () => setPage("Star Staff"),
    },
  ];

  const dynamicHeading = useCallback(() => {
    switch (page) {
      case "Review":
        return "Review";
      case "Star Staff":
        return "Star Staff";
      case "user":
        return "Staff";
      case "message":
        return "message";
      default:
        return "Review";
    }
  }, [page]);

  const handleBack = () => {
    if (page === "user") {
      setPage("Review");
      return;
    }
    if (page === "Review") {
      startTransition(() => {
        navigate(`/app/business/${businessId}`);
      });
    }
    if (page === "message") {
      setPage("user");
      return;
    }
    setPage("Review");
  };
  const removeAllUnwanted = useCallback((page: ReviewPages, text: string) => {
    const normalize = (str: string) =>
      str.toLowerCase().replace(/[^a-z0-9]/g, "");
    const isMatch = normalize(page) === normalize(text);
    return isMatch;
  }, []);
  return (
    <main>
      <div className="sticky top-0 z-50 w-full">
        <article className="linear_gradient_background ">
          <MemoizedHeader
            title={dynamicHeading()}
            onBack={handleBack}
            leftIcon={<FaArrowLeft />}
            rightImage={Hi}
          />
        </article>
        {(page === "Review" || page === "Star Staff") && (
          <section className="absolute w-full px-4 space-x-4 text-sm mobile-only">
            {sidebarItems.map((item) => (
              <button
                className={cn(
                  "pb-3 pt-4",
                  removeAllUnwanted(page, item.text)
                    ? "border-b-2 border-black transition-all"
                    : "",
                )}
                key={item.text}
                type="button"
                onClick={item.onClick}
              >
                {item.text}
              </button>
            ))}
          </section>
        )}
      </div>
      {(page === "Review" || page === "Star Staff") && (
        <ReviewSidebar items={sidebarItems} />
      )}
      {page === "Review" && <ReviewSection />}
      {page === "Star Staff" && <Star />}
      {page === "user" && <StarUser />}
      {page === "message" && <Message />}
    </main>
  );
};

export default Review;
