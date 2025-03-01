import { memo } from "react";
import HipalLogo from "@/assets/hipal.png";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon } from "lucide-react";
import {Link} from "react-router-dom";

const SectionWithLogo = ({ children }: { children: React.ReactNode }): JSX.Element => {

  return (
    <section className="gradient">
      <article className="mid_section">{children}</article>
      <center className="absolute left-0 right-0 m-auto bottom-8">
        <img width={131} height={41} src={HipalLogo} alt="Hipal Logo" />
        <Link to={"/terms&conditions"} className="text-white">
          <Button className="absolute bottom-0 mt-4 -translate-x-1/2 translate-y-[2rem] trasnform left-1/2" variant="ghost" >
            <LinkIcon /> Terms And Conditions
          </Button>
        </Link>
      </center>
    </section>
  );
};
const memoizedSectionWithLogo = memo(SectionWithLogo);
export default memoizedSectionWithLogo;
