import type { BannerProps } from "@/components/types/businessData";
import { useIsExplorePage } from "@/hooks/useExplore";
import {
  useButtonStyles,
  useEditBanner,
  useParagraphStyles,
} from "../../helpers/bannersHelper";
import { memo } from "react";
import { cn } from "@/components/utils/helper";
import {
  BannerType,
  truncateDescription,
} from "@/components/utils/bannerLayouts";
import { LuArrowUpRight } from "react-icons/lu";

const MemoBannerLayout6 = (props: BannerProps) => {
  const { banner, layout } = props;
  const buttonStyle = {
    color: banner?.buttonColor || "",
    buttonColor: banner?.buttonTextColor || "",
  };
  const paragraphStyle = {
    color: banner?.paragraphColor || "",
  };
  const { buttonOutlineStyleTags } = useButtonStyles(buttonStyle);
  const paragraphPropsStyle = useParagraphStyles(paragraphStyle);
  const isExplorePage = useIsExplorePage();
  const { handleEditBanner } = useEditBanner();
  const color =
    layout?._id === BannerType.BANNER_TYPE_12 ? "#678BFF" : "#E03030";
  const patternColor = "#00000050";

  return (
    <section
      key={banner?._id}
      className={cn(
        isExplorePage
          ? " flex-1 w-full h-[12rem] md:h-[14rem] lg:h-[17rem] max-w-[12rem] md:max-w-[14rem] lg:max-w-[17rem] max-h-[12rem] md:max-h-[14rem] lg:max-h-[17rem] aspect-square"
          : "flex-1 max-w-[12rem] md:max-w-[14rem] lg:max-w-[17rem] aspect-square",
      )}
    >
      <article
        className={cn(
          "relative w-full h-full rounded-xl",
          isExplorePage ? "" : " ",
        )}
        onClick={isExplorePage ? null : () => handleEditBanner(banner || {})}
        style={{ backgroundColor: banner?.backgroundColor || color }}
      >
        <figure className="absolute top-2 left-2">
          {layout?.isPattern && <layout.pattern color={patternColor} />}
        </figure>
        <figure className="absolute -rotate-180 bottom-2 right-2">
          {layout?.isPattern && <layout.pattern color={patternColor} />}
        </figure>
        <article className="absolute flex flex-col items-center justify-center w-full p-2 translate-y-1/2 bottom-1/2 rounded-xl">
          <h1
            style={paragraphPropsStyle}
            className="text-[0.7rem] truncate text-white"
          >
            {banner?.heading ? truncateDescription(banner?.heading) : "Heading"}
          </h1>
          <p
            style={{
              WebkitLineClamp: 3,
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              ...paragraphPropsStyle,
            }}
            className="text-[0.5rem] text-white bg-opacity-50 text-justify"
          >
            {banner?.paragraph ? truncateDescription(banner?.paragraph) : null}
          </p>
          {layout?.isButton && (
            <div
              style={buttonOutlineStyleTags}
              className="flex items-center border border-1 px-1 py-0.5 text-[0.675rem] rounded-full space-x-0.5 -mr-1"
            >
              <button type="button">{banner?.callToAction || "Explore"}</button>{" "}
              <span className="text-[0.6rem]">
                <LuArrowUpRight />
              </span>
            </div>
          )}
        </article>
      </article>
    </section>
  );
};

const BannerLayout6 = memo(MemoBannerLayout6);
export default BannerLayout6;
