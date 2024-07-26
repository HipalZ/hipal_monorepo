import Paragraph from "@/components/atom/paragraph";
import SubHeader from "@/components/atom/subHeader";
import { useExploreStore } from "@/components/store/useExploreStore";
import { type ChangeEvent, memo } from "react";

interface IFooterSection {
  handleFssaiNumber: (e: ChangeEvent<HTMLInputElement>) => void;
  handlegst: (e: ChangeEvent<HTMLInputElement>) => void;
  handleFooterComment: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}
const MemoFooterSection = (props: IFooterSection) => {
  const bizInfo = useExploreStore((s) => s.bizInfo);
  const { handleFssaiNumber, handlegst, handleFooterComment } = props;

  return (
    <section className="mt-4">
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
        <br />
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
  );
};

const FooterSection = memo(MemoFooterSection);
export default FooterSection;
