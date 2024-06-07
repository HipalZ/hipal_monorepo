import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import ErrorComponent from '@/components/errorComponent';
import DateRangePicker from '@/components/molecules/dateRangePicker';
import Header from '@/components/molecules/header';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import useTimings from '@/components/store/useTimings';
import type { IAnalyticsItem } from '@/components/types/businessData';
import { Disclosure } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import { memo, useState } from 'react';
import { BsChevronLeft } from 'react-icons/bs';
import { IoFastFoodOutline } from 'react-icons/io5';
import { useParams } from 'react-router-dom';

const AnalyticsCategory = memo(() => {
  const { inTime, outTime } = useTimings();
  const { setSelectedSubIcon, selectedSubIcon } = useSelectedIcon();
  const { businessId } = useParams<{ businessId: string }>();
  const [category, setCategory] = useState<IAnalyticsItem[] | null>(null);

  const getCategory = async () => {
    let url = `/v1/kitchens/:id/Category?businessId=${businessId}`;

    if (inTime && outTime) {
      url += `&from=${inTime}&to=${outTime}`;
    }

    try {
      const res = await axios.get(url);
      setCategory(res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching sales report:', error);
    }
  };

  const { isLoading, error, data, refetch } = useQuery<IAnalyticsItem[]>({
    queryKey: ['category', businessId, inTime, outTime],
    queryFn: getCategory,
    enabled: !!businessId && !!inTime && !!outTime && selectedSubIcon === 'category',
  });

  if (error) return <ErrorComponent refetch={refetch} />;

  return (
    <>
      <div className="bg-[#f5f5f5]">
        <Header
          title="Analytics"
          onBack={() => setSelectedSubIcon('')}
          leftIcon={<BsChevronLeft />}
          centerImage={Hi}
          rightImage={Hi}
          isIconBusinessShow={true}
        />
        <div className="mt-6 flex items-center justify-between border-b border-[#cacaca] px-6 pb-4">
          <div className="flex text-2xl">
            <span className="ml-2"> Category</span>
          </div>
        </div>
        <DateRangePicker />
      </div>
      <div className="masonry-layout relative mt-6 w-full space-y-4 overflow-auto scroll-smooth px-6">
        {isLoading ? (
          <LoadingSpinner />
        ) : category && category.length > 0 ? (
          category.map((eachCategory: IAnalyticsItem) => {
            return (
              <div key={eachCategory.categoryName}>
                <Disclosure>
                  {({ open }) => {
                    return (
                      <div className="rounded-lg border border-[#cacaca]">
                        <Disclosure.Button className="w-full cursor-auto p-4">
                          <section className="flex items-center justify-between">
                            <h1 className="text-base font-semibold capitalize">{eachCategory?.parentCategoryName}</h1>
                          </section>
                          <section className="mt-2 flex items-center justify-between text-base">
                            <h1>{eachCategory?.orders} orders</h1>
                            <h1>{eachCategory?.percentage} %</h1>
                          </section>
                        </Disclosure.Button>
                        {eachCategory?.childs?.length > 0 &&
                          eachCategory?.childs.map((eachChild, index) => {
                            if (eachChild?.orders === 0) return;
                            return (
                              <Disclosure.Panel key={index.toString()} className="mx-4 text-sm">
                                <div className="space-y-2 pb-4 text-sm font-medium">
                                  <hr className="bg-[#cacaca]" />
                                  <div key={index.toString()} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <IoFastFoodOutline className="text-2xl" />
                                      <span className="ml-2">{eachChild?.childCategoryName}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span>{eachChild?.orders}</span>
                                    </div>
                                  </div>
                                </div>
                              </Disclosure.Panel>
                            );
                          })}
                      </div>
                    );
                  }}
                </Disclosure>
              </div>
            );
          })
        ) : (
          <div className="fixed left-1/2 top-1/2 flex -translate-x-1/2 transform flex-col text-center">
            No Category Analytics Found
            <div className="text-base">({inTime && outTime ? `${inTime} to ${outTime} ` : ''} )</div>
          </div>
        )}
      </div>
    </>
  );
});

export default AnalyticsCategory;
