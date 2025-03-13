import { lazy, memo, useEffect, useState } from "react";
import { useExploreStore } from "@/components/store/useExploreStore";
import type { BasicInfo } from "@/components/types/businessData";
import useBusinessData from "@/components/store/useBusinessData";
const SubHeader = lazy(() => import("@/components/atom/subHeader"));

interface PropsBasicInfo {
  handleBizInfo: () => void;
  basicInfos: BasicInfo[];
}

const MemoBizInfo = (props: PropsBasicInfo) => {
  const bizInfo = useExploreStore((s) => s.bizInfo);
  const outletInfo = useBusinessData((s) => s.outletInfo);
  const { handleBizInfo, basicInfos } = props;
  const [bizInfoFilled, setBizInfoFilled] = useState({
    description: false,
    phone: false,
    amenities: false,
    tags: false,
  });

  useEffect(() => {
    if (bizInfo) {
      setBizInfoFilled({
        description: !!bizInfo.description && bizInfo.description.length > 0,
        phone: !!bizInfo.phone && bizInfo.phone.length > 0,
        amenities:
          Array.isArray(bizInfo.amenities || bizInfo.newAmenities) &&
          (outletInfo?.outLetType === "HOTEL"
            ? !!bizInfo?.newAmenities?.length
            : !!bizInfo?.amenities?.length),
        tags: Array.isArray(bizInfo.tags) && !!bizInfo.tags.length,
      });
    }
  }, [bizInfo]);

  return (
    <section className="mb-4">
      <SubHeader text="Basic Information" />
      <article
        onClick={handleBizInfo}
        onKeyDown={handleBizInfo}
        className="flex flex-wrap gap-4 p-2 mt-4 bg-white rounded-xl"
      >
        {basicInfos.map((info) => {
          const isFilled = bizInfoFilled[info?.text?.toLowerCase()];
          return (
            <div
              key={info._id}
              className={`${isFilled ? "border-green-500" : "border-black"
                } border border-1 border-dashed p-2 rounded-lg`}
            >
              <span className={`${isFilled ? "text-green-500" : "text-black"}`}>
                {isFilled ? "\u2713" : "\u26A0"}&nbsp;{info.text}
              </span>
            </div>
          );
        })}
      </article>
    </section>
  );
};

const BizInfo = memo(MemoBizInfo);
export default BizInfo;
