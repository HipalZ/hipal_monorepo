import {
  useBannerStyles,
  useLayoutObject,
} from "@/components/helpers/bannersHelper";
import { useBannerStore } from "@/components/store/useBannerStore";
import { useBannerTemp } from "@/components/store/useBannerTemp";
import { truncateDescription } from "@/components/utils/bannerLayouts";
import { memo } from "react";
import { LuArrowUpRight } from "react-icons/lu";
import pastaDummy from "@/assets/pastaDummy.png";

const MemoBannerLayouts1 = () => {
  const {
    buttonStyle,
    callToAction,
    heading,
    img,
    paragraph,
    paragraphStyle,
    selectedColor,
  } = useBannerTemp((s) => ({
    buttonStyle: s.buttonStyle,
    callToAction: s.callToAction,
    heading: s.heading,
    img: s.img,
    paragraph: s.paragraph,
    paragraphStyle: s.paragraphStyle,
    selectedColor: s.selectedColor,
  }));

  const { selectedBannerType, openPreview } = useBannerStore((s) => ({
    selectedBannerType: s.selectedBannerType,
    openPreview: s.openPreview,
  }));
  const {
    buttonStyleTags,
    buttonClassNames,
    arrowButtonStyles,
    headingTextStyle,
    paragraphTextStyle,
    paragraphPropsStyle,
  } = useBannerStyles({
    buttonStyle,
    paragraphStyle,
    openPreview,
    selectedBannerType,
  });
  const layout = useLayoutObject(selectedBannerType);
  return (
    <div
      className={`flex flex-col ${
        openPreview ? "w-[20rem] h-[25rem]" : "md:w-[25rem] md:h-[25rem]"
      }`}
      key={layout?._id}
    >
      <article key={layout?._id}>
        <figure
          className={`w-full rounded-2xl ${
            openPreview ? "w-[20rem] h-[17rem]" : "md:w-[25rem] md:h-[18rem]"
          }`}
        >
          <img
            src={img || layout?.image || pastaDummy}
            alt={layout?.title}
            className={`rounded-t-xl w-[14rem] h-[10rem] shadow-xl object-cover ${
              openPreview ? "w-[20rem] h-[17rem]" : "md:w-[25rem] md:h-[18rem]"
            }`}
          />
        </figure>
        <article
          style={{
            background:
              selectedColor?.bgColor === "transparent"
                ? "transparent"
                : `linear-gradient(137.02deg, ${
                    selectedColor?.bgColor || "black"
                  }80 1.64%, ${selectedColor?.bgColor || "black"}30 98.36%)`,
          }}
          className={`w-full flex flex-col justify-center rounded-b-xl max-w-[14rem] boxShadowCard border border-1 border-black px-2 py-0.5 ${
            openPreview
              ? "max-w-[20rem] max-h-[7rem] h-[7rem] px-3 pt-2"
              : "md:w-[25rem] md:max-w-[25rem] md:h-[7rem] h-[3.5rem]"
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <h1
              style={paragraphPropsStyle}
              className={`${headingTextStyle} truncate`}
            >
              {heading ? heading : "Heading"}
            </h1>
            {layout?.isButton && (
              <div
                style={buttonStyleTags}
                className={`${buttonClassNames} mt-0.5 pl-2 py-1`}
              >
                <button type="button">{callToAction || "Explore"}</button>{" "}
                <span className={arrowButtonStyles}>
                  <LuArrowUpRight />
                </span>
              </div>
            )}
          </div>
          <p
            style={{
              WebkitLineClamp: 2,
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              ...paragraphPropsStyle,
            }}
            className={`${paragraphTextStyle}`}
          >
            {paragraph ? truncateDescription(paragraph) : layout?.paragraph}
          </p>
        </article>
      </article>
    </div>
  );
};

const BannerLayouts1 = memo(MemoBannerLayouts1);
export default BannerLayouts1;
