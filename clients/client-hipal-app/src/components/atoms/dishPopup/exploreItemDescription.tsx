import { isEmpty } from "lodash-es";
import PlaceholderImg from "../placeholder";
import type { IDish } from "@/components/types/businessData";
import { memo } from "react";
import { cn } from "@hi/common";
import { useCart } from "@/components/store/useCart";
import MemoNotAvailable from "../notAvailable";
import ItemWallpaperCarousel from "../backgroundCarousel/itemBackgroundCarousal";
import IndividualItemDescription from "@/components/organisms/dishDescription/foodDiscription/itemDescription";
import { useParams } from "next/navigation";

function MemoExploreItemDescription({ dishData }: { dishData: IDish }) {
  const isAvailable = !dishData?.availability;
  const customLink = useParams()?.businessId as string;
  const { showCart } = useCart();
  const handleInsideClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    e.stopPropagation();
  };

  return (
    <div
      className="relative max-h-[90dvh] overflow-auto text-primary hide-scrollbar"
      onClick={(e) => handleInsideClick(e)}
    >
      {!isEmpty(dishData?.images) ? (
        <div className="overflow-hidden rounded-2xl">
          <ItemWallpaperCarousel
            wallpapers={dishData?.images}
            isAvailable={isAvailable}
          />
        </div>
      ) : !isAvailable ? (
        <div className="pb-2 text-center">
          <MemoNotAvailable className="w-full h-32 overflow-hidden rounded-xl" />
        </div>
      ) : (
        <div className="pb-4">
          <PlaceholderImg className="w-full h-[10rem] bg-base-200" />
        </div>
      )}
      <section className={cn("mx-4", !showCart ? "" : "mt-4")}>
        <IndividualItemDescription hide dishData={dishData} />
      </section>
    </div>
  );
}

const ExploreItemDescription = memo(MemoExploreItemDescription);
export default ExploreItemDescription;
