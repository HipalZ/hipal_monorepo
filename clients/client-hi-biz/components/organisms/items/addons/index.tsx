import type { IAddOn } from '@/components/types/businessData';
import { PAGE_TYPES, routePathsWithId, routePathsWithIds } from '@/components/utils/routes';
import { useRouter } from 'next/router';
import { memo, useEffect, useMemo, useState } from 'react';

const AddOns = ({ addOns, searchText }: { addOns: IAddOn[]; searchText: string }) => {
  const router = useRouter();
  const { businessId } = router.query as { businessId: string };
  const handleAddOnClick = () => {
    router.push(routePathsWithId[PAGE_TYPES.ADD_ADD_ONS](businessId));
  };
  const EditAddOn = (addOnId: string) => {
    router.push(routePathsWithIds[PAGE_TYPES.EDIT_ADD_ONS](businessId, addOnId));
  };
  const [addOnData, setAddOnData] = useState<IAddOn[]>(addOns);
  let addOnSearch = useMemo(
    () => (addOns || []).filter((addOn) => addOn?.name?.toLowerCase()?.includes(searchText?.toLowerCase())),
    [addOns, searchText],
  );
  useEffect(() => {
    setAddOnData(addOns);
  }, [addOns]);
  useEffect(() => {
    router.query.tab = 'Add Ons';
    router.push(router);
  }, []);
  return (
    <section>
      <div className="pb-[5rem]">
        {searchText === '' ? (
          addOnData.length > 0 ? (
            <div className="masonry-layout mt-6 px-6">
              {addOnData.map((addOn) => (
                <div key={addOn?._id} className="masonry-item space-y-2 rounded-md border border-[#cacaca] px-4 py-2">
                  <h6 className="w-48 truncate font-semibold">{addOn?.name}</h6>
                  <div className="flex justify-between">
                    <span>{addOn?.items?.length} variations</span>
                    <button type="button" onClick={() => EditAddOn(addOn?._id)} className="text-[#2F80ED]">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="fixed left-1/2 top-1/2 z-20 flex -translate-x-1/2 transform items-center justify-center  space-x-4">No Addons found</div>
          )
        ) : addOnSearch.length > 0 ? (
          <div className="masonry-layout mt-6 px-6">
            {addOnSearch.map((addOn) => (
              <div key={addOn?._id} className="masonry-item mt-6 space-y-2 rounded-md border border-[#cacaca] px-4 py-2">
                <h6 className="w-48 truncate font-semibold">{addOn?.name}</h6>
                <div className="flex justify-between">
                  <span>{addOn?.items?.length} variations</span>
                  <button type="button" onClick={() => EditAddOn(addOn?._id)} className="text-[#2F80ED]">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="fixed left-1/2 top-1/2 z-20 flex -translate-x-1/2 transform items-center justify-center space-x-4">No Addons found</div>
        )}
        <div onKeyUp={handleAddOnClick} onClick={handleAddOnClick} className="fixed bottom-0 w-full cursor-pointer bg-white p-4 outline-none">
          <button type="button" className="w-full rounded-md bg-[#2B354D] py-2 text-white">
            Add
          </button>
        </div>
      </div>
    </section>
  );
};

export default memo(AddOns);
