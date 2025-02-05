import {
  useFooterSection,
} from "@/components/helpers/explorePageHelpers";
import { useExploreStore } from "@/components/store/useExploreStore";
import { lazy, memo } from "react";

const Paragraph = lazy(() => import("@/components/atom/paragraph"));
const SubHeader = lazy(() => import("@/components/atom/subHeader"));
const MemoFooterSection = () => {
  const { bizInfo } = useExploreStore((s) => ({
    bizInfo: s.bizInfo,
  }));
  const { handleFooterComment, handleFssaiNumber, handlegst } =
    useFooterSection();

  return (
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
  );
};

const FooterSection = memo(MemoFooterSection);
export default FooterSection;
