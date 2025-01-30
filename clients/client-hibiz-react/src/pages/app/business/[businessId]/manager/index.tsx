import MemoizedHeader from "@/components/molecules/header";
import useBusinessData from "@/components/store/useBusinessData";
import { memo, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Hi from "@/assets/svg/hi.svg";
import { FaArrowLeft } from "react-icons/fa";
import useMenuPageStore, {
  type MenuPageType,
} from "@/components/store/useMenuStorage";
import Sidebar from "@/components/templates/menu/sideNavbaar";
import { cn } from "@hi/common/src/error-handler";
import PopUp from "@/components/atom/popUp";
import { HiX } from "react-icons/hi";
import Search from "@/components/templates/menu/category/search";
import Filter from "@/components/templates/menu/category/filter";
import EditDish from "@/components/templates/menu/dish/[editDish]/editDish";
import DishesManager from "@/components/templates/manager/dish/dishesManager";
import ListOfParentCategory from "@/components/templates/menu/category/listOfParentCategory";
import ListOfChildCategory from "@/components/templates/menu/category/listOfChildCategories";
import ListOfAddOn from "@/components/templates/menu/addonPage/listOfAddOn";
import AddOnForm from "@/components/templates/menu/addonPage/addOnform";
import CreateCategory from "@/components/templates/menu/category/createCategory";
import CreateDish from "@/components/templates/menu/dish/createDish";
import QuickMenu from "@/components/templates/menu/QuickMenu";

const MemoiseManager = () => {
  const businessData = useBusinessData((s) => s.businessData);

  const {
    selectedPage,
    setIsMenuManager,
    setSelectedPage,
    resetStore,
    editOpenMenu,
    setEditOpenMenu,
    openMenu,
    setOpenMenu,
    isMenuManager,
  } = useMenuPageStore((s) => ({
    selectedPage: s.selectedPage,
    setSelectedPage: s.setSelectedPage,
    editOpenMenu: s.editOpenMenu,
    setEditOpenMenu: s.setEditOpenMenu,
    setSelectedCategory: s.setSelectedCategory,
    openMenu: s.openMenu,
    setOpenMenu: s.setOpenMenu,
    resetStore: s.resetStore,
    resetEditDish: s.resetEditDish,
    isMenuManager: s.isMenuManager,
    setIsMenuManager: s.setIsMenuManager,
  }));
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(`/app/business/${businessData?._id}/menu`);
  };

  const pathname = useLocation().pathname;

  useEffect(() => {
    const isManagerExists = pathname.includes("manager");
    setIsMenuManager(isManagerExists);
  }, []);

  const closeMenu = useCallback(() => {
    resetStore();
    setOpenMenu(false);
  }, [openMenu]);

  const closeEditMenu = useCallback(() => {
    setEditOpenMenu(false);
  }, [editOpenMenu]);

  const sidebarItems = [
    { icon: Hi, text: "Dishes", onClick: () => setSelectedPage("DISHES") },
    {
      icon: Hi,
      text: "Main-category",
      onClick: () => setSelectedPage("MAIN_CATEGORY"),
    },
    {
      icon: Hi,
      text: "Sub-category",
      onClick: () => setSelectedPage("SUB_CATEGORY"),
    },
    { icon: Hi, text: "Add On", onClick: () => setSelectedPage("ADD_ON") },
    { icon: Hi, text: "Quick Menu", onClick: () => setSelectedPage("QUICK_MENU") },
  ];

  const removeAllUnwanted = useCallback((page: MenuPageType, text: string) => {
    const normalize = (str: string) =>
      str.toLowerCase().replace(/[^a-z0-9]/g, "");
    const isMatch = normalize(page) === normalize(text);
    return isMatch;
  }, []);

  return (
    <main>
      <div className="sticky top-0 z-50 w-full">
        <article className="linear_gradient_background">
          <MemoizedHeader
            title={`${selectedPage.split("_").join(" ")}`}
            onBack={handleBack}
            leftIcon={<FaArrowLeft />}
            rightImage={Hi}
            isIconBusinessShow={false}
          />
        </article>
        <section className="absolute flex w-full px-4 space-x-4 overflow-auto text-sm text-nowrap flex-nowrap hide-scrollbar mobile-only">
          {sidebarItems.map((item) => (
            <button
              className={cn(
                "pb-3 pt-4",
                removeAllUnwanted(selectedPage, item.text)
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
        {
          selectedPage !== "QUICK_MENU" && (
            <>
              <Filter />
              <Search />
            </>
          )
        }
      </div>
      <Sidebar items={sidebarItems} />
      <section className="min-h-[100dvh]">
        {selectedPage === "DISHES" && <DishesManager />}

        {selectedPage === "MAIN_CATEGORY" && <ListOfParentCategory />}

        {selectedPage === "SUB_CATEGORY" && <ListOfChildCategory />}

        {selectedPage === "ADD_ON" && <ListOfAddOn />}
        {
          selectedPage === "QUICK_MENU" && isMenuManager && (
            <QuickMenu />
          )
        }
      </section>
      {editOpenMenu && (
        <PopUp show={editOpenMenu} onClose={closeEditMenu} hide>
          <section className="min-h-[90dvh] max-h-[90dvh] lg:min-h-[70dvh] lg:max-h-[70dvh] overflow-y-auto pb-[5rem] hide-scrollbar">
            <button
              className="absolute z-50 p-3 bg-white rounded-full top-6 right-4"
              type="button"
              onClick={closeEditMenu}
            >
              <HiX />
            </button>
            {selectedPage === "DISHES" && <EditDish />}
          </section>
        </PopUp>
      )}

      {openMenu && (
        <PopUp show={openMenu} onClose={closeMenu} hide>
          <section className="min-h-[90dvh] max-h-[90dvh] lg:min-h-[70dvh] lg:max-h-[70dvh] overflow-y-auto pb-[5rem] hide-scrollbar">
            <button
              className="absolute z-50 p-3 bg-white rounded-full top-6 right-4"
              type="button"
              onClick={closeMenu}
            >
              <HiX />
            </button>
            {selectedPage === "DISHES" && <CreateDish />}
            {(selectedPage === "MAIN_CATEGORY" ||
              selectedPage === "SUB_CATEGORY") && <CreateCategory />}
            {selectedPage === "ADD_ON" && <AddOnForm />}
          </section>
        </PopUp>
      )}
    </main>
  );
};

const MenuManager = memo(MemoiseManager);
export default MenuManager;
