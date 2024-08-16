import useBusinessData from "@/components/store/useBusinessData";
import {
  ExplorePages,
  ImageFiles,
  useExploreStore,
} from "@/components/store/useExploreStore";
import { basicInfos } from "@/components/templates/explorePage/explorePageStore";
import {
  cn,
  compressImage,
  handleClick,
  handleImageChange,
} from "@/components/utils/helper";
import {
  lazy,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { CiEdit } from "react-icons/ci";

const PlusButton = lazy(() => import("@/components/atom/plusButton"));
const SubHeader = lazy(() => import("@/components/atom/subHeader"));

const MemoExplorePageSection = () => {
  const {
    bizInfo,
    toggleExplorePages,
    setToggleExplorePages,
    img,
    toggleBizInfo,
    setToggleBizInfo,
    setBizInfo,
    setCropping,
    setShowCropper,
    imageFiles,
    setImageFiles,
  } = useExploreStore((s) => ({
    bizInfo: s.bizInfo,
    toggleExplorePages: s.toggleExplorePages,
    setToggleExplorePages: s.setToggleExplorePages,
    img: s.img,
    toggleBizInfo: s.toggleBizInfo,
    setToggleBizInfo: s.setToggleBizInfo,
    setBizInfo: s.setBizInfo,
    setCropping: s.setCropping,
    setShowCropper: s.setShowCropper,
    imageFiles: s.imageFiles,
    setImageFiles: s.setImageFiles,
  }));

  const handleImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const type = event.target.dataset.type as keyof ImageFiles;
      const file = event.target.files?.[0];
      if (file) {
        compressImage(file, (compressedFile) => {
          const reader = new FileReader();
          reader.readAsDataURL(compressedFile);
          reader.onloadend = () => {
            setCropping({ image: reader.result, type });
            setShowCropper(true);
            setImageFiles({ [type]: compressedFile });
          };
        });
      }
    },
    [imageFiles],
  );

  const handleBizName = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setBizInfo({ ...bizInfo, name: e.target.value });
    },
    [bizInfo],
  );

  const handleBizInfo = useCallback(() => {
    setToggleBizInfo(!toggleBizInfo);
    setToggleExplorePages(ExplorePages.BIZINFO);
  }, [toggleBizInfo, toggleExplorePages]);

  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

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
    <section className="mt-16 md:flex">
      <section className="flex-1 mb-4">
        <SubHeader text="Banner" />
        <article
          className={cn(
            "relative rounded-xl h-[18rem] md:aspect-square",
            img?.banner?.length > 0
              ? ""
              : " border-dashed border-2 inline-block border-[#8C63FF]",
          )}
        >
          <input
            ref={bannerInputRef}
            onClick={(e) => handleClick(e, bannerInputRef)}
            type="file"
            id="bannerInput"
            style={{ display: "none" }}
            onChange={handleImageChange}
            data-type="banner"
          />
          <figure className="w-[320px] h-[320px]">
            <label
              htmlFor="bannerInput"
              className="flex items-center justify-center overflow-hidden cursor-pointer lg:justify-start rounded-xl"
            >
              {img.banner ? (
                <div className="relative w-[320px] h-[320px]">
                  <figure className="w-full h-full">
                    <img
                      src={img.banner}
                      alt="Banner"
                      className="object-cover w-full h-full rounded-2xl"
                    />
                  </figure>
                  <CiEdit className="absolute top-0 right-0 w-8 h-8 p-1 text-black bg-white rounded-full cursor-pointer" />
                </div>
              ) : (
                <PlusButton />
              )}
            </label>
          </figure>
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
              ref={logoInputRef}
              onClick={(e) => handleClick(e, logoInputRef)}
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
              {img.logo ? (
                <div className="relative w-full h-full">
                  <figure className="w-full h-full">
                    <img
                      src={img.logo}
                      alt="Logo"
                      className="object-cover w-full h-full rounded-xl"
                    />
                  </figure>
                  <CiEdit className="absolute top-0 right-0 w-6 h-6 p-1 text-black bg-white rounded-full cursor-pointer" />
                </div>
              ) : (
                <PlusButton />
              )}
            </label>
          </article>
          <div className="relative">
            <input
              placeholder={businessData?.name}
              type="text"
              minLength={4}
              maxLength={30}
              value={bizInfo?.name}
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
            onKeyDown={handleBizInfo}
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
