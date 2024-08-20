import logoPlaceholder from "@/assets/hisite/logoPlaceholder.png";
import useBusinessData from "@/components/store/useBusinessData";
import type { MenuPageType } from "@/components/store/useMenuStorage";
import useMenuPageStore from "@/components/store/useMenuStorage";
import { cn } from "@hi/common";
import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  items: { icon: string; text: string; onClick: () => void }[];
}

const MemoiseSidebar: React.FC<SidebarProps> = ({ items }) => {
  const navigate = useNavigate();
  const businessId = useBusinessData((state) => state.businessData?._id);

  const goToHome = useCallback(() => {
    navigate(`/app/business/${businessId}`);
  }, [navigate]);

  const { selectedPage } = useMenuPageStore((state) => ({
    selectedPage: state.selectedPage,
  }));

  const removeAllUnwanted = useCallback((page: MenuPageType, text: string) => {
    const normalize = (str: string) =>
      str.toLowerCase().replace(/[^a-z0-9]/g, "");
    const isMatch = normalize(page) === normalize(text);
    return isMatch;
  }, []);

  return (
    <section className="sidebar">
      <center onClick={goToHome} className="mt-8 mb-4 cursor-pointer">
        <img src={logoPlaceholder} alt="logo placeholder" />
        <span>Home</span>
      </center>
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
        >
          <span>{item.text}</span>
        </center>
      ))}
    </section>
  );
};

const Sidebar = memo(MemoiseSidebar);

export default Sidebar;
