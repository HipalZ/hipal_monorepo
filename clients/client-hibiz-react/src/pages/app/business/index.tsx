import HipeopleLogo from "@/assets/hibizNewLogo.png";
import axios from "@/axios";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import Header from "@/components/molecules/header";
import useBusinessData from "@/components/store/useBusinessData";
import { useLoyalityData } from "@/components/store/useLoyality";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import type { IBusinessData } from "@/components/types/businessData";
import { paths } from "@/components/utils/paths";
import { PAGE_TYPES, routePathsWithId } from "@/components/utils/routes";
import { useQuery } from "@tanstack/react-query";
import { memo, startTransition, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import hipalHandLogo from "@/assets/login/hand.png";
import "./business.css";
import { IoWarning } from "react-icons/io5";
import { TbHomePlus } from "react-icons/tb";

const Business = memo(() => {
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
			business?.staff?.includes(user._id) ||
			business._id === user?.customRole?.[0]?.businessId,
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
			startTransition(() => {
				navigate(routePathsWithId[PAGE_TYPES.BUSINESS_DETAILS](businessId));
			});
		} catch (error) {
			console.error(error);
		}
	};
	const getThemes = async (businessId: string) => {
		try {
			const response = await axios.get(`${paths.getTheme(businessId)}`);
			const data = await response.data;
			setThemes(data?.[0]?.themes);
		} catch (error) {
			console.error(error);
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
			console.error(error);
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
			const response = await axios.get(`/v1/businesses?id=${user._id}`);
			if (response.data === undefined || response.data.length === 0) {
				localStorage.removeItem("ownerLogin");
				toast.error("connection refused please login");
				startTransition(() => {
					navigate("/");
				});
			}
			setBusinesses(response.data);
			return [response.data];
		} catch (error) {
			console.log(error);
		}
	};

	function addBusiness() {
		startTransition(() => {
			navigate("/app/business/add");
		});
	}

	const {
		isLoading: isLoad,
		error,
		data: allBizData,
	} = useQuery({
		queryKey: ["getBiz", user._id],
		queryFn: getBusiness,
		enabled: !!user._id,
	});

	return (
		<>
			<div className="business_gradient">
				<section className="sticky top-0 z-10 w-full px-0 pb-4">
					<Header
						leftIcon={<FaArrowLeft />}
						centerImage={HipeopleLogo}
						rightImage={HipeopleLogo}
						isIconBusinessShow={user.role !== "RESTAURANT_MANAGER"}
					/>
				</section>
				<section className="business_gradient_hero_section">
					<div className="h-[4rem] w-[4rem] rounded-full bg-[#000000] pt-4 text-center text-xl capitalize">
						{user.name.charAt(0)}
					</div>
					<article className="pl-4">
						<div className="flex items-center text-2xl text-[#000000] w-full h-[1.25rem]">
							<img
								width={16}
								height={16}
								src={hipalHandLogo}
								alt="hipalHandLogo"
							/>
							<span className="ml-2 font-bold">Hi</span>
						</div>
						<div className="text-base font-medium text-[#000000] leading-8">
							{user.name}
						</div>
					</article>
				</section>
			</div>
			<div className=" parent_business_cards">
				{filteredBusinesses?.map((ele: IBusinessData) => (
					<section
						onClick={() => handleRoute(ele._id)}
						key={ele._id}
						className={`${
							ele?.status
								? "pointer-events-auto"
								: "pointer-events-none opacity-75"
						} child_business_card`}
					>
						<div className="text-xl capitalize">
							{
								ele?.status && (
									<div className="flex items-center text-sm text-red-500"><IoWarning /> Under verification</div>
								)
							}
							{
								ele?.status && (
									<div className="flex items-center text-sm text-[#1877F2]"><TbHomePlus /> Branch @Old Tree Cafe...</div>
								)
							}
							<div>{ele?.businessName}</div>
						</div>
						<div className="pb-6 aspect-square w-[4rem] h-[4rem] rounded-full overflow-hidden">
							{ele?.logo && (
								<img
									src={ele?.logo}
									width={66}
									height={66}
									alt="Business_logo"
									loading="lazy"
									className="aspect-square w-[4rem] h-[4rem]"
								/>
							)}
						</div>
					</section>
				))}
			</div>
			{user.role !== "RESTAURANT_MANAGER" && (
				<button
					type="button"
					onClick={addBusiness}
					className=" bottom_btn on_active_bounce"
				>
					+ Add Business
				</button>
			)}
			{isLoad && <LoadingSpinner />}
		</>
	);
});

export default Business;
