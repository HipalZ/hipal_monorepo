import PlusButton from "@/components/atom/plusButton";
import SubHeader from "@/components/atom/subHeader";
import { cn } from "@/components/utils/helper";
import { type ChangeEvent, memo } from "react";

interface IFooterBanner {
  img: { logo: string; banner: string; footer: string };
  handleImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
}
const MemoFooterBanner = (props: IFooterBanner) => {
  const { img, handleImageChange } = props;
  return (
    <section>
      <SubHeader text="Footer Banner" />
      <article
        className={cn(
          "relative rounded-xl h-[18rem] w-full",
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
          className="flex items-center justify-center w-full h-full overflow-hidden cursor-pointer rounded-xl"
        >
          {img.footer ? <img src={img.footer} alt="footer" /> : <PlusButton />}
        </label>
      </article>
    </section>
  );
};

const FooterBanner = memo(MemoFooterBanner);
export default FooterBanner;
