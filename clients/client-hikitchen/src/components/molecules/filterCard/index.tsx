import { Disclosure } from "@headlessui/react";
import { FiChevronDown } from "react-icons/fi";
import { useState } from "react";
import { useStore } from "@/components/store/useSelectedDish";
import DishType from "@/components/atom/dishType";

export default function FilterCard({ data }: { data: any }) {
  const [openChild, setOpenChild] = useState("");
  const { selectedDishes, toggleDishSelection } = useStore();

  const handleDishSelection = (dishId: string) => {
    toggleDishSelection(dishId);
  };

  return (
    <>
      <div className="relative w-full overflow-auto scroll-smooth">
        <section
          id={data?.id}
          key={data?.id}
          className="w-full max-w-md mt-6 bg-white rounded-2xl"
        >
          <Disclosure >
            {({ open }) => (
              <>
                <div
                  onKeyDown={() => setOpenChild(data?.uuid)}
                  onClick={() => setOpenChild(data?.uuid)}
                  className={`${
                    open ? "border border-[#50A466]" : ""
                  } rounded-2xl`}
                >
                  <Disclosure.Button
                    className={`${
                      open ? "bg-[#50A466] text-white" : ""
                    } w-full px-4 pb-4 text-lg font-medium text-left rounded-t-2xl`}
                  >
                    <div className="flex mx-4 mt-4">
                      <div className="mt-[0.125rem] -ml-4">
                        {data?.dishName}
                      </div>
                      <FiChevronDown
                        className={`${
                          open ? "rotate-180 transform" : ""
                        } h-5 w-5 mt-2 ml-2`}
                      />
                    </div>
                  </Disclosure.Button>

                  <div>
                    {openChild === data?.uuid && (
                      <Disclosure.Panel className="pb-2 text-sm transition-all duration-300 ">
                        <div>
                          {data?.items?.map((dish: any, i: number) => (
                            <>
                              <div
                                key={dish.id}
                                className={`flex justify-between py-2 mx-4 space-x-2 ${
                                  dish?.dishStatus !== "cooking"
                                    ? "opacity-20"
                                    : ""
                                }`}
                              >
                                <div>
                                  <div className="flex items-center text-sm">
                                    <span className="mt-1">
                                      <DishType type={dish?.dishType} />
                                    </span>
                                    <span className="ml-2 text-xl font-semibold">
                                      {dish?.dish?.name}
                                    </span>
                                  </div>
                                  {dish?.dish?.portions && (
                                    <div className="relative mt-4 ml-6">
                                      <span className="absolute w-1 h-1 bg-black rounded-full top-2" />
                                      <span className="ml-3 text-sm font-semibold">
                                        {dish?.dish?.portions?.name}
                                      </span>
                                    </div>
                                  )}
                                  {dish?.dish?.extras?.map(
                                    (extra: any, i: number) => (
                                      <div key={i.toString()} className="mt-4">
                                        <span className="bg-[#50A466]/30 px-4 py-1 rounded-lg ml-6">
                                          {extra.quantity} x {extra.name}
                                        </span>
                                      </div>
                                    )
                                  )}
                                  {dish?.instructions && (
                                    <div key={i.toString()} className="mt-4 -ml-6">
                                      <span className="bg-[#50A466]/10 px-4 py-1 rounded-lg ml-6">
                                        {dish?.instructions}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <input
                                    className=" custom-checkbox"
                                    type="checkbox"
                                    checked={selectedDishes.includes(dish?.id)}
                                    onChange={() =>
                                      handleDishSelection(dish?.id)
                                    }
                                    disabled={dish?.dishStatus !== "cooking"}
                                  />
                                </div>
                              </div>
                              <hr className="mx-4 my-4 border border-gray-300 border-dashed" />
                            </>
                          ))}
                        </div>
                      </Disclosure.Panel>
                    )}
                  </div>
                </div>
              </>
            )}
          </Disclosure>
        </section>
      </div>
    </>
  );
}
