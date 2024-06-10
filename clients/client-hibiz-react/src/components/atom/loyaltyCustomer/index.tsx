import axios from '@/axios';
import ErrorComponent from '@/components/errorComponent';
import useBusinessData from '@/components/store/useBusinessData';
import { useStore } from '@/components/store/useCustomerStore';
import type { Customer } from '@/components/types/businessData';
import { paths } from '@/components/utils/paths';
import { PAGE_TYPES, routePathsWithIds } from '@/components/utils/routes';
import { useQuery } from '@tanstack/react-query';
import { memo, startTransition, useEffect, useState } from 'react';
import { BiChevronsLeft, BiChevronsRight } from 'react-icons/bi';
import { MdPerson } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../loadingSpinner';

const LoyaltyCustomer = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const loyaltyId = useBusinessData((s) => s.existingLoyalty.loyaltyId);
  const selectCustomer = useStore((state) => state.selectCustomer);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const onClickPagination = (newPage: number) => {
    setCurrentPage(newPage);
  };
  const handleClick = (customer: Customer) => {
    selectCustomer(customer);
    startTransition(() => {
      navigate(routePathsWithIds[PAGE_TYPES.LOYALTY_ID](businessId || '', customer.loyaltyId));
    });
  };
  const getLoyalCustomerData = async (loyaltyId: any, pageNumber: number) => {
    if (loyaltyId) {
      try {
        const response = await axios.get(`${paths.getAllLoyaltyCustomers(loyaltyId, pageNumber)}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching loyal customer data:', error);
      }
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') !== 'Customer') {
      params.set('tab', 'Customer');
      startTransition(() => {
        navigate({ search: params.toString() }, { replace: true });
      });
    }
  }, [location]);

  const {
    isLoading,
    error,
    data: loyalCustomers,
    refetch,
  } = useQuery<Customer[]>({
    queryKey: ['loyaltyCustomers', loyaltyId, currentPage],
    queryFn: () => getLoyalCustomerData(loyaltyId, currentPage),
    enabled: !!loyaltyId && !!currentPage,
  });

  if (error) return <ErrorComponent refetch={refetch} />;

  return (
    <>
      <div className="masonry-layout relative mt-6 w-full overflow-auto scroll-smooth px-6 pb-[10rem]">
        {isLoading ? (
          <LoadingSpinner />
        ) : loyalCustomers && loyalCustomers.length > 0 ? (
          loyalCustomers?.map((customer) => (
            <div
              key={customer._id}
              onKeyDown={() => handleClick(customer)}
              onClick={() => handleClick(customer)}
              className="masonry-item cursor-pointer rounded-lg border border-[#cacaca] bg-white font-medium capitalize text-[#2B354D] hover:bg-[#2B354D]/10"
            >
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center">
                  <MdPerson className="mr-2" />
                  <span>{customer?.userName?.slice(0, 21)}</span>
                </div>
                <span className=""> {customer?.userPhone} </span>
              </div>
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-sm opacity-60">Rewards given so far ₹ {customer?.rewards}</span>
                <span className="font-semibold text-[#2B354D]">view</span>
              </div>
            </div>
          ))
        ) : (
          <>
            <span className="fixed left-1/2 top-1/2 flex -translate-x-1/2 transform flex-col text-center">No data Found</span>
          </>
        )}
      </div>
      <div className="fixed bottom-[5rem] left-1/2 z-20 flex -translate-x-1/2 transform items-center justify-center space-x-4">
        {loyalCustomers && loyalCustomers.length >= 0 && (
          <button
            type="button"
            onClick={() => onClickPagination(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2B354D] bg-white text-base text-black"
          >
            <BiChevronsLeft />
          </button>
        )}
        <p className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2B354D] bg-white text-black">{currentPage}</p>
        {loyalCustomers && loyalCustomers.length > 0 && (
          <button
            type="button"
            onClick={() => onClickPagination(currentPage + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2B354D] bg-white text-base text-black"
          >
            <BiChevronsRight />
          </button>
        )}
      </div>
    </>
  );
};

export default memo(LoyaltyCustomer);
