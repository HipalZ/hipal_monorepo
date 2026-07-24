import { memo } from "react";
import HipalLogo from "@/assets/hipal.png";
import { Button } from "@/components/ui/button";
import { LifeBuoy, Link as LinkIcon } from "lucide-react";
import {Link} from "react-router-dom";

const SectionWithLogo = ({ children }: { children: React.ReactNode }): JSX.Element => {

  return (
    <section className="gradient">
      <article className="mid_section">{children}</article>
      <center className="absolute left-0 right-0 m-auto bottom-8">
        <img width={131} height={41} src={HipalLogo} alt="Hipal Logo" />
        {/* Both land on public routes — see PUBLIC_PATHS in molecules/boundary. */}
        <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 translate-y-[2rem] transform items-center gap-1">
          <Link to={"/terms&conditions"} className="text-white">
            <Button variant="ghost">
              <LinkIcon /> Terms And Conditions
            </Button>
          </Link>
          <Link to={"/support"} className="text-white">
            <Button variant="ghost">
              <LifeBuoy /> Tech Support
            </Button>
          </Link>
        </div>
      </center>
    </section>
  );
};
const memoizedSectionWithLogo = memo(SectionWithLogo);
export default memoizedSectionWithLogo;
