import { useSearch } from '@/components/store/useSearch';
import type { Extra, IDish } from '@/components/types/businessData';
import { memo, useEffect, useMemo, useState } from 'react';
import SearchPanel from '../searchPanel';

const AddExtras = ({
  handleData,
  Data,
  selectedData,
  closeAddOnPopUp,
}: {
  handleData: (selectedDishes: Extra[]) => void;
  Data: Extra[];
  selectedData: IDish[] | any;
  closeAddOnPopUp: () => void;
}) => {
  const [extras, setExtras] = useState<Extra[]>([]);
  const searchText = useSearch((s) => s.searchText);
  const setSearchText = useSearch((s) => s.setSearchText);

  useEffect(() => {
    setExtras(selectedData);
  }, [selectedData]);

  function handleActiveClick(selectedData: Extra) {
    setExtras((prev: any) => {
      const index = prev.findIndex((item: Extra) => item.id === selectedData.id);
      if (index !== -1) {
        return prev.filter((item: Extra) => item.id !== selectedData.id);
      }
      return [...prev, selectedData];
    });
  }

  useEffect(() => {
    setSearchText('');
  }, []);

  const extrasData = useMemo(() => (Data || []).filter((dish) => dish?.name?.toLowerCase()?.includes(searchText?.toLowerCase())), [Data, searchText]);
  return (
    <div className="rounded-t-[1.5rem] bg-[#F5F5F5]">
      <div className="max-h-[85vh] overflow-y-auto px-6 py-5">
        <h1 className="mb-2 text-2xl text-[#2B354D]">Add Addons</h1>
        <SearchPanel />
        {searchText === ''
          ? Data?.map((eachData) => (
              <div
                key={eachData.id}
                onClick={() => handleActiveClick(eachData)}
                className={`${
                  extras.some((item) => item.id === eachData.id) ? 'border-2 border-[#2B354D]' : 'border-1 border-[#CACACA]'
                } my-5 rounded-md border bg-white p-3`}
              >
                <div className="flex items-center">
                  <input type="checkbox" checked={extras.some((item) => item.id === eachData.id)} className="mr-2 rounded-sm" />
                  <h1 className="mx-2 text-base">{eachData.name}</h1>
                </div>
              </div>
            ))
          : extrasData?.map((eachData) => (
              <div
                key={eachData.id}
                onClick={() => handleActiveClick(eachData)}
                className={`${
                  extras.some((item) => item.id === eachData.id) ? 'border-2 border-[#2B354D]' : 'border-1 border-[#CACACA]'
                } my-5 rounded-md border bg-white p-3`}
              >
                <div className="flex items-center">
                  <input type="checkbox" checked={extras.some((item) => item.id === eachData.id)} className="mr-2 rounded-sm" />
                  <h1 className="mx-2 text-base">{eachData.name}</h1>
                </div>
              </div>
            ))}
        <div className="sticky bottom-5 my-6 flex">
          <button
            type="button"
            onClick={closeAddOnPopUp}
            className="border-1 on_active_bounce mr-2 w-full rounded-md border border-[#2B354D] bg-white py-2.5 text-[#2B354D]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleData(extras)}
            className={`${extras?.length > 0 ? '' : 'pointer-events-none opacity-50'} on_active_bounce w-full rounded-md bg-[#2B354D] py-2.5 text-white`}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(AddExtras);
