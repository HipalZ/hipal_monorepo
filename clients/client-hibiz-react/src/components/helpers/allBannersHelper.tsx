import { useCallback, useMemo } from "react";
import { useBannerStore } from "../store/useBannerStore";
import { ExplorePages, useExploreStore } from "../store/useExploreStore";
import { BannerPage } from "../utils/bannerLayouts";
import { useBannerTemp } from "../store/useBannerTemp";
import { ViewType } from "../types/businessData";

export const useNewBanner = () => {
  const { setBannerPage, setSelectedBanner } = useBannerStore((s) => ({
    setBannerPage: s.setBannerPage,
    setSelectedBanner: s.setSelectedBanner,
  }));

  const { setToggleExplorePages } = useExploreStore((s) => ({
    setToggleExplorePages: s.setToggleExplorePages,
  }));

  /**
   * Usage:
   * - Sets the current banner page to `BannerPage.VIEW`.
   * - Toggles the explore pages to `ExplorePages.BANNERLAYOUTS`.
   * - Resets the selected banner to an empty object.
   */
  const handleNewBanner = useCallback(() => {
    setBannerPage(BannerPage.VIEW);
    setToggleExplorePages(ExplorePages.BANNERLAYOUTS);
    setSelectedBanner({});
  }, [setBannerPage, setSelectedBanner, setToggleExplorePages]);

  return { handleNewBanner };
};

export const useCardClickOperations = () => {
  const {
    view,
    isArrangeMode,
    firstCardIndex,
    setIsArrangeMode,
    setFirstCardIndex,
  } = useBannerTemp((s) => ({
    view: s.view,
    isArrangeMode: s.isArrangeMode,
    firstCardIndex: s.firstCardIndex,
    setIsArrangeMode: s.setIsArrangeMode,
    setFirstCardIndex: s.setFirstCardIndex,
  }));
  const { banners, setBanners, setToggleExplorePages } = useExploreStore(
    (s) => ({
      banners: s.banners,
      setBanners: s.setBanners,
      setToggleExplorePages: s.setToggleExplorePages,
    }),
  );
  // show the filtered banners/layouts based on option filter selected such as button/without button
  const filteredBanners = useMemo(() => {
    if (!Array.isArray(banners)) return [];
    return banners.filter((banner) => {
      return view === ViewType.BANNERS
        ? banner.isPublished
        : !banner.isPublished;
    });
  }, [banners, view]);
  // handle card click to arrange the sequence of the banners
  const handleCardClick = useCallback(
    (index: number) => {
      if (isArrangeMode) {
        if (firstCardIndex === null) {
          setFirstCardIndex(index);
        } else {
          const updatedBanners = [...filteredBanners];
          [updatedBanners[firstCardIndex], updatedBanners[index]] = [
            updatedBanners[index],
            updatedBanners[firstCardIndex],
          ];
          setBanners(updatedBanners);
          setFirstCardIndex(null);
        }
      }
    },
    [
      setBanners,
      isArrangeMode,
      firstCardIndex,
      setFirstCardIndex,
      filteredBanners,
    ],
  );
  // handle arrange sequence to toggle the arrange mode
  const handleArrangeSequence = useCallback(() => {
    setIsArrangeMode(!isArrangeMode);
    setFirstCardIndex(null);
  }, [setIsArrangeMode, isArrangeMode, setFirstCardIndex]);

  // handle navigate to main form
  const handleNavigate = useCallback(() => {
    setToggleExplorePages(ExplorePages.MAINFORM);
  }, [setToggleExplorePages]);

  return {
    handleCardClick,
    filteredBanners,
    handleArrangeSequence,
    handleNavigate,
  };
};

export const useModalOperations = () => {
  const { setSelectedBannerId, setIsModalOpen } = useBannerTemp((s) => ({
    setSelectedBannerId: s.setSelectedBannerId,
    setIsModalOpen: s.setIsModalOpen,
  }));
  // open modal to delete the banner popup
  const openModal = useCallback(
    (id: string) => {
      setSelectedBannerId(id);
      setIsModalOpen(true);
    },
    [setSelectedBannerId, setIsModalOpen],
  );

  // close modal to delete the banner popup
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedBannerId("");
  }, [setIsModalOpen, setSelectedBannerId]);

  return { openModal, closeModal };
};
