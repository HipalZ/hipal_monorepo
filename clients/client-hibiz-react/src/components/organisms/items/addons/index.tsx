import type { IAddOn } from '@/components/types/businessData';
import { PAGE_TYPES, routePathsWithId, routePathsWithIds } from '@/components/utils/routes';
import { memo, startTransition, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const AddOns = memo(({ addOns, searchText }: { addOns: IAddOn[]; searchText: string }) => {
  const navigate = useNavigate();
  const { businessId } = useParams<{ businessId: string }>();
  const handleAddOnClick = () => {
    startTransition(() => {
      navigate(routePathsWithId[PAGE_TYPES.ADD_ADD_ONS](businessId || ''));
    });
  };
  const EditAddOn = (addOnId: string) => {
    startTransition(() => {
      navigate(routePathsWithIds[PAGE_TYPES.EDIT_ADD_ONS](businessId || '', addOnId));
    });
  };
  const [addOnData, setAddOnData] = useState<IAddOn[]>(addOns);
  const addOnSearch = useMemo(
    () => (addOns || []).filter((addOn) => addOn?.name?.toLowerCase()?.includes(searchText?.toLowerCase())),
    [addOns, searchText],
  );
  useEffect(() => {
    setAddOnData(addOns);
  }, [addOns]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') !== 'Add Ons') {
      params.set('tab', 'Add Ons');
      startTransition(() => {
        navigate({ search: params.toString() }, { replace: true });
      });
    }
  }, [location, navigate]);

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
          <button type="button" className="w-full rounded-md bg-[#000000] py-2 text-white">
            Add
          </button>
        </div>
      </div>
    </section>
  );
});

export default AddOns;
