import PlusButton from "@/components/atom/plusButton";
import {
  useFooterSection,
  useImageChange,
} from "@/components/helpers/explorePageHelpers";
import useBusinessData from "@/components/store/useBusinessData";
import { useExploreStore } from "@/components/store/useExploreStore";
import { cn, handleClick } from "@/components/utils/helper";
import { lazy, memo, useRef } from "react";
import { CiEdit } from "react-icons/ci";

const Paragraph = lazy(() => import("@/components/atom/paragraph"));
const SubHeader = lazy(() => import("@/components/atom/subHeader"));
const MemoFooterSection = () => {
  const { bizInfo, img } = useExploreStore((s) => ({
    bizInfo: s.bizInfo,
    img: s.img,
  }));
  const footerInputRef = useRef<HTMLInputElement | null>(null);
  const { handleImageChange } = useImageChange();
  const { handleFooterComment, handleFssaiNumber, handlegst } =
    useFooterSection();
  const outletInfo = useBusinessData((s) => s.outletInfo);

  return (
    <>
      {outletInfo?.outLetType === "HOTEL" ? (
        <section className="flex-1 mt-4">
          <SubHeader text="Footer Banner" />
          <article
            className={cn(
              "relative rounded-xl w-full h-[110px]",
              img?.footer?.length > 0
                ? ""
                : "border-dashed border-2 border-[#8C63FF]",
            )}
          >
            <input
              ref={footerInputRef}
              onClick={(e) => handleClick(e, footerInputRef)}
              type="file"
              id="footerInput"
              style={{ display: "none" }}
              onChange={handleImageChange}
              data-type="footer"
              accept="*"
            />
            <figure className="w-full max-w-[28rem] h-[10px] mx-auto lg:mx-0 ">
              <label
                htmlFor="footerInput"
                className="flex items-center justify-center overflow-hidden cursor-pointer rounded-xl"
              >
                <figure className="w-full max-w-[28rem] h-[110px]">
                  {img.footer ? (
                    <div className="relative w-full max-w-[28rem] h-[110px]">
                      <figure className="w-full h-full">
                        <img
                          src={img.footer}
                          alt="Footer"
                          className="object-cover w-full h-full rounded-2xl"
                        />
                      </figure>
                      <CiEdit className="absolute top-0 right-0 w-8 h-8 p-1 text-black bg-white rounded-full cursor-pointer" />
                    </div>
                  ) : (
                    <PlusButton />
                  )}
                </figure>
              </label>
            </figure>
          </article>
        </section>
      ) : null}
      <section className="md:flex md:space-x-10">
        <section className="flex-1 mt-10 md:mt-4 w-full">
          <SubHeader text="Footer Section" />
          <article className="p-4 bg-white rounded-2xl md:flex md:justify-between md:items-center md:gap-2 ">
            <div className="relative flex-1">
              <textarea
                minLength={10}
                maxLength={200}
                value={bizInfo?.footerDescription}
                onChange={handleFooterComment}
                className="w-full pr-16 resize-none h-36 rounded-2xl"
                placeholder="Add Footer comment"
              />
              <small className="absolute bottom-3 right-4">
                {bizInfo?.footerDescription?.length || 0}/{200}
              </small>
            </div>
            <article className="mt-4 md:-mt-20 space-y-4 rounded-2xl">
              <Paragraph text="Optional Sections" />
              <div className="relative">
                <input
                  minLength={14}
                  maxLength={14}
                  placeholder="FSSAI number"
                  type="text"
                  value={bizInfo?.fssai}
                  className="w-full rounded-2xl"
                  onChange={handleFssaiNumber}
                />
                <small className="absolute bottom-3 right-4">
                  {bizInfo?.fssai?.length || 0}/{14}
                </small>
              </div>
              <div className="relative">
                <input
                  minLength={15}
                  maxLength={15}
                  placeholder="GST number"
                  type="text"
                  value={bizInfo?.gst}
                  className="w-full rounded-2xl"
                  onChange={handlegst}
                />
                <small className="absolute bottom-3 right-4">
                  {bizInfo?.gst?.length || 0}/{15}
                </small>
              </div>
            </article>
          </article>
        </section>
      </section>
    </>
  );
};

const FooterSection = memo(MemoFooterSection);
export default FooterSection;
