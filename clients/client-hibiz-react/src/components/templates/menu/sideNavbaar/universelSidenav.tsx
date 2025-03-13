import logoPlaceholder from "@/assets/hisite/logoPlaceholder.png";
import useBusinessData from "@/components/store/useBusinessData";
import { cn } from "@hi/common";
import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  items: { icon?: string; text: string }[];
  selectedNavItem: string;
  changeNav: (str: string) => void;
}

const MemoUniversalNav: React.FC<SidebarProps> = ({
  items,
  selectedNavItem,
  changeNav,
}) => {
  const navigate = useNavigate();
  const businessId = useBusinessData((state) => state.businessData?._id);
  const businessLogo = useBusinessData((s) => s?.businessData?.logo);
  const fallbackBusinessLogo = useBusinessData((s) => s?.outletInfo?.logoUrl);

  const goToHome = useCallback(() => {
    navigate(`/app/business/${businessId}`);
  }, [navigate]);

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

      {items.map((item) => (
        <button
          type="button"
          className={cn(
            "sidebar-item flex flex-col items-center",
            selectedNavItem.toLowerCase() === item.text.toLowerCase()
              ? " !transition-all !bg-[#C3B3F850]"
              : "",
          )}
          key={item.text}
          onClick={() => changeNav(item.text)}
        >
          <span className="capitalize">
            {item.text.split("_").join(" ").toLowerCase()}
          </span>
        </button>
      ))}
    </section>
  );
};

const UniversalNav = memo(MemoUniversalNav);

export default UniversalNav;
