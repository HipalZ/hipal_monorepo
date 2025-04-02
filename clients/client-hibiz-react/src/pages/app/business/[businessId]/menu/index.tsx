import MemoizedHeader from "@/components/molecules/header";
import useBusinessData from "@/components/store/useBusinessData";
import { routeToDashboard } from "@/components/utils/routes";
import { memo } from "react";
import { useNavigate } from "react-router-dom";
import DishAndCat from "@/assets/dishAdbcat.png";
import Manager from "@/assets/menuManager.png";
import Card from "@/assets/cards/card62.png";
import MenuLayouts from "@/assets/menulayouts.jpg"
import MenuCard from "@/components/atom/menulayouts/MenuCards";

const menuArray = [
  {
    id: 0,
    title: "Menu Layouts",
    subTitle:
      "Choose from a variety of menu layouts to suit your restaurant's style and needs",
    navigate: "select-menu",
    image: MenuLayouts,
  },
  {
    id: 1,
    title: "Dishes and categories",
    subTitle:
      "Organize dishes and categories for efficient menu management and presentation",
    navigate: "dishandcat",
    image: DishAndCat,
  },
  {
    id: 2,
    title: "Menu Manager",
    subTitle:
      "Organize dishes and categories for efficient menu management and presentation",
    navigate: "manager",
    image: Manager,
  },
  {
    id: 3,
    title: "Menu Banners",
    subTitle:
      "Promote what makes your place special across different timings and situations",
    navigate: "menubanners",
    image: Card,
  },
];

const MemoMenu = () => {
  const businessData = useBusinessData((s) => s.businessData);
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(routeToDashboard(businessData?._id as string));
  };
  return (
    <main className="">
      <div className="sticky top-0 z-50 w-full linear_gradient_background">
        <MemoizedHeader
          title="Menu"
          onBack={handleBack}
        />
      </div>
      <section>
        <div className="flex flex-wrap">
          {menuArray.map((menu) => (
            <MenuCard key={menu.id} menu={menu} businessId={businessData?._id || ""} />
          ))}
        </div>
      </section>
    </main>
  );
};
const Menu = memo(MemoMenu);
export default Menu;
