import FoodType from "@/components/atoms/foodType";
import { getPrice } from "@/components/utils/helpers";
import { isEmpty } from "lodash";
import Image from "next/image";
import React from "react";
import { useState } from "react";
import { MdFastfood, MdOutlineRiceBowl } from "react-icons/md";
import { BsExclamationCircle, BsQuestionCircle } from "react-icons/bs";
import DishQuantityBtn from "../dishDescription/dishQuantityButton";
import DayOutPopup from "@/components/atoms/dayoutPopup";

function DishMenu({ category, show ,categoryName}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<any>(null);
  const [image, setImage] = useState("");

  const openModal = (dish) => {
    const pic = dish?.images?.[0];
    setIsModalOpen(true);
    setSelectedDish(dish);
    setImage(pic);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  return (
    <div>
      {" "}
      <div className={`pb-[1rem] ${show ? "masonry-layout mt-4 px-6" : ""} `}>
        {category?.map((dish: any) => (
          <div
            className={`${
              !dish.availability ? "bg-gray-100" : "bg-base-100"
            } relative flex justify-between py-3 px-4  ${
              show ? "masonry-item border border-[#cacaca] rounded-xl" : ""
            } `}
            key={dish?.id}
          >
            <div className="mr-2">
              <FoodType type={dish?.dishType} />
            </div>
            <div className="w-[70%]">
              <div className="text-base-content text-[1rem] leading-[1.25rem]">
                {dish?.name}
              </div>
              <div className="mt-2 text-base-content/40 text-[1rem] leading-[1.25rem]">
                ₹ {dish?.price}
              </div>
              <div
                onClick={() => openModal(dish)}
                className="capitalize flex mt-2 text-[1rem] leading-[1.25rem] font-normal text-primary"
              >
                <BsQuestionCircle className="mt-[0.125rem] mr-1" />
                info
                {!dish.availability && (
                  <span className="flex items-center ml-2 text-blue-500">
                    <BsExclamationCircle className="mr-1" />
                    Not Available
                  </span>
                )}
              </div>
            </div>
            <div className="mt-6">
              <DishQuantityBtn dishData={dish} categoryName={categoryName} />
            </div>
          </div>
        ))}
      </div>
      {
        <DayOutPopup show={isModalOpen} onClose={closeModal}>
          <div className="relative rounded-b-2xl min-h-[30rem] max-h-[30rem]">
            <div className="fixed top-0 left-0 right-0 px-4 py-2 capitalize font-[500] ml-2 mt-2 text-base-content text-[1rem] leading-[1.25rem]">
              Dish description
            </div>
            <div className="absolute inset-0 pb-4 overflow-y-auto top-12 max-h-[30rem] hide-scrollbar">
              {image && (
                <div className="flex h-[18rem] justify-center mx-4 mt-4">
                  <Image
                    layout={"intrinsic"}
                    alt="dish"
                    quality={95}
                    width={350}
                    height={200}
                    objectFit="cover"
                    className="!w-128 !h-128 overflow-hidden rounded-xl"
                    src={image}
                  />
                </div>
              )}

              <div className="text-base-content capitalize font-[500] text-xl mx-4 mt-4">
                {selectedDish?.name}
              </div>
              <div className=" mx-4 flex text-base-content text-[1rem] leading-[1.25rem] mt-4">
                <FoodType type={selectedDish?.dishType} />
                <div className="ml-2 capitalize">{selectedDish?.dishType}</div>
              </div>
              {!isEmpty(selectedDish?.avgTime) && (
                <div className="mx-4 mt-4 text-base capitalize text-base-content">
                  Average time {selectedDish?.avgTime} minutes(running on delay)
                </div>
              )}
              <div className="mx-4 mt-2 text-base text-base-content/40 line-clamp-3">
                {selectedDish?.description}
              </div>
              {!isEmpty(selectedDish?.portions) && (
                <div className="flex flex-col mx-4 space-y-2">
                  <div className="flex flex-row gap-2 text-base text-primary">
                    <MdOutlineRiceBowl className="my-auto" />
                    <h4 className="my-auto">
                      {selectedDish?.portions.length} Portions available
                    </h4>
                  </div>

                  <div className="flex flex-row flex-wrap w-full gap-px divide-base-content bg-base-content/10">
                    {selectedDish?.portions.map((portion, key) => (
                      <div
                        key={key}
                        className={
                          "flex flex-col min-w-[22%] max-w-full mx-auto space-y-1 text-base text-center bg-base-100 flex-grow p-2"
                        }
                      >
                        <span className="text-base font-normal text-base-content">
                          {portion?.name}
                        </span>
                        <span className="text-xs font-normal text-base-content/60">
                          {getPrice(portion?.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!isEmpty(selectedDish?.extras?.[0]?.items) && (
                <div className="flex flex-col mx-4 space-y-2">
                  <div className="flex flex-row gap-4 text-base text-primary">
                    <MdOutlineRiceBowl className="my-auto" />
                    <h4 className="my-auto">Extras available</h4>
                  </div>
                  {selectedDish?.extras.map((extra, key) => (
                    <div key={extra?.name} className="space-y-3">
                      <h6 className="text-base ">
                        {key + 1}. {extra?.name}
                      </h6>
                      <ul className="flex flex-row flex-wrap gap-5 px-4 py-2 border rounded-lg border-base-content/20">
                        {extra?.items.map((item) => (
                          <li
                            key={item?.name}
                            className="flex flex-row gap-2 mx-auto text-sm font-normal min-w-fit text-base-content/40"
                          >
                            <MdFastfood className="inline-flex my-auto" />
                            <span className="my-auto">{item?.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DayOutPopup>
      }
    </div>
  );
}

export default DishMenu;
