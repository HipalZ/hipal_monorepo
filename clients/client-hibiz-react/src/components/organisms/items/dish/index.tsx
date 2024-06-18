import type { IDish } from '@/components/types/businessData';
import { PAGE_TYPES, routePathsWithId } from '@/components/utils/routes';
import { memo, startTransition, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const DishContent = memo(({ dishes, searchText }: { dishes: IDish[]; searchText: string }) => {
  const navigate = useNavigate();
  const [dishesData, setDishesData] = useState<IDish[]>([]);
  const dishData = useMemo(
    () => (dishes || []).filter((dish) => dish?.name?.toLowerCase()?.includes(searchText?.toLowerCase())),
    [dishes, searchText],
  );

  useEffect(() => {
    setDishesData(dishes);
  }, [dishes]);
  const { businessId } = useParams<{ businessId: string }>();
  const handleEditButton = (id:string) => {
    startTransition(() => {
      navigate(`/app/business/${businessId}/items/editDish/${id}`);
    });
  };
  const [isLoading, setIsLoading] = useState(false);
  const addDish = () => {
    setIsLoading(true);
    startTransition(() => {
      navigate(routePathsWithId[PAGE_TYPES.ADD_DISH](businessId || ''));
    });
    setIsLoading(false);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') !== 'Dish') {
      params.set('tab', 'Dish');
      startTransition(() => {
        navigate({ search: params.toString() }, { replace: true });
      });
    }
  }, [location, navigate]);

  return (
    <div className="mb-28 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {searchText === '' ? (
        dishesData && dishesData.length > 0 ? (
          dishesData.map((dish: IDish) => (
            <div key={dish._id} className="m-4 mx-6 my-3 flex justify-between rounded-md border border-[#cacaca] p-4 px-4 py-4">
              <h1 className="w-72 truncate">{dish?.name}</h1>
              <button type="button" className="text-[#2F80ED]" onClick={() => handleEditButton(dish?._id)}>
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
        <button type="button" onClick={addDish} className="on_active_bounce w-full  rounded-md bg-[#000000]  py-2.5 text-white">
          {isLoading ? 'Loading...' : 'Add Dish'}
        </button>
      </div>
    </div>
  );
});

export default DishContent;
