import { memo, startTransition, useEffect, useState } from "react";
import { MdAdd } from "react-icons/md";
import DateRangePicker from "@/components/molecules/dateRangePicker";
import axios from "@/axios";
import useTimings from "@/components/store/useTimings";
import { paths } from "@/components/utils/paths";
import LoyaltyHistoryAccordion from "@/components/molecules/loyaltyHistoryAccordion";
import useBusinessData from "@/components/store/useBusinessData";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/components/errorComponent";
import { useNavigate, useParams } from "react-router-dom";

const LoyaltyCoins = () => {
	const navigate = useNavigate();
	const { businessId } = useParams<{ businessId: string }>();
	const { inTime, outTime } = useTimings();
	const data = useBusinessData((s) => s.existingLoyalty);
	const [pageNumber, setPageNumber] = useState(1);
	const setSelectedSubIcon = useSelectedIcon((s) => s.setSelectedSubIcon);
	const pageNumberFunction = (newPage: number) => {
		setPageNumber(newPage);
	};
	const fetchRewardHistory = async () => {
		try {
			const endpoint = paths.getRewardHistory(
				businessId || '',
				data.loyaltyId,
				pageNumber,
				inTime,
				outTime,
			);
			const response = await axios.get(endpoint);
			return response.data
		} catch (error) {
			console.error("Error fetching reward history:", error);
		}
	};

	const {isLoading, error, data:itemsData, refetch} = useQuery({
		queryKey: ['rewardHistory', businessId, data.loyaltyId, pageNumber, inTime, outTime],
		queryFn: fetchRewardHistory,
		enabled : !!businessId && !!data.loyaltyId && !!pageNumber && !!inTime && !!outTime
	})

	const uploadCsvPage = () => {
		setSelectedSubIcon("uploadCSV");
	};

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		if (params.get('tab') !== 'Coins') {
			params.set('tab', 'Coins');
			startTransition(()=>{
				navigate({ search: params.toString() }, { replace: true });
			})
		}
	}, [location, navigate]);

	if (error) return <ErrorComponent refetch={refetch} />
	
	const LoyaltyCoinsData = () => {
		return (
			<div className="pb-12">
				<LoyaltyHistoryAccordion
					isLoading={isLoading}
					itemsData={itemsData || []}
					pageNumber={pageNumber}
					pageNumberFunction={pageNumberFunction}
				/>
				<div
					onKeyDown={uploadCsvPage}
					onClick={uploadCsvPage}
					className="fixed flex items-center justify-center w-full px-6 bottom-6"
				>
					<button type="button" className="w-full bg-[#2B354D] border font-semibold on_active_bounce text-white px-4 py-2 rounded-lg mt-4">
						<div className="flex items-center justify-center">
							<MdAdd className="mr-2" />
							Add credits
						</div>
					</button>
				</div>
			</div>
		);
	};

	return (
		<>
			<DateRangePicker />
			<LoyaltyCoinsData />
		</>
	);
};

export default memo(LoyaltyCoins);
