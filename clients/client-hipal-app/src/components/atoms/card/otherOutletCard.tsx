import DishQuantityButton from "@/components/organisms/dishDescription/dishQuantityButton";
import { getPrice } from "@/components/utils/helpers";
import { memo, useCallback, useMemo, useState } from "react";
import { AiOutlineExpand } from "react-icons/ai";
import DishData from "../dishDescription";
import DishPopup from "../dishPopup";
import PlaceholderImg from "../placeholder";
import type { DishType } from "@hi/db-models/src/validators";
import ShimmerImage from "../imageshimmer";

const MemoOtherOutletCard = ({
  dishData,
}: {
  dishData: DishType;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState({} as DishType);
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
            <PlaceholderImg className="object-cover w-full h-full" />
          )}
          <button
            type="button"
            className="absolute p-2 bg-white rounded-full shadow-md -top-2 -right-2"
            onClick={openModal}
          >
            <AiOutlineExpand className="text-lg text-primary" />
          </button>
          {dishData.availability && (
            <div>
              <DishQuantityButton dishData={dishData} />
            </div>
          )}

          <div className="absolute right-0 font-medium -bottom-8 text-primary opacity-80">
            ₹ {Number(price)?.toLocaleString("en-IN")}
          </div>
          {dishData.tags && dishData.tags.length > 0 && (
            <section className="absolute left-0 -bottom-8">
              {/* {dishData.tags.map((ele) => ( */}
              <div className="text-sm font-semibold text-primary">
                {dishData?.tags?.[0]}
              </div>
              {/* ))} */}
            </section>
          )}
        </div>
        <div className="mt-10 text-sm font-medium capitalize text-primary">
          {dishData?.name || ""}
        </div>
      </section>

      {isModalOpen && (
        <DishData show={isModalOpen} onClose={closeModal}>
          <DishPopup dishData={selectedDish} />
        </DishData>
      )}
    </div>
  );
};

const OtherOutletCard = memo(MemoOtherOutletCard);

export default OtherOutletCard;
