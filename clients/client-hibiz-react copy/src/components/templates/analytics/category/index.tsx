import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import ErrorComponent from '@/components/errorComponent';
import DateRangePicker from '@/components/molecules/dateRangePicker';
import Header from '@/components/molecules/header';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import useTimings from '@/components/store/useTimings';
import type { IAnalyticsItem } from '@/components/types/businessData';
import {  Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import { memo, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
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
      setCategory(res.data.data);
      return res.data.data;
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
     <div className="linear_gradient_background">
        <Header
          title="Analytics"
          onBack={() => setSelectedSubIcon('')}
          leftIcon={<FaArrowLeft />}
          centerImage={Hi}
          rightImage={Hi}
          isIconBusinessShow={true}
        />
        <div className="flex items-center justify-between px-6 pb-4 mt-6">
          <div className="flex text-2xl">
            <span className="ml-2"> Category</span>
          </div>
        </div>
        <DateRangePicker />
      </div>
      <div className="relative w-full px-6 mt-6 space-y-4 overflow-auto masonry-layout scroll-smooth">
        {isLoading ? (
          <LoadingSpinner />
        ) : category && category.length > 0 ? (
          category.map((eachCategory: IAnalyticsItem) => {
            return (
              <div key={eachCategory.categoryName}>
                 <Disclosure  as="div" defaultOpen={true}>
                  {({ open }) => {
                    return (
                      <div className="rounded-lg border border-[#cacaca]">
                        <DisclosureButton className="w-full p-4 cursor-auto">
                          <section className="flex items-center justify-between">
                            <h1 className="text-base font-semibold capitalize">{eachCategory?.parentCategoryName}</h1>
                          </section>
                          <section className="flex items-center justify-between mt-2 text-base">
                            <h1>{eachCategory?.orders} orders</h1>
                            <h1>{eachCategory?.percentage} %</h1>
                          </section>
                        </DisclosureButton>
                        {eachCategory?.childs?.length > 0 &&
                          eachCategory?.childs.map((eachChild, index) => {
                            if (eachChild?.orders === 0) return;
                            return (
                              <DisclosurePanel key={index.toString()} className="mx-4 text-sm">
                                <div className="pb-4 space-y-2 text-sm font-medium">
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
                              </DisclosurePanel>
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
          <div className="fixed flex flex-col text-center transform -translate-x-1/2 left-1/2 top-1/2">
            No Category Analytics Found
            <div className="text-base">({inTime && outTime ? `${inTime} to ${outTime} ` : ''} )</div>
          </div>
        )}
      </div>
    </>
  );
});

export default AnalyticsCategory;
