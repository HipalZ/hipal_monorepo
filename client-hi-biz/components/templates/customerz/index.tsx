import SubheaderButtonList from "@/components/atom/subHeaderBtn";
import DateRangePicker from "@/components/molecules/dateRangePicker";
import Header from "@/components/molecules/header";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import { useRouter } from "next/router";
import Hi from "@/assets/svg/hi.svg";
import { BsChevronLeft } from "react-icons/bs";
import { MdAccountCircle, MdSpaceDashboard } from "react-icons/md";
import { MdOutlineArticle } from "react-icons/md";
import { useSelectedButtonStore } from "@/components/store/useSelectBtn";
import type React from "react";
import { memo, useEffect, useState } from "react";
import { BiChevronsLeft, BiChevronsRight, BiDownload } from "react-icons/bi";
import { HiSearch } from "react-icons/hi";
import { useSearch } from "@/components/store/useSearch";
import axios from "@/axios";
import useTimings from "@/components/store/useTimings";
import type { ICustomer, ICustomerzDashboard } from "@/components/types/businessData";
import { CustomerzList } from "@/components/atom/customerzList";
import ExcelJS from "exceljs";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/components/errorComponent";

const buttons = [
    {
        text: "Dashboard",
        Icon: MdSpaceDashboard,
    },
    {
        text: "Customerz",
        Icon: MdOutlineArticle,
    },

];


const Customerz = () => {
    const { setSelectedIcon } = useSelectedIcon();
    const { timeStampStart, timeStampEnd, } =
        useTimings();
    const router = useRouter();
    const { businessId } = router.query as {
        businessId: string;
    };
    const [pageNumber, setPageNumber] = useState(1);
    const [customerzDashboard, setCustomerzDashboard] = useState<ICustomerzDashboard>({})
    const customerzInfo = [
        {
            title: "Avg Ticket value",
            count: customerzDashboard.avgTicketValue || '',
        },
        {
            title: "visits per day",
            count: customerzDashboard.visitPerDay || '',
        },
        {
            title: "Repeat users",
            count: customerzDashboard.repeatCustomers || '',
        },
        {
            title: "New Sign ups",
            count: customerzDashboard.newCustomers || '',
        },
    ];
    const [allCustomerzDetails, setAllCustomerzDetails] = useState<ICustomer[]>([])
    const [newCustomerzDetails, setNewCustomerzDetails] = useState<ICustomer[]>([])
    const selectedButton = useSelectedButtonStore((s) => s.selectedButton);
    const setSelectedButton = useSelectedButtonStore((s) => s.setSelectedButton);
    const { setSelectedSubIcon, selectedSubIcon } = useSelectedIcon();
    const setSearchText = useSearch((s) => s.setSearchText);
    const { inTime, outTime, selectedRange } = useTimings();

    const handleClick = (page: number) => {
        setPageNumber(page);
    }
    useEffect(() => {
        setSearchText("");
        setSelectedButton("Dashboard")
    }, []);

    const fetchCustomerzDetails = async () => {
        if (timeStampStart === 0 || timeStampEnd === 0 || businessId === undefined) { return; }
        try {
            const response = await axios.get(`/v1/payments/:id/userDashboard?businessId=${businessId}&from=${timeStampStart}&to=${timeStampEnd}&pageNumber=${pageNumber}`);
            setCustomerzDashboard(response.data);
            return response.data;
        } catch (error) {
            console.log(error);
        }
    }

    const fetchAllCustomerz = async () => {
        if (timeStampStart === 0 || timeStampEnd === 0 || businessId === undefined) { return; }
        try {
            const response = await axios.get(`v1/payments/:id/customers?businessId=${businessId}&from=${timeStampStart}&to=${timeStampEnd}&pageNumber=${pageNumber}`)
            setAllCustomerzDetails(response.data);
            return response.data;
        } catch (err) {
            console.log(err);
        }
    }

    const fetchNewCustomerz = async () => {
        if (timeStampStart === 0 || timeStampEnd === 0 || businessId === undefined) { return; }
        try {
            const response = await axios.get(`v1/payments/:id/newCustomer?businessId=${businessId}&pageNumber=${pageNumber}`)
            setNewCustomerzDetails(response.data)
            return response.data;
        } catch (err) {
            console.log(err);
        }
    }

    const { isLoading, error, data: customerData, refetch } = useQuery({
        queryKey: ['customerData', businessId, timeStampStart, timeStampEnd, pageNumber],
        queryFn: fetchCustomerzDetails,
        enabled: !!businessId && selectedButton === "Dashboard" && !! timeStampStart  && !! timeStampEnd && !! pageNumber
    })

    const { isLoading: isLoadingAll, error: errorAll, data: allCustomerData, refetch: refetchAll } = useQuery({
        queryKey: ['allCustomerData', businessId, timeStampStart, timeStampEnd, pageNumber],
        queryFn: fetchAllCustomerz,
        enabled: !!businessId && selectedButton === "Customerz" && !! timeStampStart  && !! timeStampEnd && !! pageNumber
    })

    const { isLoading: isLoadingNew, error: errorNew, data: newCustomerData, refetch: refetchNew } = useQuery({
        queryKey: ['newCustomerData', businessId, timeStampStart, timeStampEnd, pageNumber],
        queryFn: fetchNewCustomerz,
        enabled: !!businessId && selectedSubIcon === "NewSignUps" && !! timeStampStart  && !! timeStampEnd && !! pageNumber
    })

    const viewAll = () => {
        setSelectedButton("Customerz")
    }
    const exportToExcel = async (sheetName: string, data: any) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(sheetName);
        // Define columns
        worksheet.columns = [
            { header: "Last Visited", key: "date", width: 10 },
            { header: "Name", key: "name", width: 30 },
            { header: "Phone", key: "phone", width: 15 },
        ];
        worksheet.getRow(1).font = { bold: true };
        // Add rows
        data?.forEach((d) => {
            const date = new Date(d.date);
            const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()} ${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
            worksheet.addRow({ date: formattedDate, name: d.name, phone: d.phone });
        });
        // Write to a buffer and trigger download
        const buffer = await workbook.xlsx.writeBuffer();
        triggerDownload(buffer, sheetName);
    };
    const triggerDownload = (buffer: any, sheetName: string) => {
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${sheetName}_${inTime}_to_${outTime}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const getUserByNumber = async (phone: string) => {
        if (timeStampStart === 0 || timeStampEnd === 0 || businessId === undefined) { return; }
        try {
            const response = await axios.get(`v1/payments/:id/customers?businessId=${businessId}&findUser=${phone}`)
            console.log([response.data]);
            setAllCustomerzDetails([response.data]);
        } catch (err) {
            console.log(err);
        }
    }
    const handleSearchChange = async (e: any) => {
        const value = e.target.value
        console.log(typeof value);
        if (value.length === 10) {
            getUserByNumber(value);
        }
    };

    // if(isLoading || isLoadingAll || isLoadingNew) return <LoadingSpinner />
    if (error) return <ErrorComponent refetch={refetch}/>
    if (errorAll) return <ErrorComponent refetch={refetchAll} />
    if (errorNew) return <ErrorComponent refetch={refetchNew} />


    const TabsContent = () => {
        return (
            <div className="bg-[#f5f5f5] sticky z-20 top-0">
                <Header
                    title="Customerz"
                    onBack={() => {
                        router.query.tab = "";
                        setSelectedIcon("");
                    }}
                    leftIcon={<BsChevronLeft />}
                    centerImage={Hi}
                    rightImage={Hi}
                    isIconBusinessShow={false}
                />
                <SubheaderButtonList buttons={buttons} />
                <div className="mt-4 pb-4 border-b border-[#cacaca]">
                    <div className="flex justify-between items-center">
                        <div style={{ width: "100%" }} className="flex justify-between  items-center text-2xl">
                            <span className="ml-6 mr-4">{selectedButton}</span>
                            {selectedButton === "Customerz" &&
                                <div className="flex justify-end items-center">
                                    <div onClick={() => exportToExcel("CustomerzDetails", allCustomerzDetails)} className="h-[2rem] bg-white on_active_bounce text-sm space-x-2 px-2 flex justify-center items-center border border-[#cacaca] rounded-lg">
                                        <BiDownload />
                                        <button type="button">
                                            CSV
                                        </button>
                                    </div>
                                    <div className="relative mx-4">
                                        <HiSearch
                                            size={16}
                                            className="absolute inset-y-0 text-primary/80 dark:text-primary flex items-center pointer-events-none top-[0.625rem] left-2"
                                        />
                                        <input
                                            type="tel"
                                            maxLength={10}
                                            placeholder="Search by number"
                                            onChange={handleSearchChange}
                                            className="w-full border border-primary pl-8 py-2 rounded-lg pr-2 text-[#8E92A1] text-sm"
                                        />
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                    {selectedButton === "Dashboard" && <TotalCustomersCard />}
                </div>
            </div>
        )
    }

    const NoTabsContent = () => {
        return (
            <div className="bg-[#f5f5f5] sticky z-20 top-0">
                <Header
                    title="Customerz"
                    onBack={() => {
                        router.query.tab = "";
                        setSelectedSubIcon("");
                    }}
                    leftIcon={<BsChevronLeft />}
                    centerImage={Hi}
                    rightImage={Hi}
                    isIconBusinessShow={true}
                />
                <div className="mt-6 pb-4 border-b border-[#cacaca]">
                    <div className="flex justify-between items-center">
                        <div style={{ width: "100%" }} className="mx-6 flex justify-between  items-center text-2xl">
                            <span>{selectedSubIcon}</span>
                            <div className="flex justify-end items-center">
                                <div onClick={() => exportToExcel("NewCustomers", newCustomerzDetails)} className="h-[2rem] bg-white on_active_bounce text-sm space-x-2 px-2 flex justify-center items-center border border-[#cacaca] rounded-lg">
                                    <BiDownload />
                                    <button type="button">
                                        CSV
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const TotalCustomersCard = () => {
        return (
            <div className="mx-6 mt-4">
                <div className="bg-[#2F80ED] rounded-lg px-4 py-4 text-white">
                    <div className="text-sm">Total Customerz</div>
                    <div className="flex items-center justify-start mt-4 text-3xl">
                        <MdAccountCircle className="" />
                        <span className="ml-2">
                            {customerzDashboard.totalCustomers}
                        </span>
                    </div>
                </div>
            </div>
        )
    };

    const Analytics = () => {
        return (
            <div className="mx-6 mt-4">
                <div className="grid grid-cols-2 gap-4 mt-4">
                    {customerzInfo.map((item, index) => (
                        <div
                            onClick={() => {
                                if (item.title === "New Sign ups" && selectedRange === "today") {
                                    setSelectedSubIcon('NewSignUps')
                                }
                            }}
                            key={index}
                            className="px-4 py-4 border border-[#cacaca] rounded-lg space-y-4"
                        >
                            <div className="text-sm">{item?.title}</div>
                            <div className="font-semibold">
                                {Number(item?.count).toLocaleString("en-IN")}
                                {item?.title === "Usage percentage" ? "%" : ""}
                                {item.title === "New Sign ups" && selectedRange === "today" && <span style={{ float: 'right' }}>View</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
    const LatestCustomerz = () => {
        return (
            <section className="mx-6 my-4">
                <article className="flex justify-between">
                    <h1 className="text-2xl text-[#2B354D]">
                        Latest Customerz
                    </h1>
                    <button type="button" onClick={viewAll} className="bg-[#2B354D] text-white scale-105 on_active_bounce font-medium px-4 py-2 rounded-xl focus:outline-none text-base">
                        View All
                    </button>
                </article>
            </section>
        )
    }
    interface Props {
        items: ICustomer[]
    }
    const Pagination: React.FC<Props> = ({ items }) => {
        return (
            <div className="fixed z-20 flex items-center justify-center space-x-4 transform -translate-x-1/2 bottom-[4rem] left-1/2">
                {items && items.length >= 0 && (
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
                {items && items.length > 0 && (
                    <button
                        type="button"
                        onClick={() => handleClick(pageNumber + 1)}
                        className="text-base w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]"
                    >
                        <BiChevronsRight />
                    </button>
                )}
            </div>
        )
    }

    const renderCustomerContent = () => {
        switch (selectedSubIcon) {
            case "NewSignUps":
                return (
                    <>
                        <NoTabsContent />
                        <CustomerzList customerData={newCustomerzDetails} />
                        <Pagination items={newCustomerzDetails} />
                    </>
                )
            default:
                return (
                    <>
                        {selectedButton === "Dashboard" ? (
                            <>
                                <TabsContent />
                                <DateRangePicker />
                                <Analytics />
                                <br />
                                <LatestCustomerz />
                                <CustomerzList customerData={customerzDashboard?.Customers} />
                            </>
                        ) : selectedButton === "Customerz" ? (
                            <>
                                <TabsContent />
                                <DateRangePicker />
                                <CustomerzList customerData={allCustomerzDetails} />
                                <Pagination items={allCustomerzDetails} />
                            </>
                        ) :
                            <>
                                <TabsContent />
                                <DateRangePicker />
                            </>
                        }
                    </>
                )
        }

    }
    return (
        <>
            {renderCustomerContent()}
        </>
    )
};

export default memo(Customerz);

// takes a date object and returns a formatted date string
export function formatDate(date: Date): string {
    const day: number = date.getDate();
    const month: string = date.toLocaleString('default', { month: 'long' });
    const year: number = date.getFullYear();

    function getOrdinalSuffix(day: number): string {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    }

    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
}