import DishQuantityButton from "@/components/organisms/dishDescription/dishQuantityButton";
import { getPrice } from "@/components/utils/helpers";
import { memo, useCallback, useMemo, useState } from "react";
import { AiOutlineExpand } from "react-icons/ai";
import type { DishType } from "@hi/db-models/src/validators";
import ShimmerImage from "../imageshimmer";
import OtherPlaceholderImg from "../placeholder/othePlaceholder";
import { cn } from "@hi/common";
import ItemDescriptionPopup from "../dishDescription/itemDescription";
import OutletItemInfo from "../dishPopup/outletcard";
import { useActiveClass } from "@/components/store/useActiveClass";

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
    console.log(dishData);
    setIsModalOpen(true);
  }, [dishData]);

  const closeModal = useCallback(() => {
    setSelectedDish({} as DishType);
    setIsModalOpen(false);
  }, []);
  return (
    <div className="w-full pb-8">
      <section className="overflow-hidden">
        <div className="relative w-full h-40">
          {dishData?.images?.[0] ? (
            <ShimmerImage
              src={dishData.images[0]}
              alt="dish"
              quality={95}
              width={160}
              height={160}
              className={`object-cover w-full h-full rounded-lg ${
                dishData.availability ? "" : "grayscale"
              }`}
            />
          ) : (
            <OtherPlaceholderImg className="object-cover w-full h-full bg-base-200" />
          )}
          <button
            type="button"
            className="absolute p-2 bg-white rounded-full -top-2 -right-2"
            onClick={openModal}
          >
            <AiOutlineExpand className="text-lg text-primary" />
          </button>
          {dishData.availability && (
            <div className="absolute right-0 scale-75 bottom-2">
              <DishQuantityButton dishData={dishData} />
            </div>
          )}
        </div>
        {dishData.tags && dishData.tags.length > 0 && (
          <section className="mt-2">
            {/* {dishData.tags.map((ele) => ( */}
            <div className="text-sm font-semibold text-primary">
              {dishData?.tags?.[0]}
            </div>
            {/* ))} */}
          </section>
        )}
        <div className="mt-1 ml-1 font-medium text-primary opacity-80">
          ₹ {Number(price)?.toLocaleString("en-IN")}
        </div>
        <div
          className={cn(
            "mt-1 ml-1 text-sm font-medium capitalize text-primary",
          )}
        >
          {dishData?.name || ""}
        </div>
      </section>

      {isModalOpen && (
        <ItemDescriptionPopup
          heading={isSelectedDish?.name}
          show={isModalOpen}
          onClose={closeModal}
        >
          <OutletItemInfo dishData={isSelectedDish} />
        </ItemDescriptionPopup>
      )}
    </div>
  );
};

const OtherOutletCard = memo(MemoOtherOutletCard);

export default OtherOutletCard;
