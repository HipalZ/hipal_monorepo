import LoadingSpinner from '@/components/atom/loadingSpinner';
import PopUp from '@/components/atom/popUp';
import CollectionModeComponent from '@/components/atom/selectMode';
import useTimings from '@/components/store/useTimings';
import { memo, startTransition, useEffect, useState } from 'react';
import { MdAdd } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

export interface ISalesResponse {
  grossSale: number;
  totalSale: ISaleMode[];
  charges: ICharge[];
  discounts: IDiscount[];
  tips: ITip[];
  dues: IDue[];
}

interface ISaleMode {
  mode: string;
  totalSale: number;
  commissionPercent: number;
  totalCommissionSale: number;
}

interface ICharge {
  mode: string;
  totalSale: number;
  commissionPercent: number;
  totalCommissionSale: number;
}

interface IDiscount {
  mode: string;
  totalSale: number;
  commissionPercent: number;
  totalCommissionSale: number;
}

interface ITip {
  waiterName: string;
  tips: number;
}

interface IDue {
  customerName: string;
  dues: number;
}

interface SalesComponentProps {
  salesData: ISalesResponse | null;
  isLoadingSales: boolean;
  runCost: number;
}

const SalesComponent: React.FC<SalesComponentProps> = memo(({ salesData, isLoadingSales, runCost }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { inTime, outTime, selectedRange } = useTimings();
  const openModal = () => {
    setIsModalOpen(true);
  };
  const today = new Date();
  const formattedDate = today
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .replace(/\//g, '-');

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') !== 'Dashboard') {
      params.set('tab', 'Dashboard');
      startTransition(() => {
        navigate({ search: params.toString() }, { replace: true });
      });
    }
  }, [location, navigate]);

  function getTips(arr: any) {
    if (arr?.length > 0) {
      return arr.reduce((acc, ele) => acc + ele?.tips, 0);
    }
  }

  function getDues(arr: any) {
    if (arr?.length > 0) {
      return arr.reduce((acc, ele) => acc + ele?.dues, 0);
    }
  }

  return (
    <div className="relative pb-12">
      {salesData?.grossSale !== 0 ? (
        <>
          <div className="mx-6 mt-6 rounded-lg bg-[#204D42] p-4 text-white">
            <div className="pb-2 text-xs">
              Gross Sales
              {inTime && outTime && (
                <>
                  ( {inTime.slice(0, 5)} to {outTime.slice(0, 5)} )
                </>
              )}
            </div>
            <div className="text-3xl font-medium">₹ {salesData?.grossSale}</div>
          </div>
          <div className="masonry-layout mt-4">
            <div className="masonry-item">
              <div className="ml-6">Total Sales</div>
              <div className="mx-6 mt-4 rounded-md border border-[#cacaca]">
                {salesData?.totalSale
                  .filter((ele) => ele?.totalSale > 0)
                  .map((ele, index, array) => (
                    <div
                      key={index.toString()}
                      className={`${index < array.length - 1 ? '' : ''} mx-4 flex items-center justify-between py-4 text-sm`}
                    >
                      {ele.totalSale > 0 && (
                        <>
                          <span> {ele?.mode}</span>
                          <span>₹ {ele?.totalSale}</span>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            </div>
            {(selectedRange === 'today' || (formattedDate === outTime && formattedDate === inTime)) && runCost > 0 && (
              <div className="masonry-item mx-6">
                <div>Running Table</div>
                <div className="mt-4 flex items-center justify-between rounded-md border border-[#cacaca] bg-white p-4">
                  <div>Cost</div>
                  <div>₹ {runCost}</div>
                </div>
              </div>
            )}
            <div className="masonry-item">
              <div className="ml-6">Charges</div>
              <div className="mx-6 mt-4 rounded-md border border-[#cacaca]">
                {salesData?.charges
                  .filter((ele) => ele?.totalSale > 0)
                  .map((ele, index, array) => (
                    <div
                      key={index.toString()}
                      className={`${index < array.length - 1 ? '' : ''} mx-4 flex items-center justify-between py-4 text-sm`}
                    >
                      {ele?.totalSale > 0 && (
                        <>
                          <span>{ele?.mode}</span>
                          <span>₹ {ele?.totalSale}</span>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            </div>
            <div className="masonry-item">
              <div className="ml-6">Discounts</div>
              <div className="mx-6 mt-4 rounded-md border border-[#cacaca]">
                {salesData?.discounts
                  .filter((ele) => ele?.totalSale > 0)
                  .map((ele, index, array) => (
                    <div
                      key={index.toString()}
                      className={`${index < array.length - 1 ? '' : ''} mx-4 flex items-center justify-between py-4 text-sm`}
                    >
                      {ele?.totalSale > 0 && (
                        <>
                          <span>{ele?.mode}</span>
                          <span>₹ {ele?.totalSale}</span>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            </div>
            <div className="masonry-item">
              <div className="align-center mx-6 flex justify-between">
                <h1>Total Dues</h1>
                <p>{getDues(salesData?.dues)}</p>
              </div>
              <div className="mx-6 mt-4 rounded-md border border-[#cacaca]">
                {salesData?.dues.map((ele, index) => (
                  <div key={index.toString()} className="mx-4 flex items-center justify-between  py-4 text-sm">
                    <span>{ele?.customerName}</span>
                    <span>₹ {ele?.dues}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="masonry-item">
              <div className="align-center mx-6 flex justify-between">
                <h1>Total Tips</h1>
                <p>{getTips(salesData?.tips)}</p>
              </div>
              <div className="mx-6 mt-4 rounded-md border border-[#cacaca]">
                {salesData?.tips
                  .filter((ele) => ele?.tips > 0)
                  .map((ele, index) => (
                    <div key={index.toString()} className="mx-4 flex items-center justify-between  py-4 text-sm">
                      <span>{ele?.waiterName}</span>
                      <span>₹ {ele?.tips}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="fixed left-1/2 top-1/2 flex -translate-x-1/2 transform flex-col text-center">
          <p>No Sales Found</p>
          {inTime && outTime && (
            <div className="text-base">
              ({inTime} to {outTime} )
            </div>
          )}
        </div>
      )}
      <div className="fixed bottom-6 right-6 lg:right-[30rem]">
        <button
          type="button"
          onClick={openModal}
          className=" on_active_bounce rounded-lg border border-[#000000] bg-[#000000] px-4 py-2 font-normal text-white"
        >
          <div className="flex items-center justify-center text-white">
            <MdAdd className="mr-2" />
            Add a Mode
          </div>
        </button>
      </div>
      {isModalOpen && (
        <PopUp show={isModalOpen} onClose={closeModal}>
          <CollectionModeComponent closeModal={closeModal} />
        </PopUp>
      )}
      {isLoadingSales && <LoadingSpinner />}
    </div>
  );
});

export default SalesComponent;
