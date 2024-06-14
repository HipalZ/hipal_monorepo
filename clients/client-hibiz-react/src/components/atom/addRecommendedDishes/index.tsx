import { useSearch } from '@/components/store/useSearch';
import type { Category, IDish } from '@/components/types/businessData';
import { memo, useEffect, useMemo, useState } from 'react';
import SearchPanel from '../searchPanel';

type DataArray = IDish[] | Category[];
const AddRecommendedDishes = <T extends DataArray>({
  handleData,
  Data,
  closeRecommendPopup,
  selectedData,
  headerText,
}: {
  handleData: (selectedDishes: T) => void;
  Data: T;
  closeRecommendPopup: () => void;
  selectedData: DataArray;
  headerText: string;
}) => {
  const [recommendDish, setRecommendDish] = useState<IDish[] | Category[]>([]);
  const searchText = useSearch((s) => s.searchText);
  const setSearchText = useSearch((s) => s.setSearchText);
  useEffect(() => {
    setSearchText('');
  }, []);
  const closeSearchBox = () => {};
  useEffect(() => {
    setRecommendDish(selectedData);
  }, []);
  const dishData = useMemo(() => (Data || []).filter((dish) => dish?.name?.toLowerCase()?.includes(searchText?.toLowerCase())), [Data, searchText]);
  function handleActiveClick(selectedData: IDish | Category) {
    setRecommendDish((prev) => {
      const index = prev.findIndex((item) => item._id === selectedData._id);
      if (index !== -1) {
        return prev.filter((item) => item._id !== selectedData._id);
      }
      return [...prev, { _id: selectedData._id, name: selectedData.name }];
    });
  }

  return (
    <div className="rounded-t-[1.5rem] bg-[#F5F5F5]">
      <div className="max-h-[85vh] overflow-y-auto px-6 py-5">
        <h1 className="mb-2 text-2xl text-[#2B354D]">Add {headerText}</h1>
        <SearchPanel closeSearchBox={closeSearchBox} />
        {searchText === ''
          ? Data?.map((eachData) => (
              <div
                key={eachData._id}
                onClick={() => handleActiveClick(eachData)}
                className={`${
                  recommendDish.some((item) => item._id === eachData._id) ? 'border-2 border-[#2B354D]' : 'border-1 border-[#CACACA]'
                } my-5 rounded-md border bg-white p-3`}
              >
                <div className="flex items-center">
                  <input type="checkbox" checked={recommendDish?.some((item) => item._id === eachData._id)} className="mr-2 rounded-sm" />
                  <h1 className="mx-2 text-base">{eachData.name}</h1>
                </div>
              </div>
            ))
          : dishData?.map((eachData) => (
              <div
                key={eachData?._id}
                onClick={() => handleActiveClick(eachData)}
                className={`${
                  recommendDish?.some((item) => item._id === eachData._id) ? 'border-2 border-[#2B354D]' : 'border-1 border-[#CACACA]'
                } my-5 rounded-md border bg-white p-3`}
              >
                <div className="flex items-center">
                  <input type="checkbox" checked={recommendDish?.some((item) => item._id === eachData._id)} className="mr-2 rounded-sm" />
                  <h1 className="mx-2 text-base">{eachData.name}</h1>
                </div>
              </div>
            ))}
        <div className="sticky bottom-5 my-6 flex">
          <button
            type="button"
            onClick={closeRecommendPopup}
            className="border-1 on_active_bounce mr-2 w-full rounded-md border border-[#2B354D] bg-white py-2.5 text-[#2B354D]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleData(recommendDish)}
            className={`${recommendDish?.length > 0 ? '' : 'pointer-events-none opacity-50'} on_active_bounce w-full rounded-md bg-[#2B354D] py-2.5 text-white`}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(AddRecommendedDishes);
