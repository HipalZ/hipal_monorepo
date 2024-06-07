import Image from "next/image";
import React, { memo, useEffect, useState } from "react";
import { MdPerson } from "react-icons/md";
import HiPalLogo from "@/assets/svg/hipalLogoNew.svg";
import { HiArrowLeft } from "react-icons/hi";
import { useRouter } from "next/router";
import { PAGE_TYPES, singleRoute } from "@/components/utils/routes";
import { Disclosure } from "@headlessui/react";
import { AiFillCaretDown } from "react-icons/ai";
import PopUp from "@/components/atoms/popUp";
import LoyaltyCoinsUsage from "@/components/molecules/loyaltyCoinsUsage";
import {
  type ISingleUserHistory,
  useUsersHistory,
} from "@/components/store/useUsersHistory";
import moment from "moment";
import { BsFillCaretLeftFill, BsFillCaretRightFill } from "react-icons/bs";
import { useLoyaltyDatas } from "@/components/store/useLoyaltyDatas";
import Logout from "@/components/atoms/logout";

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
    <div className="min-h-screen px-6 pb-20 bg-secondary/50">
      <div className="flex justify-between pt-[2rem]">
        <HiArrowLeft onClick={handleTableClick} className="text-2xl" />
        <Image width={68} height={25} src={HiPalLogo} alt="Hi Table Logo" />
        <div className="flex items-center">
          <Logout />
        </div>
      </div>
      <div className="flex items-start mt-6">
        <div className="mr-6 my-[1rem] flex justify-start items-center">
          <div className="capitalize bg-blue-800 text-base-100 text-xl flex justify-center items-center rounded-full border w-[70px] h-[70px]">
            {singleUserHist?.userName?.split("")[0] || "U"}
          </div>
        </div>
        <div className="my-[1rem]">
          <h1 className="capitalize text-[#2C2C2C] text-base font-semibold mt-2">
            {singleUserHist?.userName || singleUserHist?.userPhone}
          </h1>
          <p className="text-[#3E5743] text-base font-[500]">
            Coins-{singleUserHist?.totalReward}
          </p>
        </div>
      </div>
      <h1 className="text-[#2C2C2C] text-base font-bold">Transactions</h1>
      <div className="w-full space-y-4">
        {items && items?.length>0 ?
            items?.slice(
              (currentPage - 1) * itemsPerPage,
              currentPage * itemsPerPage
            )
            .map((item) => (
              <Disclosure key={item.id}>
                {({ open }) => (
                  <>
                    <Disclosure>
                      {({ open }) => (
                        <>
                          <div className="bg-base-100 border border-[#cacaca] rounded-xl mt-4">
                            <Disclosure.Button
                              className={`w-full px-4 py-2 rounded-t-xl ${
                                item?.status === "plus"
                                  ? "bg-[#EEF7EA] border-[#219653] text-[#3E5743]"
                                  : ""
                              }`}
                            >
                              <div
                                className={`flex justify-between  ${
                                  item?.status === "plus"
                                    ? "text-[#3E5743] font-semibold"
                                    : "text-[#F2634C] font-semibold"
                                }`}
                              >
                                <div className="space-x-2">
                                  <span>₹ {item?.rewards}</span>
                                </div>
                                <div className="text-sm text-[#2B354D] opacity-60 font-normal">
                                  {moment(item?.day, "DD-MM-YYYY").format(
                                    "DD MMM YYYY"
                                  )}{" "}
                                  {item?.time}
                                </div>
                              </div>

                              <div className="flex items-center justify-between space-y-4 ">
                                <div
                                  className={`text-sm font-medium opacity-70 mt-2 ${
                                    item?.status === "plus"
                                      ? "text-[#3E5743]"
                                      : ""
                                  }`}
                                >
                                  <span className="capitalize">
                                    {item?.userName}
                                  </span>
                                  <span className="">
                                    {" "}
                                    ( {item?.userPhone} )
                                  </span>
                                </div>
                                <div>
                                  <AiFillCaretDown
                                    className={`ml-2 h-3 w-3 ${
                                      open ? "transform rotate-180" : ""
                                    }`}
                                  />
                                </div>
                              </div>
                            </Disclosure.Button>

                            <Disclosure.Panel className="mx-4 text-sm">
                              <div className="flex justify-between border-y opacity-70 border-[#cacaca] text-base py-4">
                                <div className="flex items-center">
                                  <MdPerson className="" />
                                  <span className="ml-2">
                                    {item?.waiterName}
                                  </span>
                                </div>
                              </div>
                              <div className="pb-4 mt-4 space-y-2 text-sm font-medium">
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
            )):null}
        {totalPages > 0 && (
          <div className="flex justify-between mx-[6rem] pb-2 mt-2">
            <button
              type="button"
              className={`p-2 mr-2 bg-base-100 rounded-full ${
                currentPage === 1
                  ? "disabled:bg-gray-200 disabled:cursor-not-allowed"
                  : ""
              }`}
              onClick={() => handleClick(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <BsFillCaretLeftFill className="w-6 h-6 text-primary" />
            </button>

            <div className="text-primary text-[1.25rem] mt-1">
              {currentPage}
            </div>

            <button
              type="button"
              className={`p-2 ml-2 bg-base-100 rounded-full ${
                currentPage === totalPages
                  ? "disabled:bg-gray-200 disabled:cursor-not-allowed"
                  : ""
              }`}
              onClick={() => handleClick(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <BsFillCaretRightFill className="w-6 h-6 text-primary" />
            </button>
          </div>
        )}
      </div>
      <div onClick={handleLoyaltyPopup} className="flex justify-center mb-5">
        <button type="button" className="w-[90vw] on_active_bounce fixed bottom-6 z-50 bg-primary rounded-full font-[400] py-[1rem] text-base-100 text-sm leading-[1.15rem]">
          Redeem coinz
        </button>
      </div>
      {isModalOpen && (
        <PopUp show={isModalOpen} onClose={closeModal}>
          <LoyaltyCoinsUsage
            closeModal={closeModal}
            singleUserHist={singleUserHist}
            loyaltyId={loyaltyId}
            userPhone={singleUserHist?.userPhone}
          />
        </PopUp>
      )}
    </div>
  );
};

export default memo(Transactions);
