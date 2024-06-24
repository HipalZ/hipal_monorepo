import DishType from '@/components/atom/dishType';
import { useStore } from '@/components/store/useSelectedDish';
import { Disclosure } from '@headlessui/react';
import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

export default function FilterCard({ data }: { data: any }) {
  const [openChild, setOpenChild] = useState('');
  const { selectedDishes, toggleDishSelection } = useStore();

  const handleDishSelection = (dishId: string) => {
    toggleDishSelection(dishId);
  };

  return (
    <div className="relative w-full overflow-auto scroll-smooth">
      <section id={data?._id} key={data?._id} className="mt-6 w-full max-w-md rounded-2xl bg-white">
        <Disclosure>
          {({ open }) => (
            <>
              <div
                onKeyDown={() => setOpenChild(data?.uuid)}
                onClick={() => setOpenChild(data?.uuid)}
                className={`${open ? 'border border-[#50A466]' : ''} rounded-2xl`}
              >
                <Disclosure.Button
                  className={`${open ? 'bg-[#50A466] text-white' : ''} w-full rounded-t-2xl px-4 pb-4 text-left text-lg font-medium`}
                >
                  <div className="mx-4 mt-4 flex">
                    <div className="-ml-4 mt-[0.125rem]">{data?.dishName}</div>
                    <FiChevronDown className={`${open ? 'rotate-180 transform' : ''} ml-2 mt-2 h-5 w-5`} />
                  </div>
                </Disclosure.Button>

                <div>
                  {openChild === data?.uuid && (
                    <Disclosure.Panel className="pb-2 text-sm transition-all duration-300 ">
                      <div>
                        {data?.items?.map((dish: any, i: number) => (
                          <>
                            <div
                              key={dish._id}
                              className={`mx-4 flex justify-between space-x-2 py-2 ${dish?.dishStatus !== 'cooking' ? 'opacity-20' : ''}`}
                            >
                              <div>
                                <div className="flex items-center text-sm">
                                  <span className="mt-1">
                                    <DishType type={dish?.dishType} />
                                  </span>
                                  <span className="ml-2 text-xl font-semibold">{dish?.dish?.name}</span>
                                </div>
                                {dish?.dish?.portions && (
                                  <div className="relative ml-6 mt-4">
                                    <span className="absolute top-2 h-1 w-1 rounded-full bg-black" />
                                    <span className="ml-3 text-sm font-semibold">{dish?.dish?.portions?.name}</span>
                                  </div>
                                )}
                                {dish?.dish?.extras?.map((extra: any, i: number) => (
                                  <div key={i.toString()} className="mt-4">
                                    <span className="ml-6 rounded-lg bg-[#50A466]/30 px-4 py-1">
                                      {extra.quantity} x {extra.name}
                                    </span>
                                  </div>
                                ))}
                                {dish?.instructions && (
                                  <div key={i.toString()} className="-ml-6 mt-4">
                                    <span className="ml-6 rounded-lg bg-[#50A466]/10 px-4 py-1">{dish?.instructions}</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <input
                                  className=" custom-checkbox"
                                  type="checkbox"
                                  checked={selectedDishes.includes(dish?._id)}
                                  onChange={() => handleDishSelection(dish?._id)}
                                  disabled={dish?.dishStatus !== 'cooking'}
                                />
                              </div>
                            </div>
                            <hr className="mx-4 my-4 border border-dashed border-gray-300" />
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
  );
}
