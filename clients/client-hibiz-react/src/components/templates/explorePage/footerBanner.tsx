import Paragraph from "@/components/atom/paragraph";
import PlusButton from "@/components/atom/plusButton";
import SubHeader from "@/components/atom/subHeader";
import { useExploreStore } from "@/components/store/useExploreStore";
import { cn } from "@/components/utils/helper";
import { type ChangeEvent, memo } from "react";
import { CiEdit } from "react-icons/ci";

interface IFooterBanner {
  img: { logo: string; banner: string; footer: string };
  handleImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleFssaiNumber: (e: ChangeEvent<HTMLInputElement>) => void;
  handlegst: (e: ChangeEvent<HTMLInputElement>) => void;
  handleFooterComment: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}
const MemoFooterBanner = (props: IFooterBanner) => {
  const bizInfo = useExploreStore((s) => s.bizInfo);
  const {
    img,
    handleImageChange,
    handleFssaiNumber,
    handlegst,
    handleFooterComment,
  } = props;
  return (
    <section className="md:flex md:space-x-10">
      <section>
        <SubHeader text="Footer Banner" />
        <article
          className={cn(
            "relative rounded-xl w-full",
            img?.footer?.length > 0
              ? ""
              : "border-dashed border-2 border-[#8C63FF]",
          )}
        >
          <input
            onClick={() => document.getElementById("footerInput")?.click()}
            type="file"
            id="footerInput"
            style={{ display: "none" }}
            onChange={handleImageChange}
            data-type="footer"
          />
          <label
            htmlFor="footerInput"
            className="flex items-center justify-center overflow-hidden cursor-pointer rounded-xl"
          >
            <figure className="w-[320px] h-[320px]">
              {img.footer ? (
                <div className="relative w-[320px] h-[320px]">
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
        </article>
      </section>
      <section className="w-full mt-10 md:mt-4">
        <SubHeader text="Footer Section" />
        <article className="p-4 bg-white rounded-2xl">
          <div className="relative">
            <textarea
              minLength={10}
              maxLength={200}
              value={bizInfo?.footerDescription}
              onChange={handleFooterComment}
              className="w-full pr-16 resize-none h-36 rounded-2xl"
              placeholder="Add Footer comment"
            />
            <small className="absolute bottom-3 right-4">
              {bizInfo?.footerDescription?.length}/{200}
            </small>
          </div>
          <Paragraph text="Optional Sections" />
          <article className="mt-4 space-y-4 rounded-2xl">
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
                {bizInfo?.fssai?.length}/{14}
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
                {bizInfo?.gst?.length}/{15}
              </small>
            </div>
          </article>
        </article>
        <br />
      </section>
    </section>
  );
};

const FooterBanner = memo(MemoFooterBanner);
export default FooterBanner;
