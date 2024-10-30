"use client";
import Image from "next/image";
import { memo } from "react";
import MadeWithLove from "@/assets/brain.png";
import HipalzWhiteBG from "@/assets/hipalzLogoWhitebg.png";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

function FooterComponent() {
  const onBoardBusiness = () => {
    window.open("https://wa.me/9177914130", "_blank");
  };

  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const defaultStyle = {
    background:
      "conic-gradient(from -2.68deg at 54.19% 53.95%, #E2B8BD -61.36deg, #FCA7A9 12.69deg, #F3764A 107.76deg, #BE95EB 222.08deg, #E2B8BD 298.64deg, #FCA7A9 372.69deg)",
    WebkitBackgroundClip: "text",
    color: "transparent",
  };

  const customStyle = "text-left relative z-10 mix-blend-screen";
  return (
    <>
      {outletInfo?.outLetType !== "OTHER" && (
        <div className="bg-black">
          <section className="flex items-center justify-between">
            <article>
              <p className="relative inline-flex flex-col items-center justify-start px-4 text-base bg-black ">
                <span className={customStyle} style={defaultStyle}>
                  Made with
                </span>
                <span className={`${customStyle} ml-2`} style={defaultStyle}>
                  Love &{" "}
                  <Image
                    src={MadeWithLove}
                    quality={95}
                    width={30}
                    height={30}
                    alt="background"
                    className="inline-block object-cover"
                  />
                </span>
              </p>
              <p className="px-6 text-xs">Powered by Paltribe</p>
            </article>
            <article className="flex flex-col items-end mt-4 mr-6 shrink-0">
              <span>
                <Image src={HipalzWhiteBG} alt="HipalzWhiteBG" />
              </span>
              <button type="button" onClick={onBoardBusiness}>
                <span className="text-xs bg-[#262626] px-3 py-1 rounded-full">
                  Get your Business Online
                </span>
              </button>
            </article>
          </section>
          <section className="pr-6 bg-black">
            <ol className="py-8 space-y-2 text-xs text-justify custom-list custom-list-color">
              <li>
                Menu items, nutritional information and prices are set by the
                businesses.
              </li>
              <li>
                Refunds and application of rewards are managed by the businesses
                directly.
              </li>
              <li>
                An average active adult requires 2,000 Kcal energy per day,
                however calorie needs may vary.
              </li>
            </ol>
          </section>
        </div>
      )}
    </>
  );
}

const FooterBanner = memo(FooterComponent);
export default FooterBanner;
