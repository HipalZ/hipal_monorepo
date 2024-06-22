import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import BillSummary from '@/components/atom/billSummary';
import ErrorComponent from '@/components/errorComponent';
import Header from '@/components/molecules/header';
import { useCustomerzData } from '@/components/store/useCustomerzData';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import CustomerzBills from '@/components/templates/customerzBills';
import CustomerzReviews from '@/components/templates/customerzReviews';
import type { ICustomerReviews, Review, customerzBills } from '@/components/types/businessData';
import { routeToCustomerz } from '@/components/utils/routes';
import {  Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import { memo, startTransition } from 'react';
import { AiFillCaretDown } from 'react-icons/ai';
import { FaArrowLeft } from 'react-icons/fa';
import { MdPerson } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';

const CustomerBillsReviews = memo(() => {
  const navigate = useNavigate();
  const { businessId } = useParams<{ businessId: string }>();
  const { customerzName, customerzPhone } = useCustomerzData();
  const { setSelectedSubIcon, selectedSubIcon } = useSelectedIcon();
  const viewAllBills = () => {
    setSelectedSubIcon('customerzBills');
  };
  const viewAllReviewz = () => {
    setSelectedSubIcon('customerzReviews');
  };

  const fetchSingleCustomerDetails = async () => {
    try {
      const response = await axios.get(`/v1/payments/:id/billsByUser?businessId=${businessId}&phone=${customerzPhone}`);
      return response.data.data;
    } catch (err) {
      console.log(err);
    }
  };

  const {
    isLoading,
    error,
    data: billsData,
    refetch,
  } = useQuery<ICustomerReviews>({
    queryKey: ['customerzBillsReviews', businessId, customerzPhone],
    queryFn: fetchSingleCustomerDetails,
    enabled: !!businessId && !!customerzPhone,
  });

  const handleBack = () => {
    startTransition(() => {
      navigate(routeToCustomerz(businessId as string));
    });
    setSelectedSubIcon('');
  };

  if (error) return <ErrorComponent refetch={refetch} />;

  const CustomerzBillsReviews = () => {
    return (
      <div className="relative">
        <div className=" linear_gradient_background" pb-4">
          <div className="sticky top-0 z-10 w-full bg-[#f5f5f5] pb-4">
            <Header title="Customerz" leftIcon={<FaArrowLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={false} onBack={handleBack} />
          </div>
          <div className="flex flex-col items-center justify-center m-auto text-white">
            <div className="flex h-[5rem] w-[5rem] items-center justify-center rounded-full bg-[#000000] text-center text-xl capitalize">
              {customerzName ? customerzName?.charAt(0) : null}
            </div>
            <span className="pt-4 text-2xl text-[#000000]">{customerzName}</span>
            <span className="text-base font-medium text-[#000000]">{customerzPhone}</span>
          </div>
        </div>
        <section className="flex items-center justify-between mx-6 my-4">
          <article className="text-center">
            <h1 className="text-2xl">{billsData?.avgTicketValue}</h1>
            <span className="text-sm">Avg ticket value</span>
          </article>
          <article className="text-center">
            <h1 className="text-2xl">{billsData?.visitPerDay}</h1>
            <span className="text-sm">No of visits</span>
          </article>
          <article className="text-center">
            <h1 className="text-2xl">{billsData?.reviews}</h1>
            <span className="text-sm">Reviewz</span>
          </article>
        </section>
        <hr className="mx-6 bg-[#CACACA]" />
        <section className="mx-6 my-4">
          <article className="flex items-center justify-between">
            <h1 className="text-xl text-[#000000]">Bills</h1>
            {billsData?.latestBills && billsData.latestBills.length > 0 ? (
              <button
                type="button"
                onClick={viewAllBills}
                className="on_active_bounce rounded-xl border border-[#000000] px-4 py-2 text-base font-medium focus:outline-none"
              >
                View All
              </button>
            ) : null}
          </article>
        </section>
        <section className="relative w-full px-6 mt-2 space-y-4 overflow-auto masonry-layout scroll-smooth">
          {billsData?.latestBills && billsData.latestBills.length > 0 ? (
            billsData.latestBills.map((bill: customerzBills) => (
              <div key={bill._id}>
                 <Disclosure  as="div" defaultOpen={true}>
                  {({ open }) => (
    
                      <div className="bg-base-100 masonry-item rounded-xl border border-[#cacaca] ">
                        <DisclosureButton className="w-full p-4 space-y-2">
                          <div className="flex justify-between">
                            <div className="font-medium">₹ {bill?.total}</div>
                            <div className="text-sm opacity-60">{bill?.paymentDate}</div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-base font-medium opacity-70">
                              {bill.customerName === 'undefined' ? bill?.waiterName : bill?.customerName?.slice(0, 16)}
                            </div>
                            <div className="flex items-center justify-end">
                              <div className="opacity-60">{bill?.tableName}</div>
                              <AiFillCaretDown className={`ml-2 h-3 w-3 ${open ? 'rotate-180 transform' : ''}`} />
                            </div>
                          </div>
                        </DisclosureButton>
                        <DisclosurePanel className="mx-4 text-sm">
                          <div className="flex justify-between border-y border-[#cacaca] py-4 text-base opacity-70">
                            <div className="flex items-center">
                              <MdPerson className="" />
                              <span className="ml-2">{bill?.waiterName}</span>
                            </div>{' '}
                            <div>{bill?.mode}</div>
                          </div>
                          {/* Here you can add code to display items and their amounts */}
                          <div className="pb-4 ">
                            <div className="mt-4 font-medium">
                              <div className="flex justify-between font-medium">
                                <span>items</span>
                                <span>Rupees</span>
                              </div>
                            </div>
                            {bill?.items?.map((item, index: number) => (
                              <div className="mt-1 font-medium opacity-70" key={`${item.name}-${item.amount}${index}`}>
                                <div className="flex justify-between font-medium">
                                  <span>{item?.name}</span>
                                  <span>₹ {item?.amount}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <BillSummary {...bill} />
                        </DisclosurePanel>
                      </div>
                   
                  )}
                </Disclosure>
              </div>
            ))
          ) : (
            <div className="mt-4 text-xl font-medium text-center text-primary opacity-60">No Bills Found</div>
          )}
        </section>
        <section className="mx-6">
          <article className="flex items-center justify-between">
            <h1 className="text-xl text-[#000000]">Reviewz</h1>
            {billsData?.latestReviews && billsData?.latestReviews?.length > 0 ? (
              <button
                type="button"
                onClick={viewAllReviewz}
                className="on_active_bounce rounded-xl border border-[#000000] px-4 py-2 text-base font-medium focus:outline-none"
              >
                View All
              </button>
            ) : null}
          </article>
        </section>
        <section className="w-full px-6 my-6 space-y-4 overflow-auto masonry-layout scroll-smooth">
          {billsData?.latestReviews?.map((review: Review) => {
            const date = new Date(review.date);
            const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()} ${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;

            return (
              <article key={review._id} className="bg-base-100 masonry-item rounded-xl border border-[#cacaca] bg-[#fbfbfb] p-4 ">
                <h1>{formattedDate}</h1>
                <div
                  className="Stars"
                  style={
                    {
                      '--rating': review.reviewRating,
                    } as React.CSSProperties
                  }
                />
                <p className="my-4">{review.description}</p>
                {review.improvementAreas.length && <p>Suggest To Improve:-</p>}
                <section className="flex flex-wrap gap-4 my-2 overflow-x-auto">
                  {review.improvementAreas.map((suggestion: string) => {
                    return (
                      <h1
                        key={suggestion}
                        className="bg-base-100 inline-block items-center justify-center overflow-hidden truncate rounded-full border border-[#cacaca] px-5 py-2"
                      >
                        <span>{suggestion}</span>
                      </h1>
                    );
                  })}
                </section>
              </article>
            );
          })}
        </section>
      </div>
    );
  };

  const renderBills = () => {
    switch (selectedSubIcon) {
      case 'customerzBills':
        return (
          <>
            <CustomerzBills />
          </>
        );
      case 'customerzReviews':
        return (
          <>
            <CustomerzReviews />
          </>
        );
      default:
        return (
          <>
            <CustomerzBillsReviews />
          </>
        );
    }
  };
  return <>{renderBills()}</>;
});

export default CustomerBillsReviews;
