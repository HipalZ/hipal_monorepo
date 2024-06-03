import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import {
	PAGE_TYPES,
	routePathsWithId,
} from "@/components/utils/routes";
import HipeopleLogo from "@/assets/svg/hiBizlogo.svg";
import axios from "@/axios";
import { memo, startTransition, useState } from "react";
import Header from "@/components/molecules/header";
import { BsChevronLeft } from "react-icons/bs";
import useBusinessData from "@/components/store/useBusinessData";
import { paths } from "@/components/utils/paths";
import { useLoyalityData } from "@/components/store/useLoyality";
import type { IBusinessData } from "@/components/types/businessData";
import { toast } from "react-toastify";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const Business = memo(() =>{
	const setBusinessData = useBusinessData((s) => s.setBusinessData);
	const [businesses, setBusinesses] = useState<IBusinessData[]>([]);
	const setThemes = useBusinessData((s) => s.setThemes);
	const {
		setLoyaltyId,
		setRewardLimit,
		setExpiryDate,
		setRewardsValue,
		setMaximumClaim,
		setOrigin,
		setCardPattern,
		setCardColor,
		setFontColor,
		setLogo,
	} = useLoyalityData();
	const { setIsLoyaltyExists, setExistingLoyalty } = useBusinessData();
	const user = useOwnerLogin((s) => s.user);
	const navigate = useNavigate();
	const filteredBusinesses = businesses?.filter(
		(business: IBusinessData) =>
			business?.staff?.includes(user.id) ||
			business.id === user?.customRole?.[0]?.businessId,
	);

	const handleRoute = async (businessId: string) => {
		try {
			const response = await axios.get(
				`${paths.getSingleBusiness(businessId)}`,
			);
			const data = await response.data;
			setBusinessData(data);
			getThemes(businessId);
			getBusinessLoyalty(businessId);
			startTransition(()=>{
				navigate(routePathsWithId[PAGE_TYPES.BUSINESS_DETAILS](businessId));
			})
		} catch (error) {
			console.error(error)
		}
	};
	const getThemes = async (businessId: string) => {
		try {
			const response = await axios.get(`${paths.getTheme(businessId)}`);
			const data = await response.data;
			setThemes(data?.[0]?.themes);
		} catch (error) {
			console.error(error)
		}
	};

	const getBusinessLoyalty = async (businessId: string) => {
		try {
			const res = await axios.get(`${paths.getLoyalty(businessId)}`);
			const data = await res.data;
			setLoyaltyId(data?.loyaltyId);
			const isEmptyData = data && Object.keys(data).length > 0;
			setIsLoyaltyExists(!isEmptyData);
			if (data) {
				setRewardLimit(data?.rewardLimit);
				setExpiryDate(data?.expiryDate);
				setRewardsValue(data?.rewardsValue);
				setMaximumClaim(data?.maximumClaim);
				setOrigin(data?.origin);
				setCardPattern(data?.cardPattern);
				setCardColor(data?.cardColor);
				setFontColor(data?.fontColor);
				setLogo(data?.logo);
			}
			setExistingLoyalty(data);
		} catch (error) {
			console.error(error)
		}
	};

	const getBusiness = async () => {
		try {
			if (user.role === "RESTAURANT_MANAGER") {
				const response = await axios.get(
					`${paths.getSingleBusiness(user?.customRole?.[0]?.businessId)}`,
				);
				setBusinesses([response.data]);
				return;
			}
			const response = await axios.get(`/v1/businesses?id=${user.id}`);
			if(response.data === undefined || response.data.length === 0){
				localStorage.removeItem("ownerLogin")
				toast.error('connection refused please login');
				startTransition(()=>{
					navigate("/")
				})
			}
			setBusinesses(response.data);
			return [response.data];
		} catch (error) {
			console.log(error);
		}
	};
	
	function addBusiness() {
		startTransition(()=>{
			navigate('/app/business/addBusiness');
		})
	}

	const {isLoading:isLoad , error, data:allBizData} = useQuery({
		queryKey:['getBiz', user.id],
		queryFn : getBusiness,
		enabled: !!user.id,
	})

	return (
		<>
		<div className="bg-[#f5f5f5] relative min-h-screen  px-0 md:px-[20vw] lg:px-[10vw]">
			<div className="sticky top-0 w-full z-10 bg-[#f5f5f5] pb-4 px-0">
				<Header
					leftIcon={<BsChevronLeft />}
					centerImage={HipeopleLogo}
					rightImage={HipeopleLogo}
					isIconBusinessShow={user.role !== "RESTAURANT_MANAGER"}
				/>
			</div>
			<div className=" m-auto flex flex-col justify-center text-white items-center pt-[1rem]">
				<div className="h-[4rem] w-[4rem] capitalize text-xl text-center pt-4 rounded-full bg-[#2B354D]">
					{user.name.charAt(0)}
				</div>
				<span className="text-[#2B354D] text-2xl pt-4">{user.name}</span>
				<span className="text-[#2B354D] font-medium text-base">
					{user.role}
				</span>
			</div>
			<div className="flex items-center justify-between px-6 py-4 mx-6 mt-4 text-center border-y-2">
				<div className="flex flex-col text">
					<span className="text-3xl text-[#2B354D]">
						{filteredBusinesses?.length}
					</span>
					<span className="text-xs text-[#2B354D]">Business</span>
				</div>
				<div className="flex flex-col">
					<span className="text-3xl text-[#2B354D]">
						{filteredBusinesses?.filter((business) => business.status).length}
					</span>
					<span className="text-xs text-[#2B354D]">Active</span>
				</div>
				<div className="flex flex-col">
					<span className="text-3xl text-[#EB5757]">
						{filteredBusinesses?.filter((business) => !business.status).length}
					</span>
					<span className="text-xs text-[#EB5757]">Due</span>
				</div>
			</div>
			<div className="text-[#2B354D] text-xl mt-4 mx-6">Business</div>

			<div className="pb-[5rem] grid grid-cols-2 text-[#2B354D] gap-4 mt-4 mx-6 font-normal">
				{filteredBusinesses?.map((ele: any) => (
						<div
							onClick={() => handleRoute(ele.id)}
							key={ele.id}
							className={`${
								ele?.status
									? "pointer-events-auto"
									: "pointer-events-none opacity-75"
							} p-4 bg-white border on_active_bounce rounded-xl`}
						>
							<div className="pb-6">
								{ele?.logo && (
									<img src={ele?.logo} width={50} height={50} alt="" loading="lazy"/>
								)}
							</div>
							<div className="flex items-center pt-4 mb-2 text-xs">
								<span
									className={`w-2 h-2 me-3 rounded-full ${
										ele?.status ? "bg-green-500" : "bg-red-500"
									}`}
								></span>
								<p>{ele?.status ? "Active" : "In Active"}</p>
							</div>
							<div className="text-xl capitalize">{ele?.businessName}</div>
						</div>
				))}
			</div>
			{user.role !== "RESTAURANT_MANAGER" && (
				<div className="fixed right-0 px-6 bottom-5">
					<button
						type="button"
						onClick={addBusiness}
						className="on_active_bounce ml-auto mt-6 on_active_bounce text-[#2B354D] bg-white border border-[#2B354D] px-4 py-2 rounded-lg"
					>
						+ Add Business
					</button>
				</div>
			)}
		</div>
		{isLoad && <LoadingSpinner />}
		</>
	);
})

export default Business
