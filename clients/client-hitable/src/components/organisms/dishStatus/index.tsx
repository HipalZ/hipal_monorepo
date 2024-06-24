import axios from '@/axios';
import DeleteMultipleDishes from '@/components/atoms/deleteMultipleDishes';
import Loader from '@/components/atoms/loader';
import TransferMultipleDishes from '@/components/atoms/transferMultipleDishes';
import { useLogin } from '@/components/store/useLogin';
import type { IStatus } from '@/components/types/hiTableData';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type React from 'react';
import { memo, useEffect, useRef, useState } from 'react';
import { BiBowlRice, BiPlus } from 'react-icons/bi';
import { HiX } from 'react-icons/hi';
import { MdDelete, MdOutlineLowPriority, MdPriorityHigh } from 'react-icons/md';
import { TbTransferIn } from 'react-icons/tb';
import { toast } from 'react-toastify';

const DishStatusComponent = dynamic(() => import('@/components/atoms/dishStatus'), { ssr: false });

const Priority = dynamic(() => import('@/components/atoms/makePriority'), {
  ssr: false,
});

const DayOutPopup = dynamic(() => import('@/components/atoms/dayoutPopup'), {
  ssr: false,
});

const DishStatus: React.FC<{
  activeButton: string;
}> = ({ activeButton }) => {
  const [statusData, setStatusData] = useState<IStatus[][]>([]);
  const router = useRouter();
  const { businessId, zoneId, tableId } = router.query as {
    businessId: string;
    zoneId: string;
    tableId: string;
  };
  const [selectedDishStatus, setSelectedDishStatus] = useState<IStatus | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [multipleDishDeletePopup, setMultipleDishDeletePopup] = useState(false);

  const [isTransferPopupOpen, setIsTransferPopupOpen] = useState(false);
  const [transferMultipleDishPopup, setTransferMultipleDishPopup] = useState(false);
  const [isPriorityPopupOpen, setIsPriorityPopupOpen] = useState(false);
  const setGrouped_customers = useLogin((s) => s.setGrouped_customers);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const fabRef = useRef<null | HTMLDivElement>(null);
  const retryCount = useRef(0);
  const openModal = (kot: IStatus) => {
    setIsModalOpen(true);
    setSelectedDishStatus(kot);
  };
  const handleConfirm = (data) => {
    if (data === 'Priority') {
      setIsModalOpen(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const grouped_customers = statusData.flat().reduce((acc, customer) => {
    const { customerPhone, customerName } = customer;
    const existingCustomer = acc[customerPhone];

    if (customerName) {
      if (existingCustomer) {
        if (!existingCustomer.customerNames.includes(customerName)) {
          existingCustomer.customerNames = customerName;
        }
      } else {
        acc[customerPhone] = { customerPhone, customerNames: customerName };
      }
    }
    setGrouped_customers(acc);
    return acc;
  }, {});

  const getAllKotSpecificTable = async () => {
    try {
      const response = await axios.get(`/v1/kitchens/kots/allKot?businessId=${businessId}&tableId=${tableId}&zoneId=${zoneId}`);
      const kotData = response.data;
      setStatusData(kotData);
      return kotData;
    } catch (error) {
      toast.error('Error fetching data');
    }
  };

  const makePriority = () => {
    setIsPriorityPopupOpen(true);
  };

  const openMultipleDeleteModal = () => {
    setMultipleDishDeletePopup(true);
  };

  const handleDishStatus = async (kotId: string) => {
    try {
      const config = {
        method: 'put',
        url: '/v1/kitchens/update/kots/dish',
        data: {
          kots: [kotId],
        },
      };
      const res = await axios(config);
      refetch();
      closeModal();
    } catch (error) {
      toast.error('Error updating status try again');
    }
  };

  const toggleFab = () => {
    setIsFabOpen(!isFabOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fabRef.current && !fabRef?.current?.contains(event.target)) {
        setIsFabOpen(false);
      }
    };

    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ['getAllKotSpecificTable', businessId, tableId, zoneId],
    queryFn: getAllKotSpecificTable,
    enabled: !!businessId && !!tableId && !!zoneId,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  const handleRetryClick = () => {
    retryCount.current += 1;
    if (retryCount.current >= 5) {
      router.push(`/r/${businessId}/login`);
    } else {
      getAllKotSpecificTable();
    }
  };
  if (error) {
    <div className="flex h-screen items-center justify-center">
      <Link href={`/r/${businessId}/login`}>
        <button className="btn" type="button">
          Home
        </button>
      </Link>
      <button onClick={handleRetryClick} className="btn" type="button">
        Retry
      </button>
    </div>;
  }

  return (
    <div>
      {activeButton.toLowerCase() === 'status' && (
        <div className="masonry-layout mx-6 mt-4 pb-[5rem]">
          <Orders data={statusData} openModal={openModal} />
          <div ref={fabRef} className="fixed bottom-[1rem] left-6">
            <div
              className={`flex origin-bottom transform flex-col space-y-2 ${
                isFabOpen ? 'scale-y-1 opacity-100' : 'scale-y-0 opacity-0'
              } fab-transition`}
            >
              <button
                type="button"
                onClick={() => setTransferMultipleDishPopup(true)}
                className="text-nowrap border-base-100 text-base-100 bg-primary absolute bottom-12 mr-2 flex items-center whitespace-nowrap rounded-full border px-4 py-2 text-sm"
              >
                <TbTransferIn size={20} /> &nbsp; Transfer Dishes
              </button>
            </div>
            <div
              className={`flex origin-bottom transform flex-col space-y-2 ${
                isFabOpen ? 'scale-y-1 opacity-100' : 'scale-y-0 opacity-0'
              } fab-transition`}
            >
              <button
                type="button"
                onClick={openMultipleDeleteModal}
                className="text-nowrap border-base-100 text-base-100 bg-primary absolute bottom-0 mr-2 flex items-center whitespace-nowrap rounded-full border px-4 py-2 text-sm"
              >
                <MdDelete size={20} /> &nbsp; Delete dishes
              </button>
            </div>
            <button
              type="button"
              onClick={toggleFab}
              className="text-base-100 bg-primary mt-2 flex h-12 w-12 items-center justify-center rounded-full shadow-lg"
            >
              {isFabOpen ? <HiX className="text-2xl" /> : <BiPlus className="text-3xl" />}
            </button>
          </div>
        </div>
      )}
      {isModalOpen && (
        <DayOutPopup show={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="bg-secondary/20 relative rounded-t-3xl pb-[5rem]">
            <div className="text-base-content ml-6 flex items-center rounded-t-2xl pt-4 font-[500] capitalize">{selectedDishStatus?.tableName}</div>
            <div className="border-b-dashed mt-4 border" />

            <div className="mx-4 mb-6 mt-4 flex justify-between">
              <div className="mx-2 w-[60%] font-[500]">
                <div className="text-xl font-semibold capitalize">{selectedDishStatus?.dish?.name}</div>
                <DishStatusComponent selectedDishStatus={selectedDishStatus} />
              </div>
              <div className="flex flex-col space-y-4">
                <div className="text-md text-primary text-right font-[500]">{selectedDishStatus?.kotTime?.slice(0, 5)}</div>
                <div className="text-base-content/40 mt-1 text-sm font-normal capitalize">{selectedDishStatus?.kotDate?.slice(0, 10)}</div>
              </div>
            </div>
            {!selectedDishStatus?.isDeleted && selectedDishStatus?.dishStatus === 'cooking' && !selectedDishStatus?.priority && (
              <div
                onClick={makePriority}
                className="border-base-300 bg-base-100 mx-6 mt-4 flex items-center justify-between rounded-2xl border px-4 py-4 text-sm"
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
                onClick={() => handleDishStatus(selectedDishStatus?._id || selectedDishStatus?.id)}
                className="text-base-100 bg-primary w-[85%] space-x-2 rounded-full py-4"
              >
                Mark as delivered
              </button>
            </div>
          </div>
        </DayOutPopup>
      )}

      {multipleDishDeletePopup && (
        <DayOutPopup show={multipleDishDeletePopup} onClose={() => setMultipleDishDeletePopup(false)}>
          <DeleteMultipleDishes onClose={() => setMultipleDishDeletePopup(false)} statusData={statusData} refetch={refetch} />
        </DayOutPopup>
      )}

      {isPriorityPopupOpen && (
        <DayOutPopup show={isPriorityPopupOpen} onClose={() => setIsPriorityPopupOpen(false)}>
          <Priority
            onConfirm={handleConfirm}
            closeModal={() => setIsPriorityPopupOpen(false)}
            selectedDishStatus={selectedDishStatus}
            kotId={selectedDishStatus?._id || selectedDishStatus?.id}
            getAllStatusData={refetch}
          />
        </DayOutPopup>
      )}
      {transferMultipleDishPopup && (
        <DayOutPopup show={transferMultipleDishPopup} onClose={() => setTransferMultipleDishPopup(false)}>
          <TransferMultipleDishes onClose={() => setTransferMultipleDishPopup(false)} statusData={statusData} refetch={refetch} />
        </DayOutPopup>
      )}
    </div>
  );
};

export default memo(DishStatus);

export function OrderHeader({ kot }: { kot: IStatus }) {
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
      <div className="flex flex-col space-y-2">
        <div className="text-primary text-right text-sm font-[500]">{kot?.kotTime?.slice(0, 5)}</div>
        <div className="text-base-content/40 mt-1 text-sm font-normal capitalize">{kot?.kotDate?.slice(0, 10)}</div>
      </div>
    </div>
  );
}

export function DishDetail({ kot, openModal, ele }) {
  return (
    <div className="mx-4 mt-4 flex justify-between">
      <div className="w-[10%] font-[500]">{kot?.dish?.qty} x</div>
      <div className="-ml-4 w-[60%] font-[500]">
        {kot?.dish?.name}
        <div className="text-base-content/40 mt-1 text-sm font-semibold capitalize">{kot?.dish?.portions?.name}</div>
        <div className="text-base-content/40 mb-2 mt-1 text-xs font-normal capitalize">{kot?.dish?.extras?.map((extra) => `${extra?.name}, `)}</div>
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

export function StatusButton({ kot }: { kot: IStatus }) {
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
      <button type="button" className={`relative rounded-full px-2 font-normal text-black ${status.className}`}>
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
            <>
              <div className={`mb-[0.1rem] text-lg font-[500] capitalize ${status.className} ml-2 mt-[0.125rem] pl-1 pr-1`}>
                <span className="text-[#F04B4B]">deleted</span>
              </div>
            </>
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

export function Orders({ data, openModal }) {
  return data.map((ele, i) => {
    const kot = ele[0];
    if (!kot) return null;
    return (
      <div key={i} className="bg-base-100 masonry-item mb-6 rounded-2xl pr-2">
        <OrderHeader kot={kot} />
        <div className="mx-4 mt-4 rounded-full border-2 border-gray-400/30" />
        {ele.map((kot, i) => (
          <div key={i}>
            <DishDetail kot={kot} openModal={openModal} ele={ele} />
            <div className="pt-4">
              {' '}
              <StatusButton kot={kot} />
              {}
            </div>

            <div className="mx-4 border-b border-dashed" />
          </div>
        ))}
      </div>
    );
  });
}
