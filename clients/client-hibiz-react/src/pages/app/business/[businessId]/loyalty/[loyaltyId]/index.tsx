import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import AddCoinsModal from '@/components/atom/addCoinsModal';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import PopUp from '@/components/atom/popUp';
import ErrorComponent from '@/components/errorComponent';
import DateRangePicker from '@/components/molecules/dateRangePicker';
import Header from '@/components/molecules/header';
import LoyaltyHistoryAccordion from '@/components/molecules/loyaltyHistoryAccordion';
import { useStore } from '@/components/store/useCustomerStore';
import useTimings from '@/components/store/useTimings';
import { paths } from '@/components/utils/paths';
import { useQuery } from '@tanstack/react-query';
import { memo, useState } from 'react';
import { BsChevronLeft } from 'react-icons/bs';
import { useParams } from 'react-router-dom';

export interface Item {
  claimedAmount: number;
  discountDescription: string;
  discount: number;
  tips: number;
  userPhone: string;
  userName: string;
  rewards: number;
  currentBalance: number;
  status: string;
  date: string;
  time: string;
  businessName: string;
  waiterName: string;
  items: {
    name: string;
    quantity: number;
    amount: number;
    price: number;
    extras: [];
    comments: string;
  }[];
  tableName: string;
  day: string;
  loyaltyId: string;
  id: string;
  cgst: number;
  sgst: number;
  total: number;
  subtotal: number;
}
export interface obj {
  totalRewards: number | null;
  userName: string;
  items: Item[];
}

function LoyaltyId() {
  const selectedCustomer = useStore((state) => state.selectedCustomer);
  const [itemsData, setItemsData] = useState<Item[]>([]);
  const [totalRewards, setTotalRewards] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const { inTime, outTime } = useTimings();
  const { businessId } = useParams<{ businessId: string }>();

  const pageNumberFunction = (newPage: number) => {
    setPageNumber(newPage);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getParticularUsersLoyalty = async () => {
    try {
      if (selectedCustomer?.userPhone && selectedCustomer.loyaltyId) {
        const res = await axios.get(
          `${paths.getSingleLoyalCustomerHistory(selectedCustomer.loyaltyId, selectedCustomer.userPhone, pageNumber, inTime, outTime)}`,
        );
        setItemsData(res?.data?.items || []);
        setTotalRewards(res?.data?.totalReward || 0);
        return res?.data;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ['loyalty', selectedCustomer?.id, pageNumber, outTime, inTime, businessId],
    queryFn: getParticularUsersLoyalty,
    enabled: !!selectedCustomer?.id && !!businessId && !!pageNumber && !!inTime && !!outTime,
  });

  if (error) return <ErrorComponent refetch={refetch} />;

  return (
    <div className="relative bg-white pb-12">
      <div className="sticky  top-0 z-20 border-b border-[#CACACA] bg-[#f5f5f5]">
        <Header title="Rewards" leftIcon={<BsChevronLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={true} />
        <div className="mx-6 mt-6 rounded-lg bg-[#2F80ED] py-4 text-white">
          <div className="flex items-center justify-start">
            <div className="mx-4 rounded-full bg-white px-4 py-2 text-xl font-semibold text-[#2F80ED]">{selectedCustomer?.userName?.[0]}</div>
            <div className="ml-2 text-xl font-normal">
              {selectedCustomer?.userName}
              <div className="text-lg font-normal">{totalRewards} coins</div>
            </div>
          </div>
        </div>
        <div className="ml-6 py-4 text-2xl font-normal">Rewards</div>
      </div>
      <DateRangePicker />
      <LoyaltyHistoryAccordion isLoading={isLoading} itemsData={itemsData} pageNumberFunction={pageNumberFunction} pageNumber={pageNumber} />
      <div className="fixed bottom-6 w-full max-w-[calc(100%-1.5rem)] pl-4">
        <button
          type="button"
          onClick={openModal}
          className="on_active_bounce w-full rounded-lg border border-[#2B354D] bg-[#2B354D] px-4 py-2 font-normal text-white"
        >
          <div className="flex items-center justify-center text-white">Add a coins</div>
        </button>
      </div>
      {isModalOpen && (
        <PopUp show={isModalOpen} onClose={closeModal}>
          <AddCoinsModal getParticularUsersLoyalty={getParticularUsersLoyalty} selectedCustomer={selectedCustomer} closeModal={closeModal} />
        </PopUp>
      )}
      {isLoading && <LoadingSpinner />}
    </div>
  );
}

export default memo(LoyaltyId);
