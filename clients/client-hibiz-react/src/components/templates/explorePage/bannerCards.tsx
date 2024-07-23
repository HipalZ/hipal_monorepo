import { type CSSProperties, memo } from "react";
import type { IBannerPayload } from "@/components/types/businessData";
import BannerDummy from "@/assets/hisite/bannerDummy.jpg";
import layout3 from "@/assets/hisite/layout3.jpg";
import { BannerType } from "@hi/common";
interface IBanner {
  banners: IBannerPayload[];
  handleEditBanner?: (banner: IBannerPayload) => void;
  sizeInPx?: string;
}
const MemoBannerCards = (props: IBanner) => {
  const { banners, handleEditBanner, sizeInPx } = props;
  return (
    <section className="flex flex-col items-center justify-center space-y-4 md:space-y-0 md:grid md:gap-6 md:grid-cols-2 lg:grid-cols-3">
      {banners?.map((banner: IBannerPayload) => {
        const headingStyles: CSSProperties = {
          color: banner?.headingColor,
        };
        const paragraphStyles: CSSProperties = {
          color: banner?.paragraphColor,
        };
        const buttonStyles: CSSProperties = {
          color: banner?.buttonColor,
          border: `1px solid ${banner?.buttonColor}`,
        };
        return (
          <div onClick={() => handleEditBanner(banner)} key={banner._id}>
            {banner.bannerType === BannerType.BANNER_TYPE_1 && (
              <article
                style={{
                  backgroundColor: banner?.backgroundColor,
                  height: sizeInPx,
                }}
                className="flex flex-col justify-between p-4 py-6 mt-4 space-y-4 border rounded-2xl"
              >
                <h1 style={headingStyles} className="text-xl">
                  {banner.heading || "heading"}
                </h1>
                <p style={paragraphStyles}>
                  {banner.paragraph ||
                    "Lorem Ipsum has been the industrys standard dummy text ever since the 1500s"}
                </p>
                <div>
                  <button
                    style={buttonStyles}
                    type="button"
                    className="px-4 py-2 border border-black rounded-full border-1"
                  >
                    {banner?.callToAction ? banner?.callToAction : "LINK"}
                  </button>
                </div>
              </article>
            )}
            {banner.bannerType === BannerType.BANNER_TYPE_2 && (
              <article
                style={{
                  backgroundImage: `url(${banner?.bannerImage || BannerDummy})`,
                  height: sizeInPx,
                }}
                className="flex flex-col justify-between p-4 py-6 mt-4 space-y-10 bg-cover border aspect-square rounded-2xl border-1"
              >
                <h1 style={headingStyles} className="text-xl">
                  {banner.heading || "heading"}
                </h1>
                <p style={paragraphStyles} className="my-4">
                  {banner.paragraph ||
                    "Lorem Ipsum has been the industrys standard dummy text ever since the 1500s"}
                </p>
                <div>
                  <button
                    style={buttonStyles}
                    type="button"
                    className="px-4 py-2 border border-black rounded-full border-1"
                  >
                    {banner?.callToAction ? banner?.callToAction : "LINK"}
                  </button>
                </div>
              </article>
            )}
            {banner.bannerType === BannerType.BANNER_TYPE_3 && (
              <section
                style={{
                  backgroundColor: banner?.backgroundColor,
                  height: sizeInPx,
                }}
                className="grid grid-rows-2 mt-4 overflow-hidden border aspect-square rounded-2xl border-1 "
              >
                <div className="row-span-1">
                  <img
                    src={banner?.bannerImage || layout3}
                    alt="BannerDummy"
                    className="object-cover w-full h-full"
                  />
                </div>
                <section className="flex row-span-1 p-2 bg-gray-700">
                  <article
                    style={{ backgroundColor: banner?.backgroundColor }}
                    className="flex items-center justify-around px-2 bg-white rounded-2xl"
                  >
                    <div>
                      <h1 style={headingStyles} className="text-xl">
                        {banner?.heading || "Heading"}
                      </h1>
                      <p style={paragraphStyles} className="my-2 text-sm">
                        {banner?.paragraph ||
                          "Lorem Ipsum has been the industrys"}
                      </p>
                    </div>
                    <div className="w-1/3">
                      <button
                        type="button"
                        style={{
                          color: banner?.buttonColor,
                          border: `1px solid ${banner?.buttonColor || "black"}`,
                        }}
                        className="px-4 py-1 text-sm rounded-full"
                      >
                        {banner?.callToAction ? banner?.callToAction : "Link"}
                      </button>
                    </div>
                  </article>
                </section>
              </section>
            )}
          </div>
        );
      })}
    </section>
  );
};

const BannerCards = memo(MemoBannerCards);
export default BannerCards;
