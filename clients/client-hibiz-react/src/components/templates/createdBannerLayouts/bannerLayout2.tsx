import type { BannerProps } from "@/components/types/businessData";
import { truncateDescription } from "@/components/utils/bannerLayouts";
import { useIsExplorePage } from "@/hooks/useExplore";
import { LuArrowUpRight } from "react-icons/lu";
import {
  useButtonStyles,
  useEditBanner,
  useParagraphStyles,
} from "../../helpers/bannersHelper";
import { cn } from "@/components/utils/helper";
import { memo } from "react";

const MemoBannerLayout2 = (props: BannerProps) => {
  const { banner } = props;
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
      <section
        key={banner?._id}
        className="shrink-0  max-w-[12rem] w-full md:max-w-[14rem] lg:max-w-[17rem] aspect-square rounded-2x"
      >
        <button
          type="button"
          className="relative flex text-left justify-center  max-w-[12rem] w-full md:max-w-[14rem] lg:max-w-[17rem] aspect-square rounded-2x"
          onClick={isExplorePage ? null : () => handleEditBanner(banner || {})}
        >
          <figure className="max-w-[12rem] w-full md:max-w-[14rem] lg:max-w-[17rem] aspect-square rounded-2xl ">
            <img
              src={banner?.bannerImage}
              alt="logo"
              className={cn(
                " max-w-[12rem] w-full md:max-w-[14rem] lg:max-w-[17rem] aspect-square rounded-2xl",
              )}
            />
          </figure>
          <article
            style={{
              background: banner?.backgroundColor || "#ffffff",
            }}
            className={cn(
              "absolute bottom-2 p-2 rounded-xl mx-2 max-w-[12rem] w-[92%] md:max-w-[14rem] lg:max-w-[17rem]",
            )}
          >
            <div className="flex justify-between">
              <h1
                style={paragraphPropsStyle}
                className="text-[0.7rem] truncate"
              >
                {banner?.heading
                  ? truncateDescription(banner?.heading)
                  : "Heading"}
              </h1>
              {/* {layout?.isButton && ( */}
              <div
                style={buttonStyleTags}
                className="flex items-center px-1 py-0.5 text-[0.6rem] text-white rounded-full space-x-0.5 -mr-1 -mt-1"
              >
                <button type="button">
                  {banner?.callToAction || "Explore"}
                </button>{" "}
                <span className="text-[0.6rem]">
                  <LuArrowUpRight />
                </span>
              </div>
              {/* )} */}
            </div>
            <p
              style={{
                WebkitLineClamp: 2,
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                ...paragraphPropsStyle,
              }}
              className="text-[0.5rem]"
            >
              {banner?.paragraph
                ? truncateDescription(banner?.paragraph)
                : null}
            </p>
          </article>
        </button>
      </section>
    </>
  );
};

const BannerLayout2 = memo(MemoBannerLayout2);
export default BannerLayout2;
