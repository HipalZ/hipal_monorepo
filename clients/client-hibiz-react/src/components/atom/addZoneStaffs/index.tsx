import SearchPanel from '@/components/atom/searchPanel';
import { useSearch } from '@/components/store/useSearch';
import type { IStaffs } from '@/components/types/businessData';
import { memo, useEffect, useMemo, useState } from 'react';
import { BsFillPersonFill } from 'react-icons/bs';

const AddZoneStaffs = memo(({ handleData, Data, selectedData }: { handleData: any; Data: IStaffs[]; selectedData: IStaffs[] }) => {
  const [activeClick, setActiveClick] = useState<Array<Record<string, any>>>([]);
  const searchText = useSearch((s) => s.searchText);
  const setSearchText = useSearch((s) => s.setSearchText);
  useEffect(() => {
    setSearchText('');
  }, []);
  const closeSearchBox = () => {};
  useEffect(() => {
    setActiveClick(selectedData);
  }, [selectedData]);

  const staffData = useMemo(() => (Data || []).filter((data) => data?.name?.toLowerCase()?.includes(searchText?.toLowerCase())), [Data, searchText]);

  function handleActiveClick(selectedData: any) {
    setActiveClick((prev: any) => {
      const index = prev.findIndex((item: any) => item._id === selectedData._id);
      if (index !== -1) {
        return prev.filter((item: any) => item._id !== selectedData._id);
      }
      return [...prev, selectedData];
    });
  }

  return (
    <div className="rounded-t-[1.5rem] bg-[#F5F5F5]">
      <div className="max-h-[85vh] overflow-y-auto px-6 py-5">
        <h1 className="text-2xl text-[#000000]">Add staff to the zone</h1>
        <SearchPanel closeSearchBox={closeSearchBox} />
        {searchText === ''
          ? Data?.map((eachData: IStaffs) => (
              <div
                key={eachData._id}
                onClick={() => handleActiveClick(eachData)}
                className={`${
                  activeClick?.some((item) => item._id === eachData._id) ? 'border-2 border-[#000000]' : 'border-1 border-[#CACACA]'
                } my-5 rounded-md border bg-white p-3`}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={activeClick?.some((item) => item._id === eachData._id)}
                    onChange={() => {}}
                    className="mr-2 rounded-sm"
                  />
                  <BsFillPersonFill />
                  <h1 className="mx-2 text-base">{eachData?.name}</h1>
                </div>
                <div className="mt-2 flex justify-between">
                  <p className="text-sm text-[#000000]/70">{eachData?.customRole?.[0]?.roleName}</p>
                </div>
              </div>
            ))
          : staffData?.map((eachData) => (
              <div
                key={eachData._id}
                onClick={() => handleActiveClick(eachData)}
                className={`${
                  activeClick?.some((item) => item._id === eachData._id) ? 'border-2 border-[#000000]' : 'border-1 border-[#CACACA]'
                } my-5 rounded-md border bg-white p-3`}
              >
                <div className="flex items-center">
                  <input type="checkbox" checked={activeClick?.some((item) => item._id === eachData._id)} className="mr-2 rounded-sm" />
                  <BsFillPersonFill />
                  <h1 className="mx-2 text-base">{eachData?.name}</h1>
                </div>
                <div className="mt-2 flex justify-between">
                  <p className="text-sm text-[#000000]/70">{eachData?.customRole?.[0]?.roleName}</p>
                </div>
              </div>
            ))}
        <div className="sticky bottom-5 my-6">
          <button
            type="button"
            onClick={() => {
              handleData(activeClick);
            }}
            className="on_active_bounce w-full rounded-md bg-[#000000] py-2.5 text-white"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
});

export default AddZoneStaffs;
