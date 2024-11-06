import type { BannerProps } from "@/components/types/businessData";
import { truncateDescription } from "@/components/utils/bannerLayouts";
import { cn } from "@/components/utils/helper";
import { useIsExplorePage } from "@/hooks/useExplore";
import { LuArrowUpRight } from "react-icons/lu";
import {
  useButtonStyles,
  useEditBanner,
  useParagraphStyles,
} from "../../helpers/bannersHelper";
import { memo } from "react";

const MemoBannerLayout1 = (props: BannerProps) => {
  const { banner, layout } = props;
  const buttonStyle = {
    color: banner?.buttonColor || "",
    buttonColor: banner?.buttonTextColor || "",
  };
  const paragraphStyle = {
    color: banner?.paragraphColor || "",
  };
  const { buttonStyleTags } = useButtonStyles(buttonStyle);
  const paragraphPropsStyle = useParagraphStyles(paragraphStyle);
  const isExplorePage = useIsExplorePage();
  const { handleEditBanner } = useEditBanner();

  return (
    <>
      <div
        className={cn(
          "flex flex-col shrink-0 relative max-w-[12rem] w-full md:max-w-[14rem] lg:max-w-[17rem] aspect-square rounded-2xl",
        )}
        key={banner?._id}
        onClick={
          isExplorePage ? undefined : () => handleEditBanner(banner || {})
        }
      >
        <article
          key={banner?._id}
          className={cn(
            "max-w-[12rem] w-full md:max-w-[14rem] lg:max-w-[17rem] aspect-square rounded-2xl",
          )}
        >
          <figure>
            <img
              src={banner?.bannerImage}
              alt="logo"
              className={cn(
                "w-full rounded-t-xl object-cover object-top max-w-[12rem] md:max-w-[14rem] lg:max-w-[17rem] aspect-square rounded-2xl",
              )}
            />
          </figure>
        </article>
        <article
          style={{
            background: banner?.backgroundColor || "#ffffff",
          }}
          className={cn(
            "p-2 rounded-b-xl border border-[#000000] max-w-[12rem] w-full md:max-w-[14rem] lg:max-w-[17rem] absolute bottom-0",
          )}
        >
          <div className="flex justify-between ">
            <h1
              style={paragraphPropsStyle}
              className={cn(
                "md:text-[1rem] leading-0 md:leading-5  truncate",
                layout?.isButton ? "w-[70%]" : "w-[100%]",
                isExplorePage
                  ? "text-[0.75rem]"
                  : "text-[0.75rem] md:text-[1rem]",
              )}
            >
              {banner?.heading ?? "Heading"}
            </h1>
            {layout?.isButton && (
              <div
                style={buttonStyleTags}
                className="flex items-center px-2 py-0.5 text-[0.6rem] rounded-full space-x-0.5 scale-75 -mr-1"
              >
                <button type="button">
                  {banner?.callToAction || "Explore"}
                </button>{" "}
                <span className="text-[0.6rem]">
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
            className="text-[0.5rem] leading-3 mt-0.5"
          >
            {banner?.paragraph ? truncateDescription(banner?.paragraph) : null}
          </p>
        </article>
      </div>
    </>
  );
};

const BannerLayout1 = memo(MemoBannerLayout1);
export default BannerLayout1;
