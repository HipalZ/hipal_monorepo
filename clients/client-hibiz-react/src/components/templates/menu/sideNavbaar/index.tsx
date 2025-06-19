import logoPlaceholder from "@/assets/hisite/logoPlaceholder.png";
import useBusinessData from "@/components/store/useBusinessData";
import type { MenuPageType } from "@/components/store/useMenuStorage";
import useMenuPageStore from "@/components/store/useMenuStorage";
import { cn } from "@hi/common";
import { memo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface SidebarProps {
  items: { icon?: string; text: string; onClick: () => void }[];
}

const MemoiseSidebar: React.FC<SidebarProps> = ({ items }) => {
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const businessId = useBusinessData((state) => state.businessData?._id);

  const goToHome = useCallback(() => {
    if (hotelId) return navigate(`/app/hotel/${hotelId}`);
    if (businessId) return navigate(`/app/business/${businessId}`);
  }, [navigate, businessId, hotelId]);

  const { selectedPage } = useMenuPageStore((state) => ({
    selectedPage: state.selectedPage,
  }));

  const removeAllUnwanted = useCallback((page: MenuPageType, text: string) => {
    const normalize = (str: string) =>
      str.toLowerCase().replace(/[^a-z0-9]/g, "");
    const isMatch = normalize(page) === normalize(text);
    return isMatch;
  }, []);

  const businessLogo = useBusinessData((s) => s?.businessData?.logo);
  const fallbackBusinessLogo = useBusinessData((s) => s?.outletInfo?.logoUrl);

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
            removeAllUnwanted(selectedPage, item.text)
              ? " !transition-all !bg-[#C3B3F850]"
              : "",
          )}
          key={index}
          onClick={item.onClick}
          onKeyDown={
            item.onClick
              ? (e) => {
                  if (e.key === "Enter") {
                    item.onClick();
                  }
                }
              : undefined
          }
        >
          <span>{item.text}</span>
        </center>
      ))}
    </section>
  );
};

const Sidebar = memo(MemoiseSidebar);

export default Sidebar;
