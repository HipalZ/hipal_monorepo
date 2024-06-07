import { useStore } from '@/components/store/useSelectedDish';
import type { Data } from '@/components/types';
import { Disclosure } from '@headlessui/react';
import { useState } from 'react';
import { BsBoxFill } from 'react-icons/bs';
import { FiChevronDown } from 'react-icons/fi';
import { MdOutlineDelete, MdOutlineSoupKitchen, MdPerson2 } from 'react-icons/md';
import DishType from '../dishType';

export default function KotCard({ data, i, getAllKot }: { data: Data; i: number; getAllKot?: () => void }) {
  const [openChild, setOpenChild] = useState('');
  const { selectedDishes, toggleDishSelection } = useStore();
  const handleDishSelection = (dishId: string) => {
    toggleDishSelection(dishId);
  };

  const shouldShowAccordion = (kots: any) => {
    return kots.filter((kot: any) => {
      return kot.kots.some((dish: any) => dish.dishStatus === 'cooking');
    });
  };
  const hasPriority = data?.kots?.some((kot) => kot.kots.some((dish) => dish.priority));
  const hasDeleted = data?.kots?.some((kot) => kot.kots.some((dish) => dish.isDeleted));
  return (
    <>
      {shouldShowAccordion(data?.kots).length > 0 && (
        <div className="relative w-full overflow-auto scroll-smooth">
          <section id={data?.uuid} key={data?.uuid} className="mt-6 w-full max-w-md rounded-2xl bg-white">
            <Disclosure>
              {({ open }) => (
                <>
                  <div onClick={() => setOpenChild(data?.uuid)} className={`${open ? 'border border-[#50A466]' : ''} rounded-2xl`}>
                    <Disclosure.Button
                      className={`${
                        hasPriority ? 'rounded-2xl bg-[#F16D6D] text-white' : ''
                      } w-full rounded-t-xl px-4 pb-4 text-left text-lg font-medium`}
                    >
                      <div className="mt-4 flex justify-between">
                        <div className="ml-4 flex items-center">
                          <div className="-ml-4 mt-[0.125rem]">{`${i}`}</div>
                          <FiChevronDown className={`${open ? 'rotate-180 transform' : ''} ml-2 mt-2 h-5 w-5`} />
                        </div>
                        {hasDeleted && (
                          <div className="flex items-center rounded-2xl bg-[#0904FD]/20 pl-2 pr-4 text-base">
                            <MdOutlineDelete className="text-lg" />
                            <span className="ml-1">x{data?.deletedDishes}</span>
                            <span className="ml-1">Dish deleted</span>
                          </div>
                        )}
                      </div>
                      <div className={`relative flex justify-between  ${hasPriority ? 'text-white' : 'text-[#143F40]'}`}>
                        <div className="mt-4 flex justify-between space-x-4 text-sm font-semibold">
                          <div>{data?.tableName}</div>
                          <div
                            className={` ${
                              hasPriority ? 'bg-white' : 'bg-black'
                            } mt-2 h-1 w-1 rounded-full md:h-1 md:w-1 lg:mt-1.5 lg:h-1.5 lg:w-1.5`}
                          ></div>
                          <div>{data?.uuid.slice(-4)}</div>
                          <div className="absolute left-[45%] top-1/2 mt-[0.375rem] -translate-x-1/2 -translate-y-1/2 transform rounded-2xl bg-[#CEE5D4] px-2 py-1 text-[#50A466]">
                            {data?.time.slice(0, 5)}
                          </div>
                        </div>
                        <div className="mt-3 flex text-xl font-semibold">
                          <MdOutlineSoupKitchen className="mr-1 mt-1" /> {data?.cooked}/{data?.totalKots}
                        </div>
                      </div>
                    </Disclosure.Button>

                    <div>
                      {openChild === data?.uuid && (
                        <Disclosure.Panel className="pb-2 text-sm transition-all duration-300 ">
                          {data?.kots?.map((kot: any, i: number) => (
                            <div key={kot.id}>
                              <div className="mx-4 mt-4 rounded-xl bg-[#50A466]/10 py-1 text-center text-base font-[500] text-[#50A466]">
                                {kot?.category}
                              </div>
                              {kot?.kots?.map((dish: any, i: number) => (
                                <>
                                  <div
                                    key={dish.id}
                                    className={`mx-4 flex justify-between space-x-2 py-2 ${dish?.dishStatus !== 'cooking' ? 'opacity-20' : ''}`}
                                  >
                                    {dish?.isDeleted ? (
                                      <div>
                                        <div className="mt-2 flex items-center text-sm text-[#11116F]">
                                          <MdOutlineDelete className="text-xl" />
                                          <span className="ml-2 text-xl font-semibold capitalize">{dish?.dish?.name}</span>
                                        </div>
                                        <div className="ml-2 mt-2 rounded-2xl bg-[#11116F]/10 px-4 py-1 text-sm text-[#11116F]">
                                          {dish?.reasonForDelete}
                                        </div>
                                        <div className="ml-2 mt-2 flex items-center text-sm text-[#11116F]">
                                          <BsBoxFill />
                                          <span className="ml-2 mr-1">Inventory was</span>
                                          {dish?.inventory ? 'Used' : 'Not Used'}
                                        </div>
                                        <div className="ml-2 mt-2 flex items-center text-sm text-[#11116F]">
                                          <MdPerson2 className="text-lg" />
                                          <span className="ml-1 capitalize"> {dish?.staffName}</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        <div className="mt-2 flex items-center text-sm">
                                          <span className="mt-1">
                                            <DishType type={dish?.dishType} />
                                          </span>
                                          <span className="ml-2 text-xl font-semibold">{dish?.dish?.name}</span>
                                        </div>
                                        {dish?.dish?.portions && (
                                          <div className="relative ml-6 mt-4">
                                            <span className="absolute top-2 h-1 w-1 rounded-full bg-black"></span>
                                            <span className="ml-3 text-sm font-semibold">{dish?.dish?.portions?.name}</span>
                                          </div>
                                        )}
                                        {dish?.dish?.extras?.map((extra: any, i: number) => (
                                          <div key={i} className="mt-4">
                                            <span className="ml-6 rounded-lg bg-[#50A466]/30 px-4 py-1">
                                              {extra.quantity} x {extra.name}
                                            </span>
                                          </div>
                                        ))}
                                        {dish?.instructions && (
                                          <div key={i} className="-ml-6 mt-4">
                                            <span className="ml-6 rounded-lg bg-[#50A466]/10 px-4 py-1">{dish?.instructions}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    <div>
                                      <input
                                        className="custom-checkbox"
                                        type="checkbox"
                                        checked={selectedDishes.includes(dish?.id)}
                                        onChange={() => {
                                          handleDishSelection(dish?.id);
                                        }}
                                        disabled={dish?.dishStatus !== 'cooking'}
                                      />
                                    </div>
                                  </div>
                                  <hr className="mx-4 my-4 border border-dashed border-gray-300" />
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
