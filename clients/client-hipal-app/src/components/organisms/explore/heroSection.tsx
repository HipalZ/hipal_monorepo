"use client";
import ReadMore from "@/components/atoms/readMore";
import { memo } from "react";
import type { IBusinessData } from "@/components/types/businessData";

interface IHeroSection {
  data: IBusinessData;
}

function HeroSection({ data }: IHeroSection): JSX.Element {
  return (
    <div className="relative items-center px-8">
      <center
        style={{
          justifyContent: "flex-end",
        }}
        className="pt-4 text-sm text-center text-primary"
      >
        <ReadMore text={data?.business?.description || ""} />
      </center>
    </div>
  );
}

const MemoHeroSection = memo(HeroSection);
export default MemoHeroSection;
