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

  const goToHome = useCallback(() => {
    navigate(`/app/business/${businessId}`);
  }, [navigate]);

  const { selectedPage } = useHiPeopleStore((state) => ({
    selectedPage: state.selectedPage,
  }));



  return (
    <section className="sidebar">
      <button type="button" onClick={goToHome} className="flex flex-col items-center mt-8 mb-4 text-center cursor-pointer">
        <img src={logoPlaceholder} alt="logo placeholder" />
        <span>Home</span>
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
          <img src={item.icon} alt={item.text} />
          <span>{item.text}</span>
        </button>
      ))}
    </section>
  );
};

const SidebarPeople = memo(MemoiseSidebarPeople);

export default SidebarPeople;
