import { useSearch } from '@/components/store/useSearch';
import type { IDish } from '@/components/types/businessData';
import { PAGE_TYPES, routePathsWithId } from '@/components/utils/routes';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

const DishContent = ({ dishes, searchText }: { dishes: IDish[]; searchText: string }) => {
  const setSearchText = useSearch((s) => s.setSearchText);
  const [dishesData, setDishesData] = useState<IDish[]>([]);
  const dishData = useMemo(
    () => (dishes || []).filter((dish) => dish?.name?.toLowerCase()?.includes(searchText?.toLowerCase())),
    [dishes, searchText],
  );

  useEffect(() => {
    setDishesData(dishes);
  }, [dishes]);
  const router = useRouter();
  const { businessId } = router.query as { businessId: string };
  const handleEditButton = (zone: any) => {
    const { _id } = zone;
    router.push(`/business/${businessId}/items/editDish/${_id}`);
  };
  const [isLoading, setIsLoading] = useState(false);
  const addDish = () => {
    setIsLoading(true);
    router.push(routePathsWithId[PAGE_TYPES.ADD_DISH](businessId));
    setIsLoading(false);
    setSearchText('');
  };
  useEffect(() => {
    router.query.tab = 'Dish';
    router.push(router);
  }, []);
  return (
    <>
      <div className="mb-28 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {searchText === '' ? (
          dishesData && dishesData.length > 0 ? (
            dishesData.map((dish: IDish) => (
              <div key={dish._id} className="m-4 mx-6 my-3 flex justify-between rounded-md border border-[#cacaca] p-4 px-4 py-4">
                <h1 className="w-72 truncate">{dish?.name}</h1>
                <button type="button" className="text-[#2F80ED]" onClick={() => handleEditButton(dish)}>
                  Edit
                </button>
              </div>
            ))
          ) : (
            <div className="fixed left-1/2 top-1/2 flex -translate-x-1/2 transform flex-col text-center">No Dishes Found</div>
          )
        ) : dishData && dishesData.length > 0 ? (
          dishData.map((dish: IDish) => (
            <div key={dish._id} className="m-4 mx-6 my-3 flex justify-between rounded-md border border-[#cacaca] p-4 px-4 py-4">
              <h1 className="w-72 truncate">{dish?.name}</h1>
              <button type="button" className="text-[#2F80ED]" onClick={() => handleEditButton(dish)}>
                Edit
              </button>
            </div>
          ))
        ) : (
          <div className="fixed left-1/2 top-1/2 flex -translate-x-1/2 transform flex-col text-center">No Dishes Found</div>
        )}

        <div className="fixed bottom-5 w-full px-6">
          <button type="button" onClick={addDish} className="on_active_bounce w-full  rounded-md bg-[#2B354D]  py-2.5 text-white">
            {isLoading ? 'Loading...' : 'Add Dish'}
          </button>
        </div>
      </div>
    </>
  );
};

export default DishContent;
