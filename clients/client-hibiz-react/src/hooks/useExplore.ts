import {
  ExplorePages,
  useExploreStore,
} from "@/components/store/useExploreStore";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export function useIsExplorePage() {
  const { toggleExplorePages } = useExploreStore((s) => ({
    toggleExplorePages: s.toggleExplorePages,
  }));
  const location = useLocation();

  const isExplorePage = useMemo(() => {
    return (
      (location?.pathname.includes("explorePage") &&
        toggleExplorePages === ExplorePages.MAINFORM) ||
      toggleExplorePages === ExplorePages.BIZINFO
    );
  }, [location.pathname, toggleExplorePages]);

  return isExplorePage;
}
