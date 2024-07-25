import MemoizedHeader from "@/components/molecules/header";
import useBusinessData from "@/components/store/useBusinessData";
import { routeToDashboard } from "@/components/utils/routes";
import { memo, startTransition, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Hi from "@/assets/svg/hi.svg";
import { FaArrowLeft } from "react-icons/fa";
import useMenuPageStore, {
  type MenuPageType,
} from "@/components/store/useMenuStorage";
import Sidebar from "@/components/templates/menu/sideNavbaar";
import { cn } from "@hi/common/src/error-handler";
import { BiPlus } from "react-icons/bi";
import PopUp from "@/components/atom/popUp";
import CreateCategory from "@/components/templates/menu/category/createCategory";
import { HiX } from "react-icons/hi";
import ListOfParentCategory from "@/components/templates/menu/category/listOfParentCategory";
import ListOfChildCategory from "@/components/templates/menu/category/listOfChildCategories";
import Search from "@/components/templates/menu/category/search";
import Filter from "@/components/templates/menu/category/filter";
import CreateDish from "@/components/templates/menu/dish/createDish";
import ListOfDishes from "@/components/templates/menu/dish/dishesList";
import EditDish from "@/components/templates/menu/dish/[editDish]/editDish";
import AddOnForm from "@/components/templates/menu/addonPage/addOnform";
import ListOfAddOn from "@/components/templates/menu/addonPage/listOfAddOn";
import AlertClosePopup from "@/components/common/alertClosePopup";

const MemoizeDishAndCat = () => {
  const businessData = useBusinessData((s) => s.businessData);
  const {
    selectedPage,
    setSelectedPage,
    openMenu,
    setOpenMenu,
    resetStore,
    editOpenMenu,
    setEditOpenMenu,
    setSelectedCategory,
    resetEditDish,
    setIsMenuManager,
    showAlertPopUp,
    setTempPage,
  } = useMenuPageStore((s) => ({
    selectedPage: s.selectedPage,
    setSelectedPage: s.setSelectedPage,
    setSelectedCategory: s.setSelectedCategory,
    openMenu: s.openMenu,
    setOpenMenu: s.setOpenMenu,
    editOpenMenu: s.editOpenMenu,
    setEditOpenMenu: s.setEditOpenMenu,
    resetStore: s.resetStore,
    search: s.search,
    setSearch: s.setSearch,
    resetEditDish: s.resetEditDish,
    setIsMenuManager: s.setIsMenuManager,
    showAlertPopUp: s.showAlertPopUp,
    setTempPage: s.setTempPage,
  }));

  const navigate = useNavigate();
  const handleBack = () => {
    startTransition(() => {
      navigate(routeToDashboard(businessData?._id as string));
    });
  };

  const pathname = useLocation().pathname;

  useEffect(() => {
    const isManagerExists = pathname.includes("dishandcat");
    setIsMenuManager(!isManagerExists);
  }, []);

  const openMenuModel = useCallback(() => {
    resetStore();
    if (selectedPage === "MAIN_CATEGORY") {
      setSelectedCategory("MAIN_CATEGORY");
    } else if (selectedPage === "SUB_CATEGORY") {
      setSelectedCategory("SUB_CATEGORY");
    }
    setOpenMenu(true);
    resetEditDish();
  }, [selectedPage]);

  const closeMenu = useCallback(() => {
    setTempPage(selectedPage);
    setSelectedPage("ALERT");
  }, [openMenu]);

  const closeEditMenu = useCallback(() => {
    setEditOpenMenu(false);
  }, [editOpenMenu]);

  const showPopUp = useCallback(() => {
    setTempPage(selectedPage);
    setSelectedPage("ALERT");
  }, [showAlertPopUp]);

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
            centerImage={Hi}
            rightImage={Hi}
            isIconBusinessShow={false}
          />
        </article>
        <section className="absolute w-full px-4 space-x-4 text-sm mobile-only">
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
        <Filter />
        <Search />
      </div>
      <Sidebar items={sidebarItems} />
      <section className="min-h-[100dvh]">
        {selectedPage === "DISHES" && <ListOfDishes />}

        {selectedPage === "MAIN_CATEGORY" && <ListOfParentCategory />}

        {selectedPage === "SUB_CATEGORY" && <ListOfChildCategory />}

        {selectedPage === "ADD_ON" && <ListOfAddOn />}
      </section>

      {editOpenMenu && (
        <PopUp show={editOpenMenu} onClose={closeEditMenu} hide>
          <section className="min-h-[90dvh] max-h-[90dvh] lg:min-h-[70dvh] lg:max-h-[70dvh] overflow-y-auto pb-[5rem] hide-scrollbar">
            {selectedPage !== "ALERT" && (
              <button
                className="absolute z-50 p-3 bg-white rounded-full top-6 right-4"
                type="button"
                onClick={showPopUp}
              >
                <HiX />
              </button>
            )}
            {selectedPage === "DISHES" && <EditDish />}
            {selectedPage === "ALERT" && <AlertClosePopup />}
          </section>
        </PopUp>
      )}

      {openMenu && (
        <PopUp show={openMenu} onClose={closeMenu} hide>
          <section className="min-h-[90dvh] max-h-[90dvh] lg:min-h-[70dvh] lg:max-h-[70dvh] overflow-y-auto pb-[5rem] hide-scrollbar">
            {selectedPage !== "ALERT" && (
              <button
                className="absolute z-50 p-3 bg-white rounded-full top-6 right-4"
                type="button"
                onClick={closeMenu}
              >
                <HiX />
              </button>
            )}
            {selectedPage === "DISHES" && <CreateDish />}
            {(selectedPage === "MAIN_CATEGORY" ||
              selectedPage === "SUB_CATEGORY") && <CreateCategory />}
            {selectedPage === "ADD_ON" && <AddOnForm />}
            {selectedPage === "ALERT" && <AlertClosePopup />}
          </section>
        </PopUp>
      )}

      <button
        onClick={openMenuModel}
        className="fixed z-50 flex items-center px-4 py-2 text-white bg-black rounded-full lg:sticky lg:float-right bottom-6 right-6"
        type="button"
      >
        <BiPlus size={32} /> {selectedPage}
      </button>
    </main>
  );
};

const DishAndCat = memo(MemoizeDishAndCat);
export default DishAndCat;
