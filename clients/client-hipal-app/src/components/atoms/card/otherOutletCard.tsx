import { memo, useCallback, useMemo, useState } from "react";
import type { DishType } from "@hi/db-models/src/validators";
import { cn } from "@hi/common";
import { Badge } from "@/components/ui/badge";
import { getPrice } from "@/components/utils/helpers";
import DishQuantityButton from "@/components/organisms/dishDescription/dishQuantityButton";
import ShimmerImage from "../imageshimmer";
import OtherPlaceholderImg from "../placeholder/othePlaceholder";
import ItemDescriptionPopup from "../dishDescription/itemDescription";
import OutletItemInfo from "../dishPopup/outletcard";
import { useActiveClass } from "@/components/store/useActiveClass";
import MemoReadMore from "../readMore";

const MemoOtherOutletCard = ({
  dishData,
}: {
  dishData: DishType;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isSelectedDish, setSelectedDish } = useActiveClass();
  const price = useMemo(
    () => getPrice(dishData?.price || 0),
    [dishData?.price],
  );

  const openModal = useCallback(() => {
    setSelectedDish(dishData);
    setIsModalOpen(true);
  }, [dishData, setSelectedDish]);

  const closeModal = useCallback(() => {
    setSelectedDish({} as DishType);
    setIsModalOpen(false);
  }, [setSelectedDish]);

  return (
    <div className="relative pb-8 overflow-hidden border-b border-gray-200">
      <div className="flex p-0">
        <div className="flex-grow pr-4 text-[#000000]">
          {dishData.tags && dishData.tags.length > 0 && (
            <Badge variant="secondary" className="mb-2">
              {dishData.tags[0]}
            </Badge>
          )}
          <h3 className="mb-1 text-lg font-semibold text-[#000000] space-grotesk-700">
            {dishData.name}
          </h3>
          {Number(price) > 1 && (
            <p className="text-sm text-primary">
              ₹ {Number(price).toLocaleString("en-IN")}
            </p>
          )}
          {dishData?.description && (
            <div className="mt-2 text-xs leading-3 text-[#000000] space-grotesk-700">
              <MemoReadMore
                className="font-semibold !opacity-40"
                text={dishData?.description || ""}
              />
            </div>
          )}
        </div>
        <div className="flex-shrink-0 w-32 h-32">
          {" "}
          {/* Fixed width and height */}
          {dishData?.images?.[0] ? (
            <ShimmerImage
              src={dishData?.images?.[0]}
              alt="dish"
              quality={95}
              width={128}
              height={128}
              onClick={openModal}
              className={cn(
                "object-cover w-full h-full rounded-lg",
                !dishData.availability && "grayscale",
              )}
            />
          ) : null}
        </div>
      </div>
      <div
        className={cn(
          "absolute mt-4 right-4",
          dishData.images &&
            (dishData.images.length > 0 || dishData.images[0] === "")
            ? "bottom-2.5"
            : "bottom-1/2",
        )}
      >
        {dishData.availability ? (
          <DishQuantityButton dishData={dishData} />
        ) : (
          <span className="text-sm text-muted-foreground">Not available</span>
        )}
      </div>

      {isModalOpen && (
        <ItemDescriptionPopup
          heading={isSelectedDish?.name}
          show={isModalOpen}
          onClose={closeModal}
        >
          <OutletItemInfo />
        </ItemDescriptionPopup>
      )}
    </div>
  );
};

const OtherOutletCard = memo(MemoOtherOutletCard);

export default OtherOutletCard;
