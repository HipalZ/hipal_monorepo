import {
	beans,
	bowl,
	bud,
	flower,
	love,
	triangleToDataurl,
	waveToDataUrl,
} from "@components/atoms/card/pathPattern";
import { _useAllBusiness, initializeAllBusiness } from "@components/store/useAllBusiness";
import useBusinessDetails from "@components/store/useBusinessDetails";
import useIdDetails from "@components/store/useIdDetails";
import { useLogin } from "@components/store/useLogin";
import useLoyaltyData from "@components/store/useLoyaltyData";
import { useStatus } from "@components/store/useStatus";
import type { IBusinessData } from "@components/types/businessData";
import { PAGE_TYPES, routePaths } from "@components/utils/routes";
import axios from "@utils/axios";
import { useRouter } from "next/router";
import type { NextRequest, NextResponse } from "next/server";
import { memo, useEffect } from "react";
import dynamic from "next/dynamic";
import SkeletonLoader from "@components/atoms/loader/skeletonLoader";
import { useQuery } from "@tanstack/react-query";

const Header = dynamic(() => import("@components/molecules/header"), {
	ssr: false,
	loading: () => <SkeletonLoader height={30} />,
});
const TopBackground = dynamic(
	() => import("@components/molecules/topBackground"),
	{
		ssr: false,
		loading: () => <SkeletonLoader height={480} />,
	},
);

const SubLoyalty = dynamic(() => import("@components/atoms/subLoyalty"), {
	ssr: false,
	loading: () => <SkeletonLoader height={300} />,
});
const FinalCartBtn = dynamic(
	() => import("@components/molecules/bottomButton/finalCartBtn"),
	{
		ssr: false,
		loading: () => <SkeletonLoader height={30} />,
	},
);
const Footer = dynamic(() => import("@components/molecules/footer"), {
	ssr: false,
	loading: () => <SkeletonLoader height={300} />,
});
const PageName = dynamic(() => import("@components/molecules/pageName"), {
	ssr: false,
	loading: () => <SkeletonLoader height={30} />,
});
const QuickLinks = dynamic(() => import("@components/molecules/quickLinks"), {
	ssr: false,
	loading: () => <SkeletonLoader height={30} />,
});
const CartDetails = dynamic(
	() => import("@components/organisms/finalCart/cartDetails"),
	{
		ssr: false,
		loading: () => <SkeletonLoader height={300} />,
	},
);
const CartStatus = dynamic(
	() => import("@components/organisms/finalCart/cartStatus"),
	{
		ssr: false,
		loading: () => <SkeletonLoader height={30} />,
	},
);

export default memo(function Dine() {

	const router = useRouter()
	const { data } = _useAllBusiness() as { data: IBusinessData };
	const { businessId } = router.query as { businessId: string }
	const businessDetails = useBusinessDetails((s) => s.businessDetails)
	const setDirection = useLogin((s) => s.setDirection)
	const { dishStatus, setDishStatus } = useStatus()
	const { isLogin } = useLogin()
	const { loyaltySetting } = useLoyaltyData()
	const { tableId, zoneId } = useIdDetails()

	const findPattern = (pattern: string) => {
		let value = srcColor.find((item) => item.src.hasOwnProperty(pattern));
		return value?.src;
	};

	const srcColor = [
		{
			src: { wave: waveToDataUrl(loyaltySetting?.cardColor, "white").wave },
		},
		{
			src: {
				triangle: triangleToDataurl("white").triangle,
			},
		},
		{
			src: {
				beans: beans(loyaltySetting?.fontColor).beans,
			},
		},
		{
			src: { bud: bud(loyaltySetting?.fontColor).bud },
		},
		{
			src: { bowl: bowl(loyaltySetting?.fontColor).bowl },
		},
		{
			src: { love: love(loyaltySetting?.fontColor).love },
		},
		{
			src: { flower: flower(loyaltySetting?.fontColor).flower },
		},
	];

	const fetchDishStatus = async () => {
		try {
			const { data } = await axios.get(
				`/v1/kitchens/kots/allKot?businessId=${businessId}&tableId=${tableId}&zoneId=${zoneId}&userSide=true`,
			);
			setDishStatus(data);
			return data;
		} catch (err) {
			console.log(err);
		}
	};

	const {
		isLoading,
		error,
		data: dishStatusData,
	} = useQuery({
		queryKey: ["allKot", businessId, tableId, zoneId],
		queryFn: fetchDishStatus,
		enabled: !!tableId && !!zoneId && !!businessId,
	});

	const goToLoyalty = (str: string) => {
		if (!isLogin) {
			setDirection(str);
			router.push(routePaths[PAGE_TYPES.SIGN_UP](businessId));
		} else {
			setDirection("");
			router.push(routePaths[PAGE_TYPES.LOYALTY](businessId));
		}
	};


	useEffect(() => {
		initializeAllBusiness(data);
	}, [data]);


	return (
		<div className="relative flex flex-col w-full ">
			<TopBackground />

			<Header
				hideBackBtn
				title={
					<>
						<QuickLinks />
					</>
				}
				noCustomTag
			/>

			<CartDetails />

			{isLoading ? (
				<SkeletonLoader height={100} />
			) : isLogin && dishStatusData && dishStatusData.length > 0 ? (
				<CartStatus dishStatusData={dishStatusData} />
			) : null}

			{loyaltySetting?.loyaltyId && (
				<div
					onKeyDown={() => goToLoyalty("loyalty")}
					onClick={() => goToLoyalty("loyalty")}
				>
					<div className="relative p-4 mx-4 mb-4 overflow-hidden border rounded-xl border-accent bg-base-200/50">
						<div className="absolute right-9 -bottom-4 bg-white w-[64px] h-[64px]" />
						<div className="absolute w-[35%] h-full transform rotate-45 bg-base-200 -bottom-4 -right-12" />
						<SubLoyalty
							logo={businessDetails?.logo}
							cardColor={loyaltySetting?.cardColor}
							fontColor={loyaltySetting?.fontColor}
							src={
								findPattern(loyaltySetting?.cardPattern) ||
								beans(loyaltySetting?.fontColor)
							}
						/>
					</div>
				</div>
			)}

			<PageName />
			<div className="pb-[5rem]">
				<Footer />
			</div>

			<FinalCartBtn />
		</div>
	);
});

