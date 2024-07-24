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
        <textarea
          minLength={10}
          maxLength={200}
          value={bizInfo?.footerDescription}
          onChange={handleFooterComment}
          className="w-full resize-none h-36 rounded-2xl"
          placeholder="Add Footer comment"
        />
        <br />
        <br />
        <Paragraph text="Optional Sections" />
        <br />
        <article className="space-y-4 rounded-2xl">
          <input
            minLength={14}
            maxLength={16}
            placeholder="FSSAI number"
            type="text"
            value={bizInfo?.fssai}
            className="w-full rounded-2xl"
            onChange={handleFssaiNumber}
          />
          <input
            minLength={15}
            maxLength={16}
            placeholder="GST number"
            type="text"
            value={bizInfo?.gst}
            className="w-full rounded-2xl"
            onChange={handlegst}
          />
        </article>
      </article>
      <br />
    </section>
  );
};

const FooterSection = memo(MemoFooterSection);
export default FooterSection;
