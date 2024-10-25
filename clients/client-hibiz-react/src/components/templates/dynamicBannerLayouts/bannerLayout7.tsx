import { memo } from "react";
import pastaDummy from "@/assets/pastaDummy.png";
import { useBannerTemp } from "@/components/store/useBannerTemp";
import { useBannerStore } from "@/components/store/useBannerStore";
import {
  useBannerStyles,
  useLayoutObject,
} from "@/components/helpers/bannersHelper";

const MemoBannerLayout7 = () => {
  const { buttonStyle, paragraphStyle, img } = useBannerTemp((s) => ({
    buttonStyle: s.buttonStyle,
    paragraphStyle: s.paragraphStyle,
    img: s.img,
  }));

  const { selectedBannerType, openPreview } = useBannerStore((s) => ({
    selectedBannerType: s.selectedBannerType,
    openPreview: s.openPreview,
  }));
  const { sizeClasses } = useBannerStyles({
    buttonStyle,
    paragraphStyle,
    openPreview,
    selectedBannerType,
  });
  const layout = useLayoutObject(selectedBannerType);
  return (
    <section
      key={layout?._id}
      className="border border-1 border-[#000] rounded-2xl overflow-hidden"
    >
      <img
        src={img || layout?.image || pastaDummy}
        alt={layout?.title}
        className={`${sizeClasses} aspect-square object-cover`}
      />
    </section>
  );
};

const BannerLayout7 = memo(MemoBannerLayout7);
export default BannerLayout7;
