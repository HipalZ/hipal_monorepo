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
import ListOfChildCategory from "@/components/templates/menu/category/listOfChildCategories";
import Search from "@/components/templates/menu/category/search";
import Filter from "@/components/templates/menu/category/filter";
import AlertClosePopup from "@/components/common/alertClosePopup";
import CreateService from "@/components/templates/menu/dish/createService";
import EditService from "@/components/templates/menu/dish/[editDish]/editService";
import ServiceManagerPage from "@/components/templates/manager/dish/serviceManager";
import CreateCatalogue from "@/components/templates/menu/category/createCatelogue";

const MemoizeServicesPageManger = () => {
  const businessData = useBusinessData((s) => s.businessData);
  const {
    selectedPage,
    setSelectedPage,
    openMenu,
    editOpenMenu,
    setEditOpenMenu,
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
    navigate(`/app/business/${businessData?._id}/services`);
  };

  const pathname = useLocation().pathname;

  useEffect(() => {
    const isManagerExists = pathname.includes("serviceManager");
    setIsMenuManager(!isManagerExists);
    console.log("pathname", isManagerExists);
  }, []);

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
    { icon: Hi, text: "services", onClick: () => setSelectedPage("SERVICES") },

    {
      icon: Hi,
      text: "catalogue",
      onClick: () => setSelectedPage("CATALOGUE"),
    },
  ];

  const dynamicHeading = useCallback(() => {
    switch (selectedPage) {
      case "SERVICES":
        return "Services";

      case "CATALOGUE":
        return "Catalogue";

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

  useEffect(() => {
    if (
      selectedPage === "MAIN_CATEGORY" ||
      selectedPage === "SUB_CATEGORY" ||
      selectedPage === "ADD_ON" ||
      selectedPage === "DISHES"
    ) {
      setSelectedPage("SERVICES");
    }
  }, [selectedPage, setSelectedPage]);
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
        {selectedPage === "SERVICES" && <ServiceManagerPage />}

        {selectedPage === "CATALOGUE" && <ListOfChildCategory />}
      </section>

      {editOpenMenu && (
        <PopUp show={editOpenMenu} onClose={closeEditMenu} hide>
          <section className="min-h-[100dvh] max-h-[100dvh] lg:min-h-[70dvh] lg:max-h-[90dvh] overflow-y-auto pb-[5rem] hide-scrollbar">
            {selectedPage !== "ALERT" && (
              <button
                className="absolute z-50 p-3 bg-white rounded-full top-6 right-4"
                type="button"
                onClick={showPopUp}
              >
                <HiX />
              </button>
            )}
            {(selectedPage === "SERVICES" || selectedPage === "DISHES") && (
              <EditService />
            )}
            {selectedPage === "ALERT" && <AlertClosePopup />}
          </section>
        </PopUp>
      )}

      {openMenu && (
        <PopUp show={openMenu} onClose={closeMenu} hide>
          <section className="min-h-[100dvh] max-h-[100dvh] lg:min-h-[70dvh] lg:max-h-[90dvh] overflow-y-auto pb-[5rem] hide-scrollbar">
            {selectedPage !== "ALERT" && (
              <button
                className="absolute z-50 p-3 bg-white rounded-full top-6 right-4"
                type="button"
                onClick={closeMenu}
              >
                <HiX />
              </button>
            )}
            {(selectedPage === "SERVICES" || selectedPage === "DISHES") && (
              <CreateService />
            )}
            {selectedPage === "CATALOGUE" && <CreateCatalogue />}
            {selectedPage === "ALERT" && <AlertClosePopup />}
          </section>
        </PopUp>
      )}
    </main>
  );
};

const ServicesPageManger = memo(MemoizeServicesPageManger);
export default ServicesPageManger;
