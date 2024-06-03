import {
	beans,
	bowl,
	bud,
	flower,
	love,
	triangleToDataurl,
	waveToDataUrl,
} from "@components/atoms/card/pathPattern";
import { initializeAllBusiness } from "@components/store/useAllBusiness";
import useBusinessDetails from "@components/store/useBusinessDetails";
import useIdDetails from "@components/store/useIdDetails";
import { useLogin } from "@components/store/useLogin";
import useLoyaltyData from "@components/store/useLoyaltyData";
import { useStatus } from "@components/store/useStatus";
import type { IBusinessData } from "@components/types/businessData";
import { paths } from "@components/utils/paths";
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

export default memo(function Dine({ data }: { data: IBusinessData }) {
	const router = useRouter();
	const { businessId } = router.query as { businessId: string };
	const businessDetails = useBusinessDetails((s) => s.businessDetails);
	const setDirection = useLogin((s) => s.setDirection);
	const { setDishStatus } = useStatus();
	const { isLogin } = useLogin();
	const { loyaltySetting } = useLoyaltyData();
	const { tableId, zoneId } = useIdDetails();

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

// Only grab the entry for this page
async function fetchAllBusinessIds() {
	const response = await axios.get(paths.listAllBusiness());
	return response.data.map((business) => business.id);
}
export async function getStaticPaths() {
	try {
		// Replace with a function that fetches all business IDs from your database or API
		const businessIds = await fetchAllBusinessIds();
		const paths = businessIds.map((businessId) => ({
			params: { businessId: businessId },
		}));
		return { paths, fallback: "blocking" };
	} catch (error) {
		console.error("Error fetching business IDs:", error);
		return { paths: [], fallback: "blocking" };
	}
}

export async function getStaticProps(context: {
	req: NextRequest;
	res: NextResponse;
	params: { businessId: string };
}) {
	try {
		const businessId = context?.params?.businessId || "";
		const settings = (await axios(paths.settings(businessId))) || {};
		// const businessesData = await axios(paths.businessData(businessId))
		const dishesData = (await axios(paths.dishesData(businessId))) || {};
		const categoryData = await axios(paths.categoryByBusiness(businessId));
		const data = {};

		data["settings"] = settings?.data?.[0] || {};
		// data['businessesData'] = businessesData?.data || {}
		data["dishesData"] = dishesData?.data || {};
		// data['categoryData'] = categoryData?.data || {}

		const allCategoriesTypes = () => {
			const mainType = {};
			const subTypes = {};

			categoryData?.data.forEach((category) => {
				// if (isEmpty(category?.dishes)) return null

				if (category?.hierarchy === "PARENT") {
					mainType[category?.id] = category;
				} else {
					if (!!subTypes[category?.parentCategory]) {
						subTypes[category?.parentCategory] = [
							...subTypes[category?.parentCategory],
							category,
						];
					} else {
						subTypes[category?.parentCategory] = [category];
					}
				}
			});

			return {
				main: mainType,
				sub: subTypes,
			};
		};

		data["allCategoriesTypes"] = allCategoriesTypes();

		const categories = () => {
			let result = [] as any;

			categoryData?.data?.forEach((category) => {
				// if (isEmpty(category?.dishes) && isEmpty(data['allCategoriesTypes']?.[category?.name]))
				// 	return null

				const newCategory = JSON.parse(JSON.stringify(category));
				newCategory.dishes = [];

				for (let dish of category.dishes) {
					const newDish = dishesData?.data.find((d) => d.id === dish.id);

					if (!!newDish) newCategory.dishes = [...newCategory.dishes, newDish];
				}

				result = [...result, newCategory];
			});

			return result;
		};
		data["categories"] = categories();

		initializeAllBusiness(data);
		return {
			props: { data },
			revalidate: 1610,
		};
	} catch (err: any) {
		console.error(
			"Error fetching data for dish:",
			err.message,
			err.response?.data,
		);
		return {
			redirect: {
				destination: `/r/${context?.params?.businessId}/explore`,
			},
		};
	}
}
