import { memo } from "react";
import SubHeader from "@/components/atom/subHeader";
import PlusButton from "@/components/atom/plusButton";
import { useExploreStore } from "@/components/store/useExploreStore";
import type { IBannerPayload } from "@/components/types/businessData";
import CreatedBannersLayouts from "./createdBannerLayouts";

interface IProps {
  handleNavigation: () => void;
}
const MemoBannerSection = (props: IProps) => {
  const { handleNavigation } = props;
  const banners = useExploreStore((s) => s.banners);

  return (
    <section className="mb-4">
      <SubHeader text="Banners" />
      <article
        onClick={handleNavigation}
        className="flex items-center gap-4 p-2 overflow-x-auto bg-white rounded-lg flex-nowrap"
      >
        {banners?.map((banner: IBannerPayload, index: number) => {
          return (
            <CreatedBannersLayouts
              key={`banner?._id+${index.toString()}`}
              selectedLayout={banner?.layout || ""}
              heading={banner?.heading || ""}
              paragraph={banner?.paragraph || ""}
              callToAction={banner?.callToAction || ""}
              img={{ logo: banner?.bannerImage || "" }}
              selectedColor={{
                bgColor: banner?.backgroundColor || "",
                textColor: banner?.backgroundColor || "",
              }}
              paragraphStyle={{ color: banner?.paragraphColor || "" }}
              buttonStyle={{
                color: banner?.buttonColor || "",
                buttonColor: banner?.buttonTextColor || "",
              }}
            />
          );
        })}
        <div className="ml-2 aspect-square shrink-0 relative rounded-xl h-[12rem] lg:h-[12rem] border-dashed border-2 border-[#8C63FF]">
          <label className="flex items-center justify-center w-full h-full overflow-hidden cursor-pointer rounded-xl">
            <PlusButton />
          </label>
        </div>
      </article>
    </section>
  );
};

const BannerSection = memo(MemoBannerSection);
export default BannerSection;
