import type { BannerProps } from "@/components/types/businessData";
import { useIsExplorePage } from "@/hooks/useExplore";
import { memo } from "react";
import {
  useButtonStyles,
  useEditBanner,
  useParagraphStyles,
} from "../../helpers/bannersHelper";
import { cn } from "@/components/utils/helper";
import { truncateDescription } from "@/components/utils/bannerLayouts";
import { LuArrowUpRight } from "react-icons/lu";

const MemoBannerLayout5 = (props: BannerProps) => {
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
  const { handleEditBanner } = useEditBanner();
  return (
    <>
      <article
        key={banner?._id}
        className="relative flex justify-center shrink-0 max-w-[12rem] w-full md:max-w-[14rem] lg:max-w-[17rem] aspect-square"
        onClick={isExplorePage ? null : () => handleEditBanner(banner || {})}
      >
        <figure className="max-w-[12rem] w-full md:max-w-[14rem] lg:max-w-[17rem] aspect-square rounded-2xl">
          <img
            src={banner?.bannerImage}
            alt="logo"
            className={cn(
              "rounded-xl max-w-[12rem] w-full  md:max-w-[14rem] lg:max-w-[17rem] aspect-square object-cover object-top",
            )}
          />
        </figure>
        <article
          style={{
            background:
              banner?.backgroundColor === "transparent"
                ? "transparent"
                : `linear-gradient(to bottom, ${banner?.backgroundColor} 0%, ${banner?.backgroundColor}00 100%)`,
          }}
          className="absolute top-0 flex flex-col items-start justify-center w-full h-16 p-2 rounded-t-xl"
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
          {/* {layout?.isButton && ( */}
          <div
            style={buttonOutlineStyleTags}
            className="flex items-center border border-1 px-1 py-0.5 text-[0.675rem] text-white rounded-full space-x-0.5 -mr-1"
          >
            <button type="button">{banner?.callToAction || "Explore"}</button>{" "}
            <span className="text-[0.6rem]">
              <LuArrowUpRight />
            </span>
          </div>
          {/* )} */}
        </article>
      </article>
    </>
  );
};

const BannerLayout5 = memo(MemoBannerLayout5);
export default BannerLayout5;
