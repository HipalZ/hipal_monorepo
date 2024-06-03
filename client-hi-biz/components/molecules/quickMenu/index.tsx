import React from "react";
import axios from "@/axios";
import { Dish, type ICategory } from "@/components/types/businessData";
import { FaRegSquareCheck } from "react-icons/fa6";
import { IoIosCheckbox } from "react-icons/io";
import {
  MdOutlineCategory,
  MdOutlineCheckBoxOutlineBlank,
} from "react-icons/md";
import useItemStore from "@/components/store/useItemStore";

const QuickMenuContent = ({ searchText }: { searchText: string }) => {
  const { data, setData } = useItemStore();
 
  const handleToggle = async (
    id: string,
    field: "visibility" | "availability",
    currentValue: boolean,
    type: "dish" | "category"
  ) => {
    let endpoint = "";
    let updatedData = {};

    if (type === "dish") {
      endpoint = `/v1/dishes/${id}`;
      const updatedDishes = data.dishes?.map((dish) =>
        dish.id === id ? { ...dish, [field]: !currentValue } : dish
      );
      updatedData = { dishes: updatedDishes };
    } else if (type === "category") {
      endpoint = `/v1/categories/${id}`;
      const updatedCategories = data.categories?.map((category) =>
        category.id === id ? { ...category, [field]: !currentValue } : category
      );
      updatedData = { categories: updatedCategories };
    }

    setData((prevData) => ({ ...prevData, ...updatedData }));

    try {
      const payload = { [field]: !currentValue };
      await axios.put(endpoint, payload);
    } catch (error) {
      console.error("Error updating:", error);
      setData((prevData) => ({ ...prevData }));
    }
  };

  return (
    <div className="masonry-layout px-6 mt-6 pb-[5rem]">
      {data?.categories?.map((category: ICategory) => (
        <div
          key={category.id}
          className="masonry-item p-4 border border-[#cacaca] rounded-md"
        >
          <div className="mb-4">
            <div className="flex items-center justify-start py-2 pr-8 mb-4 pl-4 space-x-2 bg-[#2B354D] rounded-md">
              <MdOutlineCategory className="text-xl text-white" />
              <h2 className="font-medium text-white">{category.name}</h2>
            </div>
            <label className="flex items-center justify-between mb-2 cursor-pointer">
              Visibility
              <input
                type="checkbox"
                checked={category.visibility}
                onChange={() =>
                  handleToggle(
                    category.id,
                    "visibility",
                    category.visibility,
                    "category"
                  )
                }
                className="sr-only"
              />
              {category.visibility ? (
                <IoIosCheckbox className="text-2xl text-[#2B354D] " />
              ) : (
                <MdOutlineCheckBoxOutlineBlank className="text-2xl" />
              )}
            </label>
            <label className="flex items-center justify-between mb-2 cursor-pointer">
              Availability
              <input
                type="checkbox"
                checked={category.availability}
                onChange={() =>
                  handleToggle(
                    category.id,
                    "availability",
                    category.availability,
                    "category"
                  )
                }
                className="sr-only"
              />
              {category.availability ? (
                <IoIosCheckbox className="text-2xl text-[#2B354D] " />
              ) : (
                <MdOutlineCheckBoxOutlineBlank className="text-2xl" />
              )}
            </label>
          </div>
          <div className="space-y-4">
            {category?.dishes ? category?.dishes
              .filter((catDish) =>
                data.dishes?.some(
                  (dish) =>
                    dish?.id === catDish?.id &&
                    dish?.name
                      ?.toLowerCase()
                      .includes(searchText?.toLowerCase())
                )
              )
              .map((catDish) => {
                const dish = data?.dishes?.find((d) => d?.id === catDish?.id);
                return dish ? (
                  <div
                    key={dish.id}
                    className="flex flex-col p-4 border border-[#cacaca] rounded-md"
                  >
                    <span className="mb-2 font-semibold">{dish?.name}</span>
                    <label className="flex items-center justify-between mb-2 cursor-pointer">
                      Visibility
                      <input
                        type="checkbox"
                        checked={dish?.visibility}
                        onChange={() =>
                          handleToggle(
                            dish.id,
                            "visibility",
                            dish?.visibility,
                            "dish"
                          )
                        }
                        className="sr-only"
                      />
                      <div className="">
                        {dish?.visibility ? (
                          <IoIosCheckbox className="text-2xl text-[#2B354D] " />
                        ) : (
                          <MdOutlineCheckBoxOutlineBlank className="text-2xl" />
                        )}
                      </div>
                    </label>
                    <label className="flex items-center justify-between mb-2 cursor-pointer">
                      Availability
                      <input
                        type="checkbox"
                        checked={dish?.availability}
                        onChange={() =>
                          handleToggle(
                            dish.id,
                            "availability",
                            dish?.availability,
                            "dish"
                          )
                        }
                        className="sr-only"
                      />
                      <div className="">
                        {dish?.availability ? (
                          <IoIosCheckbox className="text-2xl text-[#2B354D] " />
                        ) : (
                          <MdOutlineCheckBoxOutlineBlank className="text-2xl" />
                        )}
                      </div>
                    </label>
                  </div>
                ) : null;
              }):<p>No data </p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickMenuContent;
