import HiPalLogo from '@/assets/svg/hipalLogoNew.svg';
import Logout from '@/components/atoms/logout';
import PopUp from '@/components/atoms/popUp';
import LoyaltyCoinsUsage from '@/components/molecules/loyaltyCoinsUsage';
import { useLoyaltyDatas } from '@/components/store/useLoyaltyDatas';
import { useUsersHistory, type ISingleUserHistory } from '@/components/store/useUsersHistory';
import { PAGE_TYPES, singleRoute } from '@/components/utils/routes';
import { Disclosure } from '@headlessui/react';
import moment from 'moment';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { memo, useEffect, useState } from 'react';
import { AiFillCaretDown } from 'react-icons/ai';
import { BsFillCaretLeftFill, BsFillCaretRightFill } from 'react-icons/bs';
import { HiArrowLeft } from 'react-icons/hi';
import { MdPerson } from 'react-icons/md';

const Transactions = () => {
  const router = useRouter();
  const { businessId } = router.query as { businessId: string };
  const { singleUserHistory } = useUsersHistory();
  const handleTableClick = () => {
    router.push(singleRoute[PAGE_TYPES.LOYALTY](businessId));
  };
  const [singleUserHist, setSingleUserHist] = useState<ISingleUserHistory>();
  const [items, setItems] = useState<ISingleUserHistory | any>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const loyaltyId = useLoyaltyDatas((s) => s.loyaltyData?.loyaltyId);
  const totalPages = items ? Math.ceil(items?.length / itemsPerPage) : 0;

  const handleClick = (newPage: number) => {
    setCurrentPage(newPage);
  };
  function handleLoyaltyPopup() {
    setIsModalOpen(true);
  }
  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (singleUserHistory === null) {
      router.push(singleRoute[PAGE_TYPES.LOYALTY](businessId));
    }
    setSingleUserHist(singleUserHistory);
    setItems(singleUserHistory?.items);
  }, []);

  return (
    <div className="bg-secondary/50 min-h-screen px-6 pb-20">
      <div className="flex justify-between pt-[2rem]">
        <HiArrowLeft onClick={handleTableClick} className="text-2xl" />
        <Image width={68} height={25} src={HiPalLogo} alt="Hi Table Logo" />
        <div className="flex items-center">
          <Logout />
        </div>
      </div>
      <div className="mt-6 flex items-start">
        <div className="my-[1rem] mr-6 flex items-center justify-start">
          <div className="text-base-100 flex h-[70px] w-[70px] items-center justify-center rounded-full border bg-blue-800 text-xl capitalize">
            {singleUserHist?.userName?.split('')[0] || 'U'}
          </div>
        </div>
        <div className="my-[1rem]">
          <h1 className="mt-2 text-base font-semibold capitalize text-[#2C2C2C]">{singleUserHist?.userName || singleUserHist?.userPhone}</h1>
          <p className="text-base font-[500] text-[#3E5743]">Coins-{singleUserHist?.totalReward}</p>
        </div>
      </div>
      <h1 className="text-base font-bold text-[#2C2C2C]">Transactions</h1>
      <div className="w-full space-y-4">
        {items && items?.length > 0
          ? items?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
              <Disclosure key={item.id}>
                {({ open }) => (
                  <>
                    <Disclosure>
                      {({ open }) => (
                        <>
                          <div className="bg-base-100 mt-4 rounded-xl border border-[#cacaca]">
                            <Disclosure.Button
                              className={`w-full rounded-t-xl px-4 py-2 ${
                                item?.status === 'plus' ? 'border-[#219653] bg-[#EEF7EA] text-[#3E5743]' : ''
                              }`}
                            >
                              <div
                                className={`flex justify-between  ${
                                  item?.status === 'plus' ? 'font-semibold text-[#3E5743]' : 'font-semibold text-[#F2634C]'
                                }`}
                              >
                                <div className="space-x-2">
                                  <span>₹ {item?.rewards}</span>
                                </div>
                                <div className="text-sm font-normal text-[#2B354D] opacity-60">
                                  {moment(item?.day, 'DD-MM-YYYY').format('DD MMM YYYY')} {item?.time}
                                </div>
                              </div>

                              <div className="flex items-center justify-between space-y-4 ">
                                <div className={`mt-2 text-sm font-medium opacity-70 ${item?.status === 'plus' ? 'text-[#3E5743]' : ''}`}>
                                  <span className="capitalize">{item?.userName}</span>
                                  <span className=""> ( {item?.userPhone} )</span>
                                </div>
                                <div>
                                  <AiFillCaretDown className={`ml-2 h-3 w-3 ${open ? 'rotate-180 transform' : ''}`} />
                                </div>
                              </div>
                            </Disclosure.Button>

                            <Disclosure.Panel className="mx-4 text-sm">
                              <div className="flex justify-between border-y border-[#cacaca] py-4 text-base opacity-70">
                                <div className="flex items-center">
                                  <MdPerson className="" />
                                  <span className="ml-2">{item?.waiterName}</span>
                                </div>
                              </div>
                              <div className="mt-4 space-y-2 pb-4 text-sm font-medium">
                                <div className="flex justify-between font-medium">
                                  <span>Total</span>
                                  <span>₹ {item?.total}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Rewards</span>
                                  <span>₹ {item?.rewards}</span>
                                </div>
                              </div>
                            </Disclosure.Panel>
                          </div>
                        </>
                      )}
                    </Disclosure>
                  </>
                )}
              </Disclosure>
            ))
          : null}
        {totalPages > 0 && (
          <div className="mx-[6rem] mt-2 flex justify-between pb-2">
            <button
              type="button"
              className={`bg-base-100 mr-2 rounded-full p-2 ${currentPage === 1 ? 'disabled:cursor-not-allowed disabled:bg-gray-200' : ''}`}
              onClick={() => handleClick(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <BsFillCaretLeftFill className="text-primary h-6 w-6" />
            </button>

            <div className="text-primary mt-1 text-[1.25rem]">{currentPage}</div>

            <button
              type="button"
              className={`bg-base-100 ml-2 rounded-full p-2 ${currentPage === totalPages ? 'disabled:cursor-not-allowed disabled:bg-gray-200' : ''}`}
              onClick={() => handleClick(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <BsFillCaretRightFill className="text-primary h-6 w-6" />
            </button>
          </div>
        )}
      </div>
      <div onClick={handleLoyaltyPopup} className="mb-5 flex justify-center">
        <button
          type="button"
          className="on_active_bounce bg-primary text-base-100 fixed bottom-6 z-50 w-[90vw] rounded-full py-[1rem] text-sm font-[400] leading-[1.15rem]"
        >
          Redeem coinz
        </button>
      </div>
      {isModalOpen && (
        <PopUp show={isModalOpen} onClose={closeModal}>
          <LoyaltyCoinsUsage closeModal={closeModal} singleUserHist={singleUserHist} loyaltyId={loyaltyId} userPhone={singleUserHist?.userPhone} />
        </PopUp>
      )}
    </div>
  );
};

export default memo(Transactions);
