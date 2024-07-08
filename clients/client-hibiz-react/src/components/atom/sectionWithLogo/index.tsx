import { memo } from "react";
import HipalLogo from "@/assets/hipal.png";

const SectionWithLogo = ({ children }: { children: React.ReactNode }): JSX.Element => {
  return (
    <section className="gradient">
      <article className="mid_section">{children}</article>
      <center className="absolute left-0 right-0 m-auto bottom-4">
        <img width={131} height={41} src={HipalLogo} alt="Hipal Logo" />
      </center>
    </section>
  );
};
const memoizedSectionWithLogo = memo(SectionWithLogo);
export default memoizedSectionWithLogo;
