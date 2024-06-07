import { AiFillCaretDown } from "react-icons/ai";
import { BsChevronLeft } from "react-icons/bs";
import { Disclosure } from "@headlessui/react";
import { MdPerson } from "react-icons/md";
import { memo, startTransition } from "react";
import { routeToCustomerz } from "@/components/utils/routes";
import { useCustomerzData } from "@/components/store/useCustomerzData";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import axios from "@/axios";
import BillSummary from "@/components/atom/billSummary";
import CustomerzBills from "@/components/templates/customerzBills";
import CustomerzReviews from "@/components/templates/customerzReviews";
import ErrorComponent from "@/components/errorComponent";
import Header from "@/components/molecules/header";
import Hi from "@/assets/svg/hi.svg";
import type { ICustomerReviews, Review, customerzBills } from "@/components/types/businessData";

const CustomerBillsReviews = memo(() => {
    const navigate = useNavigate();
    const { businessId } = useParams<{ businessId: string }>();
    const { customerzName, customerzPhone } = useCustomerzData();
    const { setSelectedSubIcon, selectedSubIcon } = useSelectedIcon();
    const viewAllBills = () => {
        setSelectedSubIcon("customerzBills")
    }
    const viewAllReviewz = () => {
        setSelectedSubIcon("customerzReviews")
    }

    const fetchSingleCustomerDetails = async () => {
        try {
            const response = await axios.get(`/v1/payments/:id/billsByUser?businessId=${businessId}&phone=${customerzPhone}`)
            return response.data;
        } catch (err) {
            console.log(err)
        }
    }

    const { isLoading, error, data: billsData, refetch } = useQuery<ICustomerReviews>({
        queryKey: ['customerzBillsReviews', businessId, customerzPhone],
        queryFn: fetchSingleCustomerDetails,
        enabled: !!businessId && !!customerzPhone
    })

    const handleBack = () => {
        startTransition(() => {
            navigate(routeToCustomerz(businessId as string));
        })
        setSelectedSubIcon("")
    }

    if (error) return <ErrorComponent refetch={refetch} />

    const CustomerzBillsReviews = () => {
        return (
            <div className="relative">
                <div className="bg-[#f5f5f5] border-b border-[#cacaca] pb-4">
                    <div className="sticky top-0 w-full z-10 bg-[#f5f5f5] pb-4">
                        <Header
                            title="Customerz"
                            leftIcon={<BsChevronLeft />}
                            centerImage={Hi}
                            rightImage={Hi}
                            isIconBusinessShow={false}
                            onBack={handleBack}
                        />
                    </div>
                    <div className="m-auto flex flex-col justify-center text-white items-center">
                        <div className="h-[5rem] w-[5rem] capitalize text-xl flex justify-center items-center text-center rounded-full bg-[#2B354D]">
                            {customerzName ? customerzName?.charAt(0) : null}
                        </div>
                        <span className="text-[#2B354D] text-2xl pt-4">{customerzName}</span>
                        <span className="text-[#2B354D] font-medium text-base">
                            {customerzPhone}
                        </span>
                    </div>
                </div>
                <section className="mx-6 my-4 flex justify-between items-center">
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
                    <article className="flex justify-between items-center">
                        <h1 className="text-xl text-[#2B354D]">
                            Bills
                        </h1>
                        {billsData?.latestBills && billsData.latestBills.length > 0 ? <button type="button" onClick={viewAllBills} className="border border-[#2B354D] on_active_bounce font-medium px-4 py-2 rounded-xl focus:outline-none text-base">
                            View All
                        </button> : null}
                    </article>
                </section>
                <section className="relative masonry-layout w-full px-6 mt-2 overflow-auto scroll-smooth space-y-4">
                    {billsData?.latestBills && billsData.latestBills.length > 0 ? (
                        billsData.latestBills.map((bill: customerzBills) => (
                            <div key={bill.id}>
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
                                                        {bill?.items?.map((item, index: number) => (
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
                <section className="mx-6">
                    <article className="flex justify-between items-center">
                        <h1 className="text-xl text-[#2B354D]">
                            Reviewz
                        </h1>
                        {billsData?.latestReviews && billsData?.latestReviews?.length > 0 ? <button type="button" onClick={viewAllReviewz} className="border border-[#2B354D] on_active_bounce font-medium px-4 py-2 rounded-xl focus:outline-none text-base">
                            View All
                        </button> : null}
                    </article>
                </section>
                <section className="masonry-layout w-full px-6 my-6 overflow-auto scroll-smooth space-y-4">
                    {billsData?.latestReviews?.map((review: Review) => {
                        const date = new Date(review.date);
                        const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()} ${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;

                        return (
                            <article key={review.id} className="bg-[#fbfbfb] p-4 border bg-base-100 border-[#cacaca] rounded-xl masonry-item ">
                                <h1>{formattedDate}</h1>
                                <div
                                    className="Stars"
                                    style={{
                                        "--rating": review.reviewRating,
                                    } as React.CSSProperties}
                                />
                                <p className="my-4">{review.description}</p>
                                {review.improvementAreas.length && <p>Suggest To Improve:-</p>}
                                <section className="overflow-x-auto flex flex-wrap gap-4 my-2">
                                    {review.improvementAreas.map((suggestion: string) => {
                                        return (
                                            <h1 key={suggestion} className="inline-block truncate overflow-hidden px-5 py-2 justify-center items-center border bg-base-100 border-[#cacaca] rounded-full">
                                                <span >{suggestion}</span>
                                            </h1>
                                        )
                                    })}
                                </section>
                            </article>
                        )
                    })}
                </section>
            </div>
        )
    }

    const renderBills = () => {
        switch (selectedSubIcon) {
            case "customerzBills":
                return (
                    <>
                        <CustomerzBills />
                    </>
                )
            case "customerzReviews":
                return (
                    <>
                        <CustomerzReviews />
                    </>
                )
            default:
                return (
                    <>
                        <CustomerzBillsReviews />
                    </>
                )
        }
    }
    return (
        <>
            {renderBills()}
        </>
    )
});

export default CustomerBillsReviews