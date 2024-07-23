import { type CSSProperties, memo } from "react";
import BannerDummy from "@/assets/img/bannerDummy.jpg";
import layout3 from "@/assets/img/layout3.jpg";
import {
  BannerType,
  type TextAlign,
  type IBannerPayload,
} from "@/components/types/businessData";
import Section from "@/components/molecules/section";

interface IBanner {
  banners: IBannerPayload[];
}

const MemoBannerCards = (props: IBanner) => {
  const { banners } = props;
  const sizeInPx = "268px";
  return (
    <Section title="Banners" tag="h3">
      <section className="flex flex-row justify-center w-full gap-4 overflow-auto">
        {banners?.map((banner: IBannerPayload) => {
          const headingStyles: CSSProperties = {
            color: banner?.headingColor,
            fontWeight: banner?.headingFontWeight,
            textAlign: banner?.headingAlign as TextAlign,
          };
          const paragraphStyles: CSSProperties = {
            color: banner?.paragraphColor,
            fontWeight: banner?.paragraphFontWeight,
            textAlign: banner?.paragraphAlign as TextAlign,
          };
          const buttonStyles: CSSProperties = {
            color: banner?.buttonColor,
            border: `1px solid ${banner?.buttonColor}`,
          };
          return (
            <div key={banner._id}>
              {banner.bannerType === BannerType.BANNER_TYPE_1 &&
              banner.isPublished ? (
                <article
                  style={{
                    backgroundColor: banner?.backgroundColor,
                    height: sizeInPx,
                  }}
                  className="flex flex-col justify-between p-4 py-6 mt-4 space-y-4 border aspect-square shrink-0 rounded-2xl"
                >
                  <h1 style={headingStyles} className="text-xl">
                    {banner.heading || "heading"}
                  </h1>
                  <p className="text-xl" style={paragraphStyles}>
                    {banner.paragraph ||
                      "Lorem Ipsum has been the industrys standard dummy text ever since the 1500s"}
                  </p>
                  <div>
                    <button
                      style={buttonStyles}
                      type="button"
                      className="px-4 py-1 text-xs border rounded-full"
                    >
                      {banner?.callToAction ? banner?.callToAction : "LINK"}
                    </button>
                  </div>
                </article>
              ) : null}
              {banner.bannerType === BannerType.BANNER_TYPE_2 &&
              banner?.isPublished ? (
                <article
                  style={{
                    backgroundImage: `url(${
                      banner?.bannerImage || BannerDummy
                    })`,
                    height: sizeInPx,
                  }}
                  className="flex flex-col justify-between p-4 py-6 mt-4 bg-cover border rounded-2xl shrink-0 aspect-square"
                >
                  <h1 style={headingStyles} className="text-xl">
                    {banner.heading || "heading"}
                  </h1>
                  <p style={paragraphStyles} className="text-xl">
                    {banner.paragraph ||
                      "Lorem Ipsum has been the industrys standard dummy text ever since the 1500s"}
                  </p>
                  <div>
                    <button
                      style={buttonStyles}
                      type="button"
                      className="px-4 py-1 text-xs border rounded-full"
                    >
                      {banner?.callToAction ? banner?.callToAction : "LINK"}
                    </button>
                  </div>
                </article>
              ) : null}
              {banner.bannerType === BannerType.BANNER_TYPE_3 &&
              banner?.isPublished ? (
                <section
                  style={{ height: "8.5rem" }}
                  className="flex flex-col justify-between flex-1 bg-white border aspect-square rounded-xl"
                >
                  <figure className="h-1/2">
                    <img
                      src={banner?.bannerImage || layout3}
                      alt="banner"
                      className="object-cover w-full h-full"
                    />
                  </figure>
                  <article className="flex flex-col justify-between h-1/2">
                    <div>
                      <h1 style={headingStyles} className="text-xs">
                        {banner.heading || "heading"}
                      </h1>
                      <p style={paragraphStyles}>
                        {banner.paragraph ||
                          "Lorem Ipsum has been the industrys standard dummy text ever since the 1500s"}
                      </p>
                    </div>
                    <div>
                      <button
                        style={buttonStyles}
                        type="button"
                        className="p-2 py-1 text-xs border border-black rounded-full border-1"
                      >
                        {banner?.callToAction ? banner?.callToAction : "LINK"}
                      </button>
                    </div>
                  </article>
                </section>
              ) : null}
            </div>
          );
        })}
      </section>
    </Section>
  );
};

const BannerCards = memo(MemoBannerCards);
export default BannerCards;
