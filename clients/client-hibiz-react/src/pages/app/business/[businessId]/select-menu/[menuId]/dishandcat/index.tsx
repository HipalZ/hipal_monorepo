import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { BiPlus } from "react-icons/bi";
import { FaArrowLeft } from "react-icons/fa";
import { HiX } from "react-icons/hi";
import { useLocation, useNavigate, useParams } from "react-router-dom";

// Components
import LoadingSpinner from "@/components/atom/loadingSpinner";
import PopUp from "@/components/atom/popUp";
import AlertClosePopup from "@/components/common/alertClosePopup";
import MemoizedHeader from "@/components/molecules/header";
import AddOnForm from "@/components/templates/menu/addonPage/addOnform";
import ListOfAddOn from "@/components/templates/menu/addonPage/listOfAddOn";
import CreateCategory from "@/components/templates/menu/category/createCategory";
import Filter from "@/components/templates/menu/category/filter";
import ListOfChildCategory from "@/components/templates/menu/category/listOfChildCategories";
import ListOfParentCategory from "@/components/templates/menu/category/listOfParentCategory";
import Search from "@/components/templates/menu/category/search";
import EditDish from "@/components/templates/menu/dish/[editDish]/editDish";
import CreateDish from "@/components/templates/menu/dish/createDish";
import ListOfDishes from "@/components/templates/menu/dish/dishesList";
import Sidebar from "@/components/templates/menu/sideNavbaar";

// Hooks and utilities
import { MenuType } from "@/components/store/useMenuCreationStore";
import useMenuPageStore, {
  type MenuPageType,
} from "@/components/store/useMenuStorage";
import { useBulkUploadDishes } from "@/hooks/useCategory";
import { useGetMenuLayout } from "@/hooks/useMenuLayout";
import { cn } from "@hi/common/src/error-handler";
// UI Components
import BulkUploadModal from "@/components/templates/menu/dish/BulkUploadModal.tsx";

const MemoizeDishAndCat = () => {
  const navigate = useNavigate();
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

  const selectedPage = useMenuPageStore((s) => s.selectedPage);
  const setSelectedPage = useMenuPageStore((s) => s.setSelectedPage);
  const setSelectedCategory = useMenuPageStore((s) => s.setSelectedCategory);
  const openMenu = useMenuPageStore((s) => s.openMenu);
  const setOpenMenu = useMenuPageStore((s) => s.setOpenMenu);
  const editOpenMenu = useMenuPageStore((s) => s.editOpenMenu);
  const setEditOpenMenu = useMenuPageStore((s) => s.setEditOpenMenu);
  const resetStore = useMenuPageStore((s) => s.resetStore);
  const resetEditDish = useMenuPageStore((s) => s.resetEditDish);
  const setIsMenuManager = useMenuPageStore((s) => s.setIsMenuManager);
  const setTempPage = useMenuPageStore((s) => s.setTempPage);

  // File upload hooks
  const { mutate: handleFileUpload, isPending } = useBulkUploadDishes();

  // URL params and location
  const params = useParams<{ businessId?: string; menuId?: string }>();
  const { businessId, menuId } = params;
  const { isLoading, menuLayout } = useGetMenuLayout(menuId as string);
  const pathname = useLocation().pathname;

  const isHierarchicalMenu = useMemo(() => {
    if (isLoading || !menuLayout?.data) return true;
    return menuLayout.data.menuType === MenuType.MAIN_SUB_DISH;
  }, [isLoading, menuLayout]);

  // Initialize page on component mount
  useEffect(() => {
    const isManagerExists = pathname.includes("dishandcat");
    setIsMenuManager(!isManagerExists);
    setSelectedPage("DISHES");
  }, [pathname, setIsMenuManager, setSelectedPage]);

  // Open bulk upload modal
  const bulkUpload = useCallback(() => {
    setShowBulkUploadModal(true);
  }, []);

  // Handle file upload from modal
  const handleModalFileUpload = useCallback(
    (file: File) => {
      handleFileUpload(file);
      // Modal will be closed by the hook on success
    },
    [handleFileUpload],
  );

  // Open menu creation modal
  const openMenuModel = useCallback(() => {
    resetStore();
    if (selectedPage === "MAIN_CATEGORY") {
      setSelectedCategory("MAIN_CATEGORY");
    } else if (selectedPage === "SUB_CATEGORY") {
      setSelectedCategory("SUB_CATEGORY");
    }
    setOpenMenu(true);
    resetEditDish();
  }, [
    selectedPage,
    resetStore,
    resetEditDish,
    setSelectedCategory,
    setOpenMenu,
  ]);

  // Close menu modal with confirmation
  const closeMenu = useCallback(() => {
    setTempPage(selectedPage);
    setSelectedPage("ALERT");
  }, [selectedPage, setSelectedPage, setTempPage]);

  // Close edit menu modal
  const closeEditMenu = useCallback(() => {
    setEditOpenMenu(false);
  }, [setEditOpenMenu]);

  // Show confirmation popup
  const showPopUp = useCallback(() => {
    setTempPage(selectedPage);
    setSelectedPage("ALERT");
  }, [setSelectedPage, setTempPage, selectedPage]);

  // Generate sidebar items based on menu type
  const sidebarItems = useMemo(() => {
    const items = [
      { text: "Dishes", onClick: () => setSelectedPage("DISHES") },
      {
        text: "Sub-category",
        onClick: () => setSelectedPage("SUB_CATEGORY"),
      },
      { text: "Add On", onClick: () => setSelectedPage("ADD_ON") },
    ];

    // Only include Main-category for hierarchical menus
    if (isHierarchicalMenu) {
      items.splice(1, 0, {
        text: "Main-category",
        onClick: () => setSelectedPage("MAIN_CATEGORY"),
      });
    }

    return items;
  }, [isHierarchicalMenu, setSelectedPage]);

  // Dynamic heading based on selected page
  function dynamicHeading() {
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
  }

  // Helper to check if a page matches the selected page
  const isPageSelected = useCallback((page: MenuPageType, text: string) => {
    const normalize = (str: string) =>
      str.toLowerCase().replace(/[^a-z0-9]/g, "");
    return normalize(page) === normalize(text);
  }, []);

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate(`/app/business/${businessId}/select-menu/${menuId}`);
  }, [businessId, menuId, navigate]);

  // Show loading spinner while data is loading
  if (isPending || isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <main>
      <div className="sticky top-0 z-50 w-full">
        {/* Header */}
        <article className="linear_gradient_background">
          <MemoizedHeader
            title={dynamicHeading()}
            leftIcon={<FaArrowLeft />}
            onBack={handleBack}
          />
        </article>

        {/* Mobile navigation */}
        <section className="mobile-only absolute w-full space-x-4 px-4 text-sm">
          {sidebarItems.map((item) => (
            <button
              className={cn(
                "pb-3 pt-4",
                isPageSelected(selectedPage, item.text)
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

        {/* Search and filter */}
        <section className="bg-base-100 h-[3rem] w-full">
          <Filter />
          <Search />
        </section>
      </div>

      {/* Sidebar for desktop */}
      <Sidebar items={sidebarItems} />

      {/* Main content area */}
      <section className="min-h-[100dvh]">
        {selectedPage === "DISHES" && <ListOfDishes />}
        {selectedPage === "MAIN_CATEGORY" && isHierarchicalMenu && (
          <ListOfParentCategory />
        )}
        {selectedPage === "SUB_CATEGORY" && <ListOfChildCategory />}
        {selectedPage === "ADD_ON" && <ListOfAddOn />}
      </section>

      {/* Edit popup */}
      {editOpenMenu && (
        <PopUp show={editOpenMenu} onClose={closeEditMenu} hide>
          <section className="hide-scrollbar max-h-[100dvh] min-h-[100dvh] overflow-y-auto pb-[5rem] lg:max-h-[90dvh] lg:min-h-[70dvh]">
            {selectedPage !== "ALERT" && (
              <button
                className="absolute right-4 top-6 z-50 rounded-full bg-white p-3"
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

      {/* Create popup */}
      {openMenu && (
        <PopUp show={openMenu} onClose={closeMenu} hide>
          <section className="hide-scrollbar max-h-[100dvh] min-h-[100dvh] overflow-y-auto pb-[5rem] lg:max-h-[90dvh] lg:min-h-[70dvh]">
            {selectedPage !== "ALERT" && (
              <button
                className="absolute right-4 top-6 z-50 rounded-full bg-white p-3"
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

      {/* Action buttons */}
      <div
        className={`${
          selectedPage === "MAIN_CATEGORY" ? "bottom-16" : "bottom-6"
        } fixed right-6 z-50 flex flex-col items-end space-y-4 lg:sticky lg:bottom-6 lg:float-right`}
      >
        {selectedPage === "DISHES" && (
          <>
            <button
              onClick={bulkUpload}
              className="z-50 flex h-10 items-center rounded-full bg-black px-4 py-2 text-white"
              type="button"
            >
              <BiPlus size={20} /> Bulk Upload Dishes
            </button>
          </>
        )}
        <button
          onClick={openMenuModel}
          className="z-50 flex h-10 items-center rounded-full bg-black px-4 py-2 capitalize text-white"
          type="button"
        >
          <BiPlus size={20} /> {selectedPage?.toLowerCase()}
        </button>
      </div>

      {/* Bulk upload modal */}
      {showBulkUploadModal && (
        <BulkUploadModal
          onClose={() => setShowBulkUploadModal(false)}
          onUpload={handleModalFileUpload}
          isLoading={isPending}
        />
      )}
    </main>
  );
};

const DishAndCat = memo(MemoizeDishAndCat);
export default DishAndCat;
