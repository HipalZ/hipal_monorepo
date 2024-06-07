import axios from '@/axios';
import HeaderButton from '@/components/atoms/buttons/headerButton';
import DayOutPopup from '@/components/atoms/dayoutPopup';
import DishStatusComponent from '@/components/atoms/dishStatus';
import Loader from '@/components/atoms/loader';
import Priority from '@/components/atoms/makePriority';
import { useLogin } from '@/components/store/useLogin';
import type { IStatus } from '@/components/types/hiTableData';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { memo, useState } from 'react';
import { BiBowlRice } from 'react-icons/bi';
import { HiSearch, HiX } from 'react-icons/hi';
import { MdAlarm, MdDelete, MdOutlineLowPriority, MdPriorityHigh } from 'react-icons/md';
import { SiGoogleassistant } from 'react-icons/si';
import { TbToolsKitchen2 } from 'react-icons/tb';
import { toast } from 'react-toastify';

const headerButton = [
  {
    Icon: MdAlarm,
    text: 'Delayed',
  },
  {
    Icon: TbToolsKitchen2,
    text: 'Cooked',
  },
  {
    Icon: SiGoogleassistant,
    text: 'Cooking',
  },
];

function Status() {
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeButton, setActiveButton] = useState<string>('');
  const [statusData, setStatusData] = useState<IStatus[][]>([]);
  const [filteredStatusData, setFilteredStatusData] = useState<IStatus[][]>([]);
  const [selectedDishStatus, setSelectedDishStatus] = useState<IStatus | null>(null);
  const zoneName = useLogin((s) => s.zoneName);
  const userDetails = useLogin((state) => state.userDetails);
  const router = useRouter();
  const { businessId, zoneId } = router.query as {
    businessId: string;
    zoneId: string;
  };
  const [isPriorityPopupOpen, setIsPriorityPopupOpen] = useState(false);

  const makePriority = () => {
    setIsPriorityPopupOpen(true);
  };
  const handleConfirm = (data) => {
    if (data === 'Priority') {
      setIsModalOpen(false);
    }
    getAllStatusData();
  };

  const openModal = (kot: IStatus) => {
    setIsModalOpen(true);
    setSelectedDishStatus(kot);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const popOver = (search = '') => {
    if (search.length > 0) {
      if (!searchOpen) {
        setSearchOpen(true);
      }
    } else {
      setSearchOpen(false);
    }
  };

  const searchClick = () => {
    setSearchOpen(!searchOpen);
    setSearch('');
    getAllStatusData();
  };

  const handleOnClick = (buttonText) => {
    const newActiveButton = activeButton === buttonText ? '' : buttonText;
    setActiveButton(newActiveButton);

    const newFilteredData = newActiveButton
      ? statusData.map((group) => group.filter((item) => item.dishStatus.toLowerCase() === newActiveButton.toLowerCase()))
      : statusData;
    setFilteredStatusData(newFilteredData);
  };

  const handleDishStatus = async (kotId: any) => {
    try {
      const config = {
        method: 'put',
        url: '/v1/kitchens/update/kots/dish',
        data: {
          kots: [kotId],
        },
      };
      const res = await axios(config);
      getAllStatusData();
      closeModal();
    } catch (error) {
      toast.error('Error updating dish status');
    }
  };

  async function getAllStatusData() {
    try {
      const response = await axios.get(`/v1/kitchens/getAllKotByWaiter/all?businessId=${businessId}&zoneId=${zoneId}&staffId=${userDetails?.id}`);
      const data = response.data;
      setStatusData(data);
      setFilteredStatusData(data);
      return data;
    } catch (error) {
      toast.error('Error fetching status data');
    }
  }
  const { isLoading, error, data } = useQuery({
    queryKey: ['getAllStatusData', businessId, zoneId],
    queryFn: getAllStatusData,
    enabled: !!businessId && !!zoneId,
  });

  const searchStatus = filteredStatusData.map((item: IStatus[]) =>
    item.filter(
      (ele) =>
        ele?.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        ele?.dishStatus?.toLowerCase().includes(search.toLowerCase()) ||
        ele?.tableName?.toLowerCase().includes(search.toLowerCase()) ||
        ele?.dish?.name?.toLowerCase().includes(search.toLowerCase()),
    ),
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    <div className="flex h-screen items-center justify-center">
      <button onClick={getAllStatusData} className="btn" type="button">
        Retry
      </button>
    </div>;
  }

  return (
    <div className="pb-6 ">
      <div className="bg-secondary sticky top-0 z-50">
        <div className="flex justify-between">
          <div className={`${searchOpen ? 'hidden' : ''} text-base-content ml-6 mt-8 text-[1rem] font-bold capitalize leading-[1.25rem]`}>
            {zoneName}
          </div>
          <div onClick={searchClick} className={`${searchOpen ? 'mb-6 w-[100%] transition-all duration-300' : 'disabled w-[30%]'} mx-6 mt-6 `}>
            <label htmlFor="simple-search" className="sr-only">
              Search
            </label>
            <div className="relative">
              {searchOpen ? (
                <HiX className="text-primary/80 dark:text-primary pointer-events-none absolute inset-y-0 right-2 top-[0.625rem] flex h-4 w-4 items-center" />
              ) : (
                <HiSearch className="text-primary/80 dark:text-primary pointer-events-none absolute inset-y-0 right-2 top-[0.625rem] flex h-4 w-4 items-center" />
              )}
              <input
                onChange={(e) => {
                  setSearch(e.target.value);
                  popOver(e.target.value);
                }}
                value={search}
                type="text"
                id="simple-search"
                className="focus:border-primary  block w-full rounded-xl border border-gray-300 p-1.5 pl-4 text-sm text-gray-900 focus:outline-none"
                placeholder="Search"
                required
              />
            </div>
          </div>
        </div>
        <div className={`${searchOpen ? 'hidden' : ''} sticky mx-6 mt-6 flex justify-between pb-6`}>
          {headerButton.map((ele, i) => (
            <HeaderButton
              key={ele.text}
              className={activeButton === ele.text ? 'focus:text-primary focus:btn-primary/10 bg-blue-500 focus:rounded-full focus:font-[500] ' : ''}
              onClick={() => handleOnClick(ele.text)}
            >
              <ele.Icon className="text-primary -ml-1 mr-1 mt-1" />
              {ele.text}
            </HeaderButton>
          ))}
        </div>
      </div>

      <div className="masonry-layout mx-6 pb-[5rem]">
        {searchStatus.length > 0 ? <Orders data={searchStatus} openModal={openModal} /> : <Orders data={filteredStatusData} openModal={openModal} />}
      </div>
      {isModalOpen && (
        <DayOutPopup show={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="bg-secondary/50 relative min-h-[45vh] rounded-t-3xl">
            <div className="text-base-content ml-6 flex items-center rounded-t-2xl pt-4 font-[500] capitalize">{selectedDishStatus?.tableName}</div>
            <div className="border-b-dashed mt-4 border" />

            <div className="mx-4 mb-6 mt-4 flex justify-between">
              <div className="mx-2 w-[60%] font-[500]">
                <div className="text-xl font-semibold capitalize">{selectedDishStatus?.dish?.name}</div>
                <DishStatusComponent selectedDishStatus={selectedDishStatus} />
              </div>
              <div className="flex flex-col space-y-4">
                <div className="text-md text-primary text-right font-[500]">{selectedDishStatus?.kotTime.slice(0, 5)}</div>
                <div className="text-base-content/40 mt-1 text-sm font-normal capitalize">{selectedDishStatus?.date}</div>
              </div>
            </div>
            {!selectedDishStatus?.isDeleted && selectedDishStatus?.dishStatus === 'cooking' && !selectedDishStatus?.priority && (
              <div
                onClick={makePriority}
                className="bg-base-100 border-base-300 mx-6 mt-4 flex items-center justify-between rounded-2xl border px-4 py-4 text-sm"
              >
                <div className="flex items-center justify-center">
                  <MdOutlineLowPriority />
                  <span className="ml-2">Cook this item first</span>
                </div>
                <div className="font-medium text-[#F04B4B]">Cook First</div>
              </div>
            )}

            <div
              className={`${
                selectedDishStatus?.dishStatus !== 'cooked' || selectedDishStatus?.isDeleted
                  ? 'hidden'
                  : 'shadow-base-100 fixed bottom-0 z-20 mx-6 w-full py-2 shadow-lg'
              }`}
            >
              <button
                type="button"
                onClick={() => handleDishStatus(selectedDishStatus?._id)}
                className="text-base-100 bg-primary w-[85%] space-x-2 rounded-full py-4"
              >
                Mark as delivered
              </button>
            </div>
          </div>
        </DayOutPopup>
      )}

      {isPriorityPopupOpen && (
        <DayOutPopup show={isPriorityPopupOpen} onClose={() => setIsPriorityPopupOpen(false)}>
          <Priority
            onConfirm={handleConfirm}
            closeModal={() => setIsPriorityPopupOpen(false)}
            selectedDishStatus={selectedDishStatus}
            kotId={selectedDishStatus?._id}
            getAllStatusData={getAllStatusData}
          />
        </DayOutPopup>
      )}
    </div>
  );
}

export default memo(Status);

function OrderHeader({ kot }) {
  return (
    <div className="mx-4 flex justify-between pt-4">
      <div className="flex flex-col">
        <div className="text-xl font-[600] capitalize">
          {kot?.tableName}
          {kot.switchedBy && kot.switchedBy !== '' ? <h6 className="text-primary text-xs">Table Switched by {kot.switchedBy}</h6> : null}
          {kot?.transferBy && kot?.transferBy !== '' ? <h6 className="text-primary text-xs">Item Transferred by {kot.transferBy}</h6> : null}
        </div>
        <div className="text-base-content/40 mt-1 text-sm font-normal capitalize">{kot?.customerName}</div>
      </div>
      <div className="flex flex-col">
        <div className="text-md text-primary text-right font-[500]">{kot?.kotTime?.slice(0, 5)}</div>
        <div className="text-base-content/40 mt-1 text-sm font-normal capitalize">{kot?.kotDate?.slice(0, 10)}</div>
      </div>
    </div>
  );
}

function DishDetail({ kot, openModal, ele }) {
  return (
    <div className="mx-4 mt-4 flex justify-between">
      <div className="w-[10%] font-[500]">{kot?.dish?.qty} x</div>
      <div className="-ml-4 w-[60%] font-[500]">
        {kot?.dish?.name}
        <div className="text-base-content/40 mt-1 text-sm font-semibold capitalize">{kot?.dish?.portions?.name}</div>
        <div className="text-base-content/40 mb-2 mt-1 text-xs font-normal capitalize">{kot?.dish?.extras?.map((extra) => extra?.name + ', ')}</div>
        {kot?.instructions && (
          <span className="bg-primary/10 border-primary text-base-content/60 mt-1 rounded-md border p-2 text-xs font-normal capitalize">
            {kot?.instructions}
          </span>
        )}
      </div>
      <div
        className={`${ele.dishStatus === 'delivered' ? '' : ''} text-md text-primary w-[15%] text-right font-[500]`}
        onClick={() => openModal(kot)}
      >
        Status
      </div>
    </div>
  );
}

function StatusButton({ kot }) {
  const statusDetails = {
    delivered: {
      className: 'bg-[#DBFFE2] text-[#00BA34]',
      iconColor: 'bg-[#00BA34]',
    },
    cooked: {
      className: 'bg-[#E0EBFF] text-[#5591FF]',
      iconColor: 'bg-[#5591FF]',
    },
    deleted: {
      className: 'bg-[#F5E5E5] text-[#F04B4B]',
      iconColor: 'bg-[#F04B4B]',
    },
    default: {
      className: 'bg-[#FFF6DB] text-[#FFC318]',
      iconColor: 'bg-[#FFC318]',
    },
  };

  let status = statusDetails[kot?.dishStatus] || statusDetails.default;

  if (kot?.isDeleted) {
    status = statusDetails.deleted;
  }

  return (
    <div className="mx-4 pb-4">
      <button className={`relative rounded-full px-2 font-normal text-black ${status.className}`}>
        <div className="flex items-center justify-center">
          {kot?.isDeleted ? (
            <div className={`h-[1.5rem] w-[1.5rem] ${status.iconColor} flex items-center justify-center rounded-full`}>
              <MdDelete className="text-base-100" />
            </div>
          ) : (
            <div className={`h-[1.5rem] w-[1.5rem] ${status.iconColor} flex items-center justify-center rounded-full`}>
              <BiBowlRice className="text-base-100" />
            </div>
          )}

          {kot?.isDeleted ? (
            <div className={`mb-[0.1rem] text-lg font-[500] capitalize ${status.className} ml-2 mt-[0.125rem] pl-1 pr-1`}>
              <span className="text-[#F04B4B]">deleted</span>
            </div>
          ) : (
            <>
              <div className={`mb-[0.1rem] text-lg font-[500] capitalize ${status.className} ml-2 mt-[0.125rem] pl-1 pr-1`}>{kot?.dishStatus}</div>
              {kot?.priority && (
                <div className="ml-2 flex items-center">
                  <div className="flex h-[1.5rem] w-[1.5rem] items-center justify-center rounded-full bg-[#FF4500]">
                    <MdPriorityHigh className="text-base-100" />
                  </div>
                  <div className="text-base-100 ml-2 rounded-2xl bg-[#FF4500] px-2 text-sm">Priority</div>
                </div>
              )}
            </>
          )}
        </div>
      </button>
      {kot?.isDeleted && <small className="mt-2 block text-[#FF4500]">Dish Deleted by {kot.staffName}</small>}
    </div>
  );
}

function Orders({ data, openModal }) {
  return data.map((ele, i) => {
    const kot = ele[0];
    if (!kot) return null;
    return (
      <div key={i} className="bg-base-100 masonry-item mb-6 rounded-2xl">
        <OrderHeader kot={kot} />
        <div className="mx-4 mt-4 rounded-full border-2 border-gray-400/30"></div>
        {ele.map((kot, i) => (
          <div key={i}>
            <DishDetail kot={kot} openModal={openModal} ele={ele} />
            <div className="pt-4">
              <StatusButton kot={kot} />
            </div>
            <div className="mx-4 border-b border-dashed"></div>
          </div>
        ))}
      </div>
    );
  });
}
