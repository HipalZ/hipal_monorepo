import { Disclosure } from "@headlessui/react";
import { FiChevronDown } from "react-icons/fi";
import { useState } from "react";
import DishType from "../dishType";
import {
  MdOutlineDelete,
  MdOutlineSoupKitchen,
  MdPerson2,
} from "react-icons/md";
import { useStore } from "@/components/store/useSelectedDish";
import type { Data } from "@/components/types";
import { BsBoxFill } from "react-icons/bs";

export default function KotCard({
  data,
  i,
  getAllKot,
}: {
  data: Data;
  i: number;
  getAllKot?: () => void;
}) {
  const [openChild, setOpenChild] = useState("");
  const { selectedDishes, toggleDishSelection } = useStore();
  const handleDishSelection = (dishId: string) => {
    toggleDishSelection(dishId);
  };

  const shouldShowAccordion = (kots: any) => {
    return kots.filter((kot: any) => {
      return kot.kots.some((dish: any) => dish.dishStatus === "cooking");
    });
  };
  const hasPriority = data?.kots?.some((kot) =>
    kot.kots.some((dish) => dish.priority)
  );
  const hasDeleted = data?.kots?.some((kot) =>
    kot.kots.some((dish) => dish.isDeleted)
  );
  return (
    <>
      {shouldShowAccordion(data?.kots).length > 0 && (
        <div className="relative w-full overflow-auto scroll-smooth">
          <section
            id={data?.uuid}
            key={data?.uuid}
            className="w-full max-w-md mt-6 bg-white rounded-2xl"
          >
            <Disclosure>
              {({ open }) => (
                <>
                  <div
                    onClick={() => setOpenChild(data?.uuid)}
                    className={`${
                      open ? "border border-[#50A466]" : ""
                    } rounded-2xl`}
                  >
                    <Disclosure.Button
                      className={`${
                        hasPriority ? "bg-[#F16D6D] text-white rounded-2xl" : ""
                      } w-full px-4 pb-4 text-lg font-medium text-left rounded-t-xl`}
                    >
                      <div className="flex justify-between mt-4">
                        <div className="flex items-center ml-4">
                          <div className="mt-[0.125rem] -ml-4">{`${i}`}</div>
                          <FiChevronDown
                            className={`${
                              open ? "rotate-180 transform" : ""
                            } h-5 w-5 mt-2 ml-2`}
                          />
                        </div>
                        {hasDeleted && (
                          <div className="bg-[#0904FD]/20 rounded-2xl pl-2 pr-4 flex items-center text-base">
                            <MdOutlineDelete className="text-lg" />
                            <span className="ml-1">x{data?.deletedDishes}</span>
                            <span className="ml-1">Dish deleted</span>
                          </div>
                        )}
                      </div>
                      <div
                        className={`flex relative justify-between  ${
                          hasPriority ? "text-white" : "text-[#143F40]"
                        }`}
                      >
                        <div className="flex justify-between mt-4 space-x-4 text-sm font-semibold">
                          <div>{data?.tableName}</div>
                          <div
                            className={` ${
                              hasPriority ? "bg-white" : "bg-black"
                            } w-1 h-1 md:w-1 md:h-1 lg:w-1.5 lg:h-1.5 rounded-full mt-2 lg:mt-1.5`}
                          ></div>
                          <div>{data?.uuid.slice(-4)}</div>
                          <div className="absolute bg-[#CEE5D4] px-2 rounded-2xl py-1 text-[#50A466] mt-[0.375rem] transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-[45%]">
                            {data?.time.slice(0, 5)}
                          </div>
                        </div>
                        <div className="flex mt-3 text-xl font-semibold">
                          <MdOutlineSoupKitchen className="mt-1 mr-1" />{" "}
                          {data?.cooked}/{data?.totalKots}
                        </div>
                      </div>
                    </Disclosure.Button>

                    <div>
                      {openChild === data?.uuid && (
                        <Disclosure.Panel className="pb-2 text-sm transition-all duration-300 ">
                          {data?.kots?.map((kot: any, i: number) => (
                            <div key={kot.id}>
                              <div className="bg-[#50A466]/10 mt-4 text-center mx-4 py-1 rounded-xl text-[#50A466] text-base font-[500]">
                                {kot?.category}
                              </div>
                              {kot?.kots?.map((dish: any, i: number) => (
                                <>
                                  <div
                                    key={dish.id}
                                    className={`flex justify-between py-2 mx-4 space-x-2 ${
                                      dish?.dishStatus !== "cooking"
                                        ? "opacity-20"
                                        : ""
                                    }`}
                                  >
                                    {dish?.isDeleted ? (
                                      <div>
                                        <div className="flex items-center mt-2 text-sm text-[#11116F]">
                                          <MdOutlineDelete className="text-xl" />
                                          <span className="ml-2 text-xl font-semibold capitalize">
                                            {dish?.dish?.name}
                                          </span>
                                        </div>
                                        <div className="mt-2 text-sm ml-2 bg-[#11116F]/10 rounded-2xl px-4 py-1 text-[#11116F]">
                                          {dish?.reasonForDelete}
                                        </div>
                                        <div className="mt-2 flex items-center text-sm ml-2 text-[#11116F]">
                                          <BsBoxFill />
                                          <span className="ml-2 mr-1">
                                            Inventory was
                                          </span>
                                          {dish?.inventory
                                            ? "Used"
                                            : "Not Used"}
                                        </div>
                                        <div className="mt-2 flex items-center text-sm ml-2 text-[#11116F]">
                                          <MdPerson2 className="text-lg" />
                                          <span className="ml-1 capitalize">
                                            {" "}
                                            {dish?.staffName}
                                          </span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        <div className="flex items-center mt-2 text-sm">
                                          <span className="mt-1">
                                            <DishType type={dish?.dishType} />
                                          </span>
                                          <span className="ml-2 text-xl font-semibold">
                                            {dish?.dish?.name}
                                          </span>
                                        </div>
                                        {dish?.dish?.portions && (
                                          <div className="relative mt-4 ml-6">
                                            <span className="absolute w-1 h-1 bg-black rounded-full top-2"></span>
                                            <span className="ml-3 text-sm font-semibold">
                                              {dish?.dish?.portions?.name}
                                            </span>
                                          </div>
                                        )}
                                        {dish?.dish?.extras?.map(
                                          (extra: any, i: number) => (
                                            <div key={i} className="mt-4">
                                              <span className="bg-[#50A466]/30 px-4 py-1 rounded-lg ml-6">
                                                {extra.quantity} x {extra.name}
                                              </span>
                                            </div>
                                          )
                                        )}
                                        {dish?.instructions && (
                                          <div key={i} className="mt-4 -ml-6">
                                            <span className="bg-[#50A466]/10 px-4 py-1 rounded-lg ml-6">
                                              {dish?.instructions}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    <div>
                                      <input
                                        className="custom-checkbox"
                                        type="checkbox"
                                        checked={selectedDishes.includes(
                                          dish?.id
                                        )}
                                        onChange={() => {
                                          handleDishSelection(dish?.id);
                                        }}
                                        disabled={
                                          dish?.dishStatus !== "cooking"
                                        }
                                      />
                                    </div>
                                  </div>
                                  <hr className="mx-4 my-4 border border-gray-300 border-dashed" />
                                </>
                              ))}
                            </div>
                          ))}
                        </Disclosure.Panel>
                      )}
                    </div>
                  </div>
                </>
              )}
            </Disclosure>
          </section>
        </div>
      )}
    </>
  );
}
