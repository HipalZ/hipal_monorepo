import PlusButton from "@/components/atom/plusButton";
import SubHeader from "@/components/atom/subHeader";
import useBusinessData from "@/components/store/useBusinessData";
import { useExploreStore } from "@/components/store/useExploreStore";
import type { BasicInfo } from "@/components/types/businessData";
import { cn } from "@/components/utils/helper";
import { memo, useEffect, useState, type ChangeEvent } from "react";

export interface IProps {
  img: { banner: string; logo: string; footer: string };
  handleImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleBizName?: (e: ChangeEvent<HTMLInputElement>) => void;
  handleBizInfo: () => void;
  basicInfos: BasicInfo[];
}
const MemoExplorePageSection = (props: IProps) => {
  const bizInfo = useExploreStore((s) => s.bizInfo);
  const { img, handleImageChange, handleBizName, handleBizInfo, basicInfos } =
    props;
  const { businessData } = useBusinessData((s) => ({
    businessData: s.businessData,
  }));
  const [bizInfoFilled, setBizInfoFilled] = useState({
    description: false,
    phone: false,
    amenities: false,
    tags: false,
  });

  useEffect(() => {
    if (bizInfo) {
      setBizInfoFilled({
        description: !!bizInfo.description && bizInfo.description.length > 0,
        phone: !!bizInfo.phone && bizInfo.phone.length > 0,
        amenities:
          Array.isArray(bizInfo.amenities) && !!bizInfo.amenities.length,
        tags: Array.isArray(bizInfo.tags) && !!bizInfo.tags.length,
      });
    }
  }, [bizInfo]);

  return (
    <section className="md:flex">
      <section className="flex-1 mb-4">
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
            className="flex items-center justify-center overflow-hidden cursor-pointer lg:justify-start rounded-xl"
          >
            {img.banner ? (
              <figure className="w-[320px] h-[320px]">
                <img src={img.banner} alt="Banner" className="rounded-2xl" />
              </figure>
            ) : (
              <PlusButton />
            )}
          </label>
        </article>
      </section>
      &nbsp;
      <section className="flex-1 lg:space-y-10">
        <SubHeader text="Basic Info" />
        <section className="flex items-center justify-between flex-1 space-x-4 md:justify-start">
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
        <section className="mt-4 mb-2">
          <SubHeader text="Basic Information" />
          <article
            onClick={handleBizInfo}
            className="flex flex-wrap gap-4 p-2 mt-4 bg-white rounded-xl"
          >
            {basicInfos.map((info) => {
              const isFilled = bizInfoFilled[info?.text?.toLowerCase()];
              return (
                <div
                  key={info._id}
                  className={`${
                    isFilled ? "border-green-500" : "border-black"
                  } border border-1 border-dashed p-2 rounded-lg`}
                >
                  <span
                    className={`${isFilled ? "text-green-500" : "text-black"}`}
                  >
                    {isFilled ? "\u2713" : "\u26A0"}&nbsp;{info.text}
                  </span>
                </div>
              );
            })}
          </article>
        </section>
      </section>
    </section>
  );
};

const ExplorePageTopSection = memo(MemoExplorePageSection);
export default ExplorePageTopSection;
