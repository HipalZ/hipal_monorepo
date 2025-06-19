import MemoizedHeader from "@/components/molecules/header";
import { routeToMenu } from "@/components/utils/routes";
import { useNavigate, useParams } from "react-router-dom";
import DishAndCat from "@/assets/dishAdbcat.png";
import Manager from "@/assets/menuManager.png";
import Card from "@/assets/cards/card62.png";
import MenuCard from "@/components/atom/menulayouts/MenuCards";
import Kitchen from "@/assets/kitchen.png";
import {
  Breadcrumb as UIBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { useGetMenuLayout } from "@/hooks/useMenuLayout";
import { useGetPosConfig } from "@/hooks/usePosHook.ts";

const menuArray = [
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
  {
    id: 4,
    title: "Kitchen",
    subTitle: "Add Kitchen to your restaurant",
    navigate: "kitchen",
    image: Kitchen,
  },
];

const Menu = () => {
  const { menuId, businessId } = useParams<{
    menuId: string;
    businessId: string;
  }>();
  const { menuLayout } = useGetMenuLayout(menuId as string);
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(routeToMenu(businessId as string));
  };
  const { posConfig } = useGetPosConfig(businessId as string);

  // determine if we should hide the dishes & categories card
  const isPetPooja = posConfig?.posName?.toLowerCase() === "petpooja";
  const filteredMenu = isPetPooja
    ? menuArray.filter((m) => m.id !== 1)
    : menuArray;

  return (
    <main>
      <div className="sticky top-0 z-50 w-full linear_gradient_background">
        <MemoizedHeader title="Menu" onBack={handleBack} />
      </div>
      <div className="px-4 py-2 font-semibold bg-white border-b border-gray-200 ">
        <UIBreadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/app/business/${businessId}/select-menu`}>
                  Menu Layouts
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {menuLayout?.data?.name && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      to={`/app/business/${businessId}/select-menu/${menuId}`}
                      className="max-w-[150px] truncate"
                      title={menuLayout.data.name}
                    >
                      {menuLayout.data.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </UIBreadcrumb>
      </div>
      <section>
        <div className="flex flex-wrap">
          {filteredMenu.map((menu) => (
            <MenuCard key={menu.id} menu={menu} businessId={businessId || ""} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Menu;
