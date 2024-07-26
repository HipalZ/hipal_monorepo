import PlusButton from "@/components/atom/plusButton";
import SubHeader from "@/components/atom/subHeader";
import useBusinessData from "@/components/store/useBusinessData";
import { useExploreStore } from "@/components/store/useExploreStore";
import { cn } from "@/components/utils/helper";
import { memo, type ChangeEvent } from "react";

export interface IProps {
  img: { banner: string; logo: string; footer: string };
  handleImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleBizName?: (e: ChangeEvent<HTMLInputElement>) => void;
}
const MemoExplorePageSection = (props: IProps) => {
  const bizInfo = useExploreStore((s) => s.bizInfo);
  const { img, handleImageChange, handleBizName } = props;
  const { businessData } = useBusinessData((s) => ({
    businessData: s.businessData,
  }));

  return (
    <>
      <section className="mb-4">
        <SubHeader text="Banner" />
        <article
          className={cn(
            "relative rounded-xl h-[18rem] w-full",
            img?.banner?.length > 0
              ? ""
              : " border-dashed border-2 inline-block border-[#8C63FF]",
          )}
        >
          <input
            onClick={() => document.getElementById("bannerInput")?.click()}
            type="file"
            id="bannerInput"
            style={{ display: "none" }}
            onChange={handleImageChange}
            data-type="banner"
          />
          <label
            htmlFor="bannerInput"
            className="flex items-center justify-center w-full h-full overflow-hidden cursor-pointer rounded-xl"
          >
            {img.banner ? (
              <img src={img.banner} alt="Banner" />
            ) : (
              <PlusButton />
            )}
          </label>
        </article>
      </section>
      &nbsp;
      <SubHeader text="Basic Info" />
      <section className="flex items-center justify-between mt-4 space-x-4 md:justify-start">
        <article
          className={cn(
            "shrink-0 relative rounded-xl h-[8rem] w-[8rem]",
            img?.logo?.length > 0
              ? ""
              : " border-dashed border-2 inline-block border-[#8C63FF]",
          )}
        >
          <input
            onClick={() => document.getElementById("logoInput")?.click()}
            type="file"
            id="logoInput"
            style={{ display: "none" }}
            onChange={handleImageChange}
            data-type="logo"
          />
          <label
            htmlFor="logoInput"
            className="flex items-center justify-center w-full h-full overflow-hidden cursor-pointer rounded-xl"
          >
            {img.logo ? <img src={img.logo} alt="Logo" /> : <PlusButton />}
          </label>
        </article>
        <div className="relative">
          <input
            placeholder="Business Name"
            type="text"
            minLength={4}
            maxLength={30}
            value={bizInfo?.name || businessData?.name}
            className="w-full p-2 pr-14 bg-white border border-black rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
            onChange={handleBizName}
          />
          <small className="absolute bottom-2 right-4">
            {bizInfo?.name?.length || businessData?.name?.length}/{30}
          </small>
        </div>
      </section>
    </>
  );
};

const ExplorePageTopSection = memo(MemoExplorePageSection);
export default ExplorePageTopSection;
