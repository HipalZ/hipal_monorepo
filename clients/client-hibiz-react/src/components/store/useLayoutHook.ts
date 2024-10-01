import { useMemo } from "react";
import {
  type BannerType,
  bannerLayouts,
  bannerLayouts2,
  bannerLayouts3,
  bannerLayouts4,
  bannerLayouts5,
  bannerLayouts6,
  bannerLayouts7,
} from "@/components/utils/bannerLayouts.ts";

const useLayoutHook = (layoutId: BannerType) => {
  const allLayouts = useMemo(
    () =>
      bannerLayouts.concat(
        bannerLayouts2,
        bannerLayouts3,
        bannerLayouts4,
        bannerLayouts5,
        bannerLayouts6,
        bannerLayouts7,
      ),
    [],
  );

  const getLayoutFlags = (layoutId: BannerType) => {
    const layout = allLayouts.find((l) => l._id === layoutId);

    if (!layout) {
      return {
        isButton: false,
        isPattern: false,
        onlyImage: false,
      };
    }

    return {
      isButton: !!layout.isButton,
      isPattern: !!layout.isPattern,
      onlyImage: !!layout.onlyImage,
    };
  };

  const layoutFlags = useMemo(
    () => getLayoutFlags(layoutId),
    [layoutId, allLayouts],
  );

  return layoutFlags;
};

export default useLayoutHook;
