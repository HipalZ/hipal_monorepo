import Header from "@/components/molecules/header";
import React, { memo, useState } from "react";
import { BsChevronLeft } from "react-icons/bs";
import Hi from "@/assets/svg/hi.svg";
import { useRouter } from "next/router";
import type { BillsData } from "@/components/types/businessData";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import { Disclosure } from "@headlessui/react";
import { AiFillCaretDown } from "react-icons/ai";
import { MdPerson } from "react-icons/md";
import BillSummary from "@/components/atom/billSummary";
import { BiChevronsLeft, BiChevronsRight, BiDownload } from "react-icons/bi";
import { useCustomerzData } from "@/components/store/useCustomerzData";
import axios from "@/axios";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import ErrorComponent from "@/components/errorComponent";

function CustomerzBills() {
    const router = useRouter();
    const [billsData, setBillsData] = useState<BillsData>([])
    const { customerzName, customerzPhone, setCustomerzName } = useCustomerzData();
    const { setSelectedSubIcon, selectedSubIcon , setSelectedIcon} = useSelectedIcon();
    const [pageNumber, setPageNumber] = useState(1);
    const { businessId } = router.query as {
        businessId: string;
    };
    const handleClick = (newPage: number) => {
        setPageNumber(newPage);
    };
    
    const fetchBillsApi = async () => {
        try {
            const response = await axios.get(`/v1/payments/:id/customerBills?businessId=${businessId}&phone=${customerzPhone}&pageNumber=${pageNumber}`)
            setCustomerzName(response.data.customerName);
            setBillsData(response.data.bills);
            return response.data;
        } catch (err) {
            console.log(err);
        }
    }

    const {isLoading: isBillsPending, error: billsError, data, refetch} = useQuery({
        queryKey: ['bills', businessId, customerzPhone, selectedSubIcon === "customerzBills",pageNumber],
        queryFn: fetchBillsApi,
        enabled: (!!businessId && !!customerzPhone && selectedSubIcon === "customerzBills") || !!pageNumber
    })

    if(isBillsPending) return <LoadingSpinner />
    if(billsError) return <ErrorComponent refetch={refetch} />

    return (
        <div className="bg-white">
            <div className="bg-[#f5f5f5] border-b border-[#CACACA]">
                <Header
                    title="Bills"
                    onBack={() => setSelectedSubIcon("")}
                    leftIcon={<BsChevronLeft />}
                    centerImage={Hi}
                    rightImage={Hi}
                    isIconBusinessShow={true}
                />
                <div className="mx-6 mt-6 bg-[#204D42] text-white rounded-lg py-4">
                    <div className="flex items-center justify-start">
                        <div className="text-xl px-4 py-2 rounded-full mx-4 font-semibold bg-white text-[#204D42]">
                            {customerzName?.charAt(0)}
                        </div>
                        <div className="ml-2 text-xl font-normal">
                            {customerzName}
                        </div>
                    </div>
                </div>
                <section className="mx-6 my-4">
                    <article className="flex justify-between items-center">
                        <h1 className="text-xl text-[#2B354D]">
                            Bills
                        </h1>
                    </article>
                </section>
            </div>
            <section className="relative masonry-layout w-full px-6 mt-2 overflow-auto scroll-smooth space-y-4">
                {billsData && billsData.length > 0 ? (
                    billsData.map((bill) => (
                        <div key={bill._id}>
                            <Disclosure>
                                {({ open }) => (
                                    <>
                                        <div className="border bg-base-100 border-[#cacaca] rounded-xl masonry-item ">
                                            <Disclosure.Button className="w-full p-4 space-y-2">
                                                <div className="flex justify-between">
                                                    <div className="font-medium">₹ {bill?.total}</div>
                                                    <div className="text-sm opacity-60">
                                                        {bill?.paymentDate}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="text-base font-medium opacity-70">
                                                        {bill.customerName === "undefined"
                                                            ? bill?.waiterName
                                                            : bill?.customerName?.slice(0, 16)}
                                                    </div>
                                                    <div className="flex items-center justify-end">
                                                        <div className="opacity-60">{bill?.tableName}</div>
                                                        <AiFillCaretDown
                                                            className={`ml-2 h-3 w-3 ${open ? "transform rotate-180" : ""
                                                                }`}
                                                        />
                                                    </div>
                                                </div>
                                            </Disclosure.Button>
                                            <Disclosure.Panel className="mx-4 text-sm">
                                                <div className="flex justify-between border-y opacity-70 border-[#cacaca] text-base py-4">
                                                    <div className="flex items-center">
                                                        <MdPerson className="" />
                                                        <span className="ml-2">{bill?.waiterName}</span>
                                                    </div>{" "}
                                                    <div>{bill?.mode}</div>
                                                </div>
                                                {/* Here you can add code to display items and their amounts */}
                                                <div className="border-b border-[#cacaca] pb-4">
                                                    <div className="mt-4 font-medium">
                                                        <div className="flex justify-between font-medium">
                                                            <span>items</span>
                                                            <span>Rupees</span>
                                                        </div>
                                                    </div>
                                                    {bill?.items?.map((item, index) => (
                                                        <div
                                                            className="mt-1 font-medium opacity-70"
                                                            key={`${item.name}-${item.amount}${index}`}
                                                        >
                                                            <div className="flex justify-between font-medium">
                                                                <span>{item?.name}</span>
                                                                <span>₹ {item?.amount}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <BillSummary {...bill} />
                                            </Disclosure.Panel>
                                        </div>
                                    </>
                                )}
                            </Disclosure>
                        </div>
                    ))
                ) : (
                    <div className="mt-4 text-xl font-medium text-center text-primary opacity-60">
                        No Bills Found
                    </div>
                )}
            </section>
            <div className="fixed z-20 flex items-center justify-center space-x-4 transform -translate-x-1/2 bottom-[5rem] left-1/2">
                {billsData && billsData.length >= 0 && (
                    <button
                        type="button"
                        onClick={() => handleClick(pageNumber - 1)}
                        disabled={pageNumber === 1}
                        className="text-base w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]"
                    >
                        <BiChevronsLeft />
                    </button>
                )}
                <p className="w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]">
                    {pageNumber}
                </p>
                {billsData && billsData.length > 0 && (
                    <button
                        type="button"
                        onClick={() => handleClick(pageNumber + 1)}
                        className="text-base w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]"
                    >
                        <BiChevronsRight />
                    </button>
                )}
            </div>
        </div>
    );
}

export default memo(CustomerzBills);
