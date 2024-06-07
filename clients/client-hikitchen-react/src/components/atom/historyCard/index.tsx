import React from "react";
import { Disclosure } from "@headlessui/react";
import { FiChevronDown } from "react-icons/fi";
import { MdOutlineDelete } from "react-icons/md";
import DishType from "../dishType";

interface Dish {
  _id: string;
  id: string;
  priority: boolean;
  isDeleted: boolean;
  dishType?: string;
  dish: {
    name: string;
    extras?: Array<{ name: string; quantity: number }>;
  };

  tableName?: string;
  kotTime?: string;
}
interface KotCardProps {
  data: Dish[];
  i: number;
}

const HistoryCard: React.FC<KotCardProps> = ({ data, i }) => {
  const sharedDetails = data[0];

  const hasPriority = data?.some((dish) => dish?.priority);

  return (
    <div className="relative w-full overflow-auto scroll-smooth">
      <section className="w-full max-w-md bg-white rounded-2xl">
        <Disclosure>
          {({ open }) => (
            <>
              <div
                className={`${
                  open ? "border border-[#50A466]" : ""
                } rounded-2xl`}
              >
                <Disclosure.Button
                  className={`${
                    hasPriority ? "bg-[#F16D6D] text-white" : ""
                  } w-full px-4 pb-4 text-lg font-medium text-left rounded-t-xl`}
                >
                  <div className="flex justify-between mt-4">
                    <div className="flex items-center justify-between ml-4">
                      <div className="mt-[0.125rem] -ml-4">{`${i}`}</div>
                      <FiChevronDown
                        className={`${
                          open ? "rotate-180 transform" : ""
                        } h-5 w-5 mt-2 ml-2`}
                      />
                    </div>
                    <span className="ml-1">completed</span>
                  </div>
                  <div className="flex relative justify-between text-[#143F40]">
                    <div className="flex justify-between mt-4 space-x-4 text-sm font-semibold">
                      <div>{sharedDetails?.tableName}</div>
                      <div
                        className={`w-1 h-1 md:w-1 md:h-1 lg:w-1.5 lg:h-1.5 rounded-full mt-2 lg:mt-1.5`}
                      ></div>
                      <div className="absolute bg-[#CEE5D4] px-2 rounded-2xl py-1 text-[#50A466] mt-[0.375rem] transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-[45%]">
                        {sharedDetails?.kotTime?.slice(0, 5)}
                      </div>
                    </div>
                  </div>
                </Disclosure.Button>

                <Disclosure.Panel className="pb-2 text-sm transition-all duration-300">
                  {data.map((dish) => (
                    <div
                      key={dish?._id}
                      className="flex justify-between py-2 mx-4 space-x-2"
                    >
                      {dish?.isDeleted ? (
                        <div className="text-[#11116F]">
                          <MdOutlineDelete className="text-xl" />
                          <span className="ml-2 text-xl font-semibold capitalize">
                            {dish?.dish?.name} (Deleted)
                          </span>
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
                          {dish?.dish?.extras?.map((extra, index) => (
                            <div key={index} className="mt-4">
                              <span className="bg-[#50A466]/30 px-4 py-1 rounded-lg ml-6">
                                {extra?.quantity} x {extra?.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </Disclosure.Panel>
              </div>
            </>
          )}
        </Disclosure>
      </section>
    </div>
  );
};

export default HistoryCard;
