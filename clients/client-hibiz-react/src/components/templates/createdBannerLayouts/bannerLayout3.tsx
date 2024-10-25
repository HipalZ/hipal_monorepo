import type { BannerProps } from "@/components/types/businessData";
import { useIsExplorePage } from "@/hooks/useExplore";
import {
  useButtonStyles,
  useEditBanner,
  useLayoutObject,
  useParagraphStyles,
} from "../../helpers/bannersHelper";
import { truncateDescription } from "@/components/utils/bannerLayouts";
import { LuArrowUpRight } from "react-icons/lu";
import { memo } from "react";

const MemoBannerLayout3 = (props: BannerProps) => {
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
  const layout = useLayoutObject(banner?.layout || "");
  return (
    <>
      <section key={banner?._id} className="shrink-0 ">
        <article
          className="relative flex justify-center shrink-0  max-w-[12rem] w-full md:max-w-[14rem] lg:max-w-[17rem] aspect-square rounded-2xl"
          onClick={isExplorePage ? null : () => handleEditBanner(banner || {})}
        >
          <figure className=" max-w-[12rem] w-full md:max-w-[14rem] lg:max-w-[17rem] aspect-square rounded-2xl ">
            <img
              src={banner?.bannerImage}
              alt="logo"
              className=" max-w-[12rem] w-full md:max-w-[14rem] lg:max-w-[17rem] aspect-square rounded-2xl object-cover object-top"
            />
          </figure>
          <article
            style={{
              background:
                banner?.backgroundColor === "transparent"
                  ? null
                  : `linear-gradient(to bottom, transparent 10%, ${
                      banner?.backgroundColor || "black"
                    }80 90%)`,
            }}
            className="absolute bottom-0 w-full p-2 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <h1
                style={paragraphPropsStyle}
                className="text-[0.7rem] truncate text-white mb-1"
              >
                {banner?.heading
                  ? truncateDescription(banner?.heading)
                  : "Heading"}
              </h1>
              {layout?.isButton && (
                <div
                  style={buttonOutlineStyleTags}
                  className="flex items-center border border-1 px-2 py-0.5 text-[0.675rem] text-white rounded-full space-x-0.5  -mr-1"
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
              className="text-[0.5rem] text-white"
            >
              {banner?.paragraph
                ? truncateDescription(banner?.paragraph)
                : null}
            </p>
          </article>
        </article>
      </section>
    </>
  );
};

const BannerLayout3 = memo(MemoBannerLayout3);
export default BannerLayout3;
