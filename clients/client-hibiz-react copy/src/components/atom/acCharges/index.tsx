import type { ICharges } from '@/components/types/businessData';
import { memo, useEffect, useState } from 'react';
import { RiExchangeDollarLine } from 'react-icons/ri';

const ACCharges = memo(
  ({ handleACCharges, acCharges, selectedData }: { handleACCharges: (data: any) => void; acCharges: ICharges[]; selectedData: ICharges[] }) => {
    const [activeClick, setActiveClick] = useState<ICharges[]>([]);

    useEffect(() => {
      setActiveClick(selectedData);
    }, [selectedData]);

    function handleActiveClick(selectedData: ICharges[]) {
      setActiveClick((prev) => {
        const index = prev.findIndex((item) => item._id === selectedData?._id);
        if (index !== -1) {
          return prev.filter((item) => item._id !== selectedData?._id);
        }
        {
          return [...prev, selectedData];
        }
      });
    }

    return (
      <div className="rounded-t-[1.5rem] bg-[#F5F5F5]">
        <div className="max-h-[85vh] overflow-y-auto px-6 py-5">
          <h1 className="text-2xl text-[#000000]">Add Charges to the zone</h1>
          {acCharges?.map((charge: ICharges) => (
            <div
              key={charge._id}
              onClick={() => handleActiveClick(charge)}
              className={`${
                activeClick?.some((item) => item._id === charge._id) ? 'border-2 border-[#000000]' : 'border-1 border-[#CACACA]'
              } my-5 rounded-md border bg-white p-3`}
            >
              <div className="flex items-center">
                <input type="checkbox" checked={activeClick?.some((item) => item._id === charge._id)} className="mr-2 rounded-sm" />
                <RiExchangeDollarLine />
                <h1 className="mx-2 text-base">{charge?.chargeName}</h1>
              </div>
              <div className="mt-4 flex justify-between">
                <p className="text-sm text-[#000000]/70">{charge?.value}% billing</p>
              </div>
            </div>
          ))}
          <div className="sticky bottom-5 my-6 flex">
            <button
              type="button"
              onClick={() => handleACCharges(activeClick)}
              className="on_active_bounce w-full rounded-md bg-[#000000] py-2.5 text-white"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    );
  },
);

export default ACCharges;
