import Header from "@/components/molecules/header";
import { memo, startTransition, useState } from "react";
import { BsChevronLeft } from "react-icons/bs";
import Hi from "@/assets/svg/hi.svg";
import DateRangePicker from "@/components/molecules/dateRangePicker";
import useTimings from "@/components/store/useTimings";
import axios from "@/axios";
import TipsAccordion from "@/components/atom/tipsAccordion";
import { useStaff } from "@/components/store/useStaff";
import type { Bill } from "@/components/types/businessData";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

interface IProps extends Bill {
	totalDiscount: number;
	data: Bill[];
}
const Tips = memo(() =>{
	const { businessId } = useParams<{
		businessId: string;
	}>();
	const navigate = useNavigate();
	const { selectedWaiter } = useStaff();
	const { inTime, outTime } = useTimings();
	const [pageNumber, setPageNumber] = useState(1);
	const pageNumberFunction = (newPage: number) => {
		setPageNumber(newPage);
	};
	const [data, setData] = useState<IProps>({
		totalDiscount: 0,
		data: [],
	});

	const getTipsByWaiterName = async (waiterName: string) => {
		let url = `/v1/payments/:id/tipsByWaiterName?businessId=${businessId}&waiterName=${waiterName}&pageNumber=${pageNumber}`;

		if (inTime && outTime) {
			url += `&from=${inTime}&to=${outTime}`;
		}

		try {
			const res = await axios.get(url);
			setData(res.data || {});
			return res.data
		} catch (error) {
			console.error("Error fetching sales report:", error);
		}
	};

	const handleBack = () =>{
		startTransition(()=>{
			navigate(`/app/business/${businessId}/sales`)
		})
	}

	const {isLoading , error, data:staffTipsData} = useQuery({
		queryKey:["tips", businessId, inTime, outTime, pageNumber, selectedWaiter],
		queryFn: ()=>getTipsByWaiterName(selectedWaiter),
		enabled : !!inTime && !!outTime && !!pageNumber && !!businessId && !!selectedWaiter
	})

	return (
		<div className="bg-white">
			<div className="bg-[#f5f5f5] border-b border-[#CACACA]">
				<Header
					title="Tips"
					leftIcon={<BsChevronLeft />}
					centerImage={Hi}
					rightImage={Hi}
					isIconBusinessShow={true}
					onBack={handleBack}
				/>
				<div className="mx-6 mt-6 bg-[#204D42] text-white rounded-lg py-4">
					<div className="flex items-center justify-start">
						<div className="text-xl px-4 py-2 rounded-full mx-4 font-semibold bg-white text-[#204D42]">
							{selectedWaiter?.[0]}
						</div>
						<div className="ml-2 text-xl font-normal">
							{decodeURIComponent(selectedWaiter).split("+")[0]}
							<div className="text-lg font-normal">₹ {data?.tips}</div>
						</div>
					</div>
				</div>
				<div className="py-4 ml-6 text-2xl font-normal">Tips</div>
			</div>
			<DateRangePicker />
			{isLoading ? (
				<LoadingSpinner />
			) : data ? (
				<TipsAccordion tips={data.data} pageNumberFunction={pageNumberFunction} currentPage={pageNumber}/>
			) : (
				<div className="fixed transform -translate-x-1/2 top-1/2 left-1/2 text-center flex flex-col">
					Not Found
				</div>
			)}
		</div>
	);
})

export default Tips
