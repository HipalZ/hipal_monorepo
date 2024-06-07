import { Disclosure } from '@headlessui/react';
import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { MdOutlineDelete } from 'react-icons/md';
import DishType from '../dishType';

interface Dish {
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
  const [openChild, setOpenChild] = useState<string>('');
  const sharedDetails = data[0];

  const hasPriority = data?.some((dish) => dish?.priority);

  return (
    <div className="relative w-full overflow-auto scroll-smooth">
      <section className="w-full max-w-md rounded-2xl bg-white">
        <Disclosure>
          {({ open }) => (
            <>
              <div onClick={() => setOpenChild(sharedDetails?.tableName || '')} className={`${open ? 'border border-[#50A466]' : ''} rounded-2xl`}>
                <Disclosure.Button
                  className={`${hasPriority ? 'bg-[#F16D6D] text-white' : ''} w-full rounded-t-xl px-4 pb-4 text-left text-lg font-medium`}
                >
                  <div className="mt-4 flex justify-between">
                    <div className="ml-4 flex items-center justify-between">
                      <div className="-ml-4 mt-[0.125rem]">{`${i}`}</div>
                      <FiChevronDown className={`${open ? 'rotate-180 transform' : ''} ml-2 mt-2 h-5 w-5`} />
                    </div>
                    <span className="ml-1">completed</span>
                  </div>
                  <div className="relative flex justify-between text-[#143F40]">
                    <div className="mt-4 flex justify-between space-x-4 text-sm font-semibold">
                      <div>{sharedDetails?.tableName}</div>
                      <div className={`mt-2 h-1 w-1 rounded-full md:h-1 md:w-1 lg:mt-1.5 lg:h-1.5 lg:w-1.5`}></div>
                      <div className="absolute left-[45%] top-1/2 mt-[0.375rem] -translate-x-1/2 -translate-y-1/2 transform rounded-2xl bg-[#CEE5D4] px-2 py-1 text-[#50A466]">
                        {sharedDetails?.kotTime?.slice(0, 5)}
                      </div>
                    </div>
                  </div>
                </Disclosure.Button>

                <Disclosure.Panel className="pb-2 text-sm transition-all duration-300">
                  {data.map((dish) => (
                    <div key={dish?.id} className="mx-4 flex justify-between space-x-2 py-2">
                      {dish?.isDeleted ? (
                        <div className="text-[#11116F]">
                          <MdOutlineDelete className="text-xl" />
                          <span className="ml-2 text-xl font-semibold capitalize">{dish?.dish?.name} (Deleted)</span>
                        </div>
                      ) : (
                        <div>
                          <div className="mt-2 flex items-center text-sm">
                            <span className="mt-1">
                              <DishType type={dish?.dishType} />
                            </span>
                            <span className="ml-2 text-xl font-semibold">{dish?.dish?.name}</span>
                          </div>
                          {dish?.dish?.extras?.map((extra, index) => (
                            <div key={index} className="mt-4">
                              <span className="ml-6 rounded-lg bg-[#50A466]/30 px-4 py-1">
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
