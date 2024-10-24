import MemoizedHeader from "@/components/molecules/header";
import useBusinessData from "@/components/store/useBusinessData";
import { routeToDashboard } from "@/components/utils/routes";
import {
  type ChangeEvent,
  memo,
  startTransition,
  useCallback,
  useEffect,
  useRef,
} from "react";
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
import { useBulkUploadDishes } from "@/hooks/useCategory";
import LoadingSpinner from "@/components/atom/loadingSpinner";

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

  const fileInputRef = useRef(null);

  const { mutate: handleFileUpload, isPending } = useBulkUploadDishes();

  const bulkUpload = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

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

  const dynamicHeading = useCallback(() => {
    switch (selectedPage) {
      case "DISHES":
        return "Dishes";
      case "MAIN_CATEGORY":
        return "Main Category";
      case "SUB_CATEGORY":
        return "Sub Category";
      case "ADD_ON":
        return "Add On";
      default:
        return "";
    }
  }, [selectedPage]);

  const removeAllUnwanted = useCallback((page: MenuPageType, text: string) => {
    const normalize = (str: string) =>
      str.toLowerCase().replace(/[^a-z0-9]/g, "");
    const isMatch = normalize(page) === normalize(text);
    return isMatch;
  }, []);

  if (isPending) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main>
      <div className="sticky top-0 z-50 w-full">
        <article className="linear_gradient_background">
          <MemoizedHeader
            title={dynamicHeading()}
            onBack={handleBack}
            leftIcon={<FaArrowLeft />}
            rightImage={Hi}
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
        <section className="w-full bg-base-100">
          <Filter />
          <Search />
        </section>
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

      <div className="fixed z-50 flex flex-col items-end space-y-4 lg:sticky lg:float-right bottom-6 right-6">
        {selectedPage === "DISHES" && (
          <>
            <button
              onClick={bulkUpload}
              className="z-50 flex items-center h-10 px-4 py-2 text-white bg-black rounded-full"
              type="button"
            >
              <BiPlus size={20} /> Bulk Upload Dishes
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
              }}
              style={{ display: "none" }}
            />
          </>
        )}
        <button
          onClick={openMenuModel}
          className="z-50 flex items-center h-10 px-4 py-2 text-white capitalize bg-black rounded-full"
          type="button"
        >
          <BiPlus size={20} /> {selectedPage?.toLowerCase()}
        </button>
      </div>
    </main>
  );
};

const DishAndCat = memo(MemoizeDishAndCat);
export default DishAndCat;
