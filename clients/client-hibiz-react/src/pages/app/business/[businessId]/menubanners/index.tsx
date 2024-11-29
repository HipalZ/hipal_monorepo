import MemoizedHeader from "@/components/molecules/header";
import { FaArrowLeft } from "react-icons/fa";
import Hi from "@/assets/svg/hi.svg";
import MenuBannerPreview from "@/components/templates/menuBanner/MenuBannerPreview";
import { useMenuBanner } from "@/components/store/useMenuBanners";
import AddDishesToMenuBanner from "@/components/templates/menuBanner/addDishesToMenuBanner";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LinkDishes from "@/components/templates/menuBanner/linkDishes";
import EmblaCarouselPreview from "@/components/templates/embla/emblaCarouselForPreviw";
import type { EmblaOptionsType } from "embla-carousel";

const OPTIONS: EmblaOptionsType = { dragFree: true, loop: true };

const MenuManager = () => {
  const {
    menuBannerType,
    setMenuBannerType,
    searchItem,
    setSearchItem,
    selectedDishes,
    headerTitle,
  } = useMenuBanner((s) => ({
    menuBannerType: s.menuBannerType,
    setMenuBannerType: s.setMenuBannerType,
    searchItem: s.searchItem,
    setSearchItem: s.setSearchItem,
    setShowSelectAll: s.setShowSelectAll,
    showSelectAll: s.showSelectAll,
    selectedDishes: s.selectedDishes,
    headerTitle: s.headerTitle,
  }));

  const navigate = useNavigate();

  const goBack = useCallback(() => {
    switch (menuBannerType) {
      case "LIVE":
        return setMenuBannerType("CREATE");
      case "LINK_DISHES":
        return setMenuBannerType("CREATE");
      case "CREATE":
        return setMenuBannerType("PREVIEW");
      case "PREVIEW":
        return navigate(-1);
    }
  }, [menuBannerType]);

  const dynamicHeaderTitle = useCallback(() => {
    switch (menuBannerType) {
      case "LIVE":
        return "Live Preview";
      case "LINK_DISHES":
        return "Link Dishes";
      case "CREATE":
        return "Manage Banner";
      case "PREVIEW":
        return "Menu Banner";
    }
  }, [menuBannerType]);
  return (
    <main>
      {" "}
      <section className="sticky top-0 !z-[100] w-full bg-[#f4f4f4]">
        <MemoizedHeader
          title={dynamicHeaderTitle()}
          leftIcon={<FaArrowLeft />}
          rightImage={Hi}
          onBack={goBack}
          rightButton={
            menuBannerType === "LINK_DISHES" ? (
              <h3 className="text-xl font-bold">
                {selectedDishes?.length || 0}/7
              </h3>
            ) : undefined
          }
        />
        {menuBannerType === "LINK_DISHES" && (
          <section className="flex items-center justify-between gap-4 pb-2 mx-4">
            <input
              type="search"
              placeholder="Search items..."
              className="w-full py-2 border rounded-md"
              value={searchItem}
              onChange={(e) => setSearchItem(e.target.value)}
            />
          </section>
        )}
      </section>
      {menuBannerType === "PREVIEW" && <MenuBannerPreview />}
      {menuBannerType === "CREATE" && <AddDishesToMenuBanner />}
      {menuBannerType === "LINK_DISHES" && <LinkDishes />}
      {menuBannerType === "LIVE" && (
        <section className="flex items-center justify-center w-full">
          <section className="flex flex-col items-center justify-center w-full max-w-[30rem] pt-8 overflow-hidden pb-6 mt-4 bg-[#f2544450] relative">
            <h1 className="absolute text-4xl text-center text-black -translate-x-1/2 top-2 bungee-inline left-1/2">
              <span className="opacity-50">{headerTitle}</span>
            </h1>
            <div className="absolute w-full bg-[#f2544480] rounded-full -top-[35%] h-2/3" />
            <EmblaCarouselPreview options={OPTIONS} />
          </section>
        </section>
      )}
    </main>
  );
};

export default MenuManager;
