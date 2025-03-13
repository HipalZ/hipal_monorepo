import logoPlaceholder from "@/assets/hisite/logoPlaceholder.png";
import useBusinessData from "@/components/store/useBusinessData";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import { cn } from "@hi/common";
import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  items: { icon: string; text: string; onClick: () => void }[];
}

const MemoiseSidebarPeople: React.FC<SidebarProps> = ({ items }) => {
  const navigate = useNavigate();
  const businessId = useBusinessData((state) => state.businessData?._id);
    const businessLogo = useBusinessData((s) => s?.businessData?.logo);
    const fallbackBusinessLogo = useBusinessData((s) => s?.outletInfo?.logoUrl);

  const goToHome = useCallback(() => {
    navigate(`/app/business/${businessId}`);
  }, [navigate]);

  const { selectedPage } = useHiPeopleStore((state) => ({
    selectedPage: state.selectedPage,
  }));



  return (
    <section className="sidebar linear_gradient_background">
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
      {items.map((item) => (
        <button
        type="button"
          className={cn(
            "sidebar-item flex flex-col items-center",
            selectedPage.toLowerCase() === item.text.toLowerCase()
              ? " !transition-all !bg-[#C3B3F850]"
              : "",
          )}
          key={item.text}
          onClick={item.onClick}
        >
          <span>{item.text}</span>
        </button>
      ))}
    </section>
  );
};

const SidebarPeople = memo(MemoiseSidebarPeople);

export default SidebarPeople;
