import { truncateDescription } from "@/components/utils/bannerLayouts";
import { useIsExplorePage } from "@/hooks/useExplore";
import {
  useButtonStyles,
  useEditBanner,
  useLayoutObject,
  useParagraphStyles,
} from "../../helpers/bannersHelper";
import { cn } from "@/components/utils/helper";
import { LuArrowUpRight } from "react-icons/lu";
import type { BannerProps } from "@/components/types/businessData";
import { memo } from "react";

const MemoBannerLayout4 = (props: BannerProps) => {
  const { banner } = props;
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
  const layout = useLayoutObject(banner?.layout || "");
  const { handleEditBanner } = useEditBanner();
  return (
    <>
      <article
        key={banner?._id}
        className="shrink-0 relative flex justify-center max-w-[12rem] w-full md:max-w-[14rem] lg:max-w-[17rem] aspect-square rounded-2xl"
        onClick={isExplorePage ? null : () => handleEditBanner(banner || {})}
      >
        <figure className="max-w-[12rem] w-full md:max-w-[14rem] lg:max-w-[17rem] aspect-square rounded-2xl">
          <img
            src={banner?.bannerImage}
            alt="logo"
            className={cn(
              "rounded-xl max-w-[12rem] w-full md:max-w-[14rem] lg:max-w-[17rem] aspect-square object-cover object-top",
            )}
          />
        </figure>
        <article
          style={{
            background:
              banner?.backgroundColor === "transparent"
                ? "transparent"
                : `linear-gradient(to bottom, transparent 10%, ${banner?.backgroundColor} 40%, transparent 90%)`,
          }}
          className="bg-black absolute bottom-1/2 translate-y-1/2 max-w-[12rem] w-full md:max-w-[14rem] lg:max-w-[17rem] aspect-square flex flex-col items-center justify-center p-2 rounded-xl h-[7rem]"
        >
          <h1
            style={paragraphPropsStyle}
            className="text-[0.7rem] truncate text-white"
          >
            {banner?.heading ? truncateDescription(banner?.heading) : "Heading"}
          </h1>
          <p
            style={{
              WebkitLineClamp: 2,
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              ...paragraphPropsStyle,
            }}
            className="text-[0.5rem] text-white bg-opacity-50"
          >
            {banner?.paragraph ? truncateDescription(banner?.paragraph) : null}
          </p>
          {layout?.isButton && (
            <div
              style={buttonOutlineStyleTags}
              className="flex items-center border border-1 px-1 py-0.5 text-[0.675rem] text-white rounded-full space-x-0.5 -mr-1"
            >
              <button type="button">{banner?.callToAction || "Explore"}</button>{" "}
              <span className="text-[0.6rem]">
                <LuArrowUpRight />
              </span>
            </div>
          )}
        </article>
      </article>
    </>
  );
};

const BannerLayout4 = memo(MemoBannerLayout4);
export default BannerLayout4;
