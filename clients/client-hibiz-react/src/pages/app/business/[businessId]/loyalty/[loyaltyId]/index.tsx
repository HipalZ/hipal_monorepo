import Header from "@/components/molecules/header";
import { memo, useState } from "react";
import { BsChevronLeft } from "react-icons/bs";
import Hi from "@/assets/svg/hi.svg";
import DateRangePicker from "@/components/molecules/dateRangePicker";
import { useStore } from "@/components/store/useCustomerStore";
import axios from "@/axios";
import { paths } from "@/components/utils/paths";
import LoyaltyHistoryAccordion from "@/components/molecules/loyaltyHistoryAccordion";
import PopUp from "@/components/atom/popUp";
import AddCoinsModal from "@/components/atom/addCoinsModal";
import useTimings from "@/components/store/useTimings";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/components/errorComponent";
import { useParams } from "react-router-dom";

export interface Item {
	claimedAmount: number;
	discountDescription: string;
	discount: number;
	tips: number;
	userPhone: string;
	userName: string;
	rewards: number;
	currentBalance: number;
	status: string;
	date: string;
	time: string;
	businessName: string;
	waiterName: string;
	items: {
		name: string;
		quantity: number;
		amount: number;
		price: number;
		extras: [];
		comments: string;
	}[];
	tableName: string;
	day: string;
	loyaltyId: string;
	id: string;
	cgst: number;
	sgst: number;
	total: number;
	subtotal: number;
}
export interface obj {
	totalRewards: number | null;
	userName: string;
	items: Item[];
}

function LoyaltyId() {
	const selectedCustomer = useStore((state) => state.selectedCustomer);
	const [itemsData, setItemsData] = useState<Item[]>([]);
	const [totalRewards, setTotalRewards] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [pageNumber, setPageNumber] = useState(1);
	const { inTime, outTime } = useTimings();
	const { businessId } = useParams<{ businessId: string }>();

	const pageNumberFunction = (newPage: number) => {
		setPageNumber(newPage);
	};

	const openModal = () => {
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
	};

	const getParticularUsersLoyalty = async () => {
		try {
			if (
				selectedCustomer?.userPhone &&
				selectedCustomer.loyaltyId
			) {
				const res = await axios.get(
					`${paths.getSingleLoyalCustomerHistory(
						selectedCustomer.loyaltyId,
						selectedCustomer.userPhone,
						pageNumber,
						inTime,
						outTime,
					)}`,
				);
				setItemsData(res?.data?.items || []);
				setTotalRewards(res?.data?.totalReward || 0);
				return res?.data;
			}
		} catch (error) {
			console.log(error);
		}
	};

	const {isLoading,error, data,refetch} = useQuery({
		queryKey: ["loyalty", selectedCustomer?.id,pageNumber, outTime, inTime, businessId,],
		queryFn: getParticularUsersLoyalty,
		enabled: !!selectedCustomer?.id && !!businessId && !!pageNumber && !!inTime && !!outTime,
	})

	if(error) return <ErrorComponent refetch={refetch}/>

	return (
		<div className="relative pb-12 bg-white">
			<div className="bg-[#f5f5f5]  sticky z-20 top-0 border-b border-[#CACACA]">
				<Header
					title="Rewards"
					leftIcon={<BsChevronLeft />}
					centerImage={Hi}
					rightImage={Hi}
					isIconBusinessShow={true}
				/>
				<div className="mx-6 mt-6 bg-[#2F80ED] text-white rounded-lg py-4">
					<div className="flex items-center justify-start">
						<div className="text-xl px-4 py-2 rounded-full mx-4 font-semibold bg-white text-[#2F80ED]">
							{selectedCustomer?.userName?.[0]}
						</div>
						<div className="ml-2 text-xl font-normal">
							{selectedCustomer?.userName}
							<div className="text-lg font-normal">{totalRewards} coins</div>
						</div>
					</div>
				</div>
				<div className="py-4 ml-6 text-2xl font-normal">Rewards</div>
			</div>
			<DateRangePicker />
			<LoyaltyHistoryAccordion
				isLoading={isLoading}
				itemsData={itemsData}
				pageNumberFunction={pageNumberFunction}
				pageNumber={pageNumber}
			/>
			<div className="fixed bottom-6 w-full pl-4 max-w-[calc(100%-1.5rem)]">
				<button
					type="button"
					onClick={openModal}
					className="w-full border bg-[#2B354D] text-white font-normal on_active_bounce border-[#2B354D] px-4 py-2 rounded-lg"
				>
					<div className="flex items-center justify-center text-white">
						Add a coins
					</div>
				</button>
			</div>
			{isModalOpen && (
				<PopUp show={isModalOpen} onClose={closeModal}>
					<AddCoinsModal
						getParticularUsersLoyalty={getParticularUsersLoyalty}
						selectedCustomer={selectedCustomer}
						closeModal={closeModal}
					/>
				</PopUp>
			)}
			{isLoading && <LoadingSpinner/>}
		</div>
	);
}

export default memo(LoyaltyId);
