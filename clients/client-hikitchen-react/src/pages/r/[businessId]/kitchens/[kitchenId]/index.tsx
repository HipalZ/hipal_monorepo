import axios from '@/axios';
import HistoryCard from '@/components/atom/historyCard';
import KitchenComponent from '@/components/atom/kitchenComponent';
import KotCard from '@/components/atom/kotCard';
import FilterCard from '@/components/molecules/filterCard';
import Header from '@/components/molecules/header';
import { useBusinessData } from '@/components/store/useBusinessData';
import { useKotStore } from '@/components/store/useKot';
import { useStore } from '@/components/store/useSelectedDish';
import { useUserLogin } from '@/components/store/useUserLogin';
import type { Data, Kot } from '@/components/types';
import { startTransition, useEffect } from 'react';
import { MdSignalWifi0Bar } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

function KotComponent() {
  const { businessId, kitchenId } = useParams<{
    businessId: string;
    kitchenId: string;
  }>();

  const navigate = useNavigate();

  const kotData = useKotStore((s) => s.kotData);
  const updatedFilters = useKotStore((s) => s.updatedFilters);
  const filterData = useKotStore((s) => s.filterData);
  const filter = useKotStore((s) => s.filter);
  const setKotData = useKotStore((s) => s.setKotData);
  const setFilterData = useKotStore((s) => s.setFilterData);
  const setHistoryData = useKotStore((s) => s.setHistoryData);
  const setUpdatedFilters = useKotStore((s) => s.setUpdatedFilters);
  const historyData = useKotStore((s) => s.historyData);
  const kitchenName = useUserLogin((s) => s.kitchenName);
  const id = useBusinessData((s) => s.businessData.id);

  const { selectedDishes, clearSelectedDishes } = useStore();
  const main = kotData?.slice(0, kotData?.length);
  const updateData: Data[] = main?.filter((item: Data) => item.cooked !== item.totalKots);

  const getAllKot = async () => {
    try {
      const res = await axios(`/v1/kitchens/Allkots/ByKitchens?kitchenId=${kitchenId}`);

      if (res.status === 200) {
        setKotData(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getHistoryKot = async () => {
    try {
      const res = await axios(`/v1/kitchens/${kitchenId}/kitchenHistory?businessId=${businessId}`);

      if (res.status === 200) {
        setHistoryData(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getFilterKot = async () => {
    try {
      const res = await axios(`/v1/kitchens/Allkots/ByKitchens?kitchenId=${kitchenId}&items=true`);

      if (res.status === 200) {
        setFilterData(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const filterOutCookedDishes = (data: Data[]): Data[] => {
    return data
      .map((dish) => {
        return {
          ...dish,
          items: dish?.items?.filter((item) => item.dishStatus !== 'cooked'),
        };
      })
      .filter((dish) => dish?.items?.length > 0);
  };

  const filteredData = filterOutCookedDishes(filterData);
  const updateDishStatus = async () => {
    try {
      if (updateData.length > 0) {
        const config = {
          method: 'put',
          url: '/v1/kitchens/4545554555/kots',
          data: {
            kots: selectedDishes,
          },
        };
        await axios(config);
        getAllKot();
        getFilterKot();
        clearSelectedDishes();
      } else {
        toast.error('No Dish to Cook');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updatedFilteredData = updateData?.filter((item) => {
    const lowerCaseFilter = updatedFilters.toLowerCase();
    if (lowerCaseFilter.includes('priority items')) {
      return item.kots?.some((kot) => kot.kots?.some((innerKot) => innerKot.priority));
    }
    if (lowerCaseFilter.includes('deleted items')) {
      return item.kots?.some((kot) => kot.kots?.some((innerKot) => innerKot.isDeleted));
    }
    return true;
  });

  const groupByKotTime = (data: any) => {
    const groups: { [kotTime: string]: Kot[] } = {};

    for (const kot of data) {
      const kotTime = kot?.kotTime;
      if (!groups[kotTime]) {
        groups[kotTime] = [];
      }
      groups[kotTime].push(kot);
    }

    return Object.values(groups);
  };
  const groupedData = groupByKotTime(historyData);

  useEffect(() => {
    if (kitchenId === undefined) {
      startTransition(() => {
        return navigate(`/r/${id}/kitchens`);
      });
    }
    if (filter === 'Orders') {
      getAllKot();
    } else if (filter === 'History') {
      getHistoryKot();
    } else if (filter === 'Dishes') {
      getFilterKot();
    }
    setUpdatedFilters('No filters');
  }, [filter]);

  return (
    <div className="min-h-screen w-full bg-[#f5f5f5]">
      <Header businessId={businessId}>
        <div className="text-lg font-semibold capitalize md:text-xl lg:text-2xl xl:text-3xl">{kitchenName}</div>
      </Header>
      {kotData.length > 0 && <KitchenComponent allKots={updateData.length || 0} cookingDishes={kotData[kotData.length - 1]?.cookingDishes || 0} />}

      {filter === 'Orders' ? (
        <div>
          {updatedFilteredData?.length > 0 ? (
            <div className="masonry-layout mx-6 pb-[5rem]">
              {updatedFilteredData.map((item, i) => (
                <div key={i.toString()} className="masonry-item mx-6">
                  <KotCard data={item} i={i + 1} getAllKot={getAllKot} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-[20vh]">
              <div className="flex items-center justify-center ">
                <MdSignalWifi0Bar className="mt-12 text-[20vh] opacity-40" />
              </div>
              <div className="mx-[15vw] text-center">
                <span className="font-semibold">There are no Kots</span>{' '}
                <span className="font-semibold opacity-40 "> , try changing the filter back to “No filter” </span>
              </div>
            </div>
          )}
        </div>
      ) : filter === 'Dishes' ? (
        <>
          {filterData.length > 0 ? (
            <div className="masonry-layout mx-6 pb-[5rem]">
              {filteredData?.map((item: any, i: number) => (
                <div key={'item' + i} className="masonry-item">
                  <FilterCard data={item} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-[20vh]">
              <div className="flex items-center justify-center">
                <MdSignalWifi0Bar className="mt-12 text-[20vh] opacity-40" />
              </div>
              <div className="mx-[15vw] text-center">
                <span className="font-semibold">There are no Kots</span>{' '}
                <span className="font-semibold opacity-40 "> , try changing the filter back to “No filter” </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {historyData.length > 0 ? (
            <div className="masonry-layout mx-6 mt-6 pb-[5rem]">
              {groupedData?.map((item: any, i: number) => (
                <div key={i.toString()} className="masonry-item ">
                  <HistoryCard key={i.toString()} data={item} i={i + 1} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-[20vh]">
              <div className="flex items-center justify-center">
                <MdSignalWifi0Bar className="mt-12 text-[20vh] opacity-40" />
              </div>
              <div className="mx-[15vw] text-center">
                <span className="font-semibold">There are no Kots</span>{' '}
                <span className="font-semibold opacity-40 "> , try changing the filter back to “No filter” </span>
              </div>
            </div>
          )}
        </>
      )}

      <div onClick={updateDishStatus} onKeyDown={updateDishStatus} className="fixed bottom-0 z-20 w-full rotate-180 bg-[#f5f5f5] py-2">
        <div className="mx-auto flex rotate-180 flex-col justify-items-center">
          <button
            type="button"
            className={`min-w-389 mx-auto my-auto min-h-[3rem] min-w-[95%] rounded-full !py-2 text-[1rem] font-semibold md:min-w-[75%] lg:min-w-[55%] xl:min-w-[55%]
         ${updateData.length === 0 || selectedDishes.length === 0 ? 'cursor-not-allowed bg-gray-300' : 'bg-[#FBA736]'}`}
            disabled={updateData.length === 0 || selectedDishes.length === 0}
          >
            Cooked!
          </button>
        </div>
      </div>
    </div>
  );
}

export default KotComponent;
