import {
	beans,
	bowl,
	bud,
	flower,
	love,
	triangleToDataurl,
	waveToDataUrl,
} from "@components/atoms/card/pathPattern";
import DishData from "@components/atoms/dishDescription";
import { initializeAllBusiness } from "@components/store/useAllBusiness";
import useBusinessDetails from "@components/store/useBusinessDetails";
import { useCart } from "@components/store/useCart";
import useIdDetails from "@components/store/useIdDetails";
import { useLogin } from "@components/store/useLogin";
import useLoyaltyData from "@components/store/useLoyaltyData";
import { BUSINESS_ID } from "@components/utils/constants";
import { getTimeIn12HrFormat } from "@components/utils/helpers";
import { paths } from "@components/utils/paths";
import { PAGE_TYPES, routePaths } from "@components/utils/routes";
import axios from "@utils/axios";
import { set } from "lodash-es";
import { useRouter } from "next/router";
import type { NextRequest, NextResponse } from "next/server";
import { memo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import SkeletonLoader from "@components/atoms/loader/skeletonLoader";
import { useQuery, useMutation } from "@tanstack/react-query";

const ExploreBottomButton = dynamic(
	() => import("@components/organisms/explore/exploreBottomButton"),
	{ ssr: false, loading: () => <SkeletonLoader height={30} /> },
);

const PageName = dynamic(() => import("@components/molecules/pageName"), {
	ssr: false,
	loading: () => <SkeletonLoader height={30} />,
});

const SubLoyalty = dynamic(() => import("@components/atoms/subLoyalty"), {
	ssr: false,
	loading: () => <SkeletonLoader height={300} />,
});

const MainLoyalty = dynamic(() => import("@components/atoms/mainLoyalty"), {
	ssr: false,
	loading: () => <SkeletonLoader height={300} />,
});

const Footer = dynamic(() => import("@components/molecules/footer"), {
	ssr: false,
	loading: () => <SkeletonLoader height={300} />,
});

const HeroSection = dynamic(
	() => import("@components/organisms/explore/heroSection"),
	{
		ssr: false,
		loading: () => <SkeletonLoader height={300} />,
	},
);

const MainBackground = dynamic(
	() => import("@components/organisms/explore/mainBackground"),
	{
		ssr: false,
		loading: () => <SkeletonLoader height={480} />,
	},
);

const PopularRestaurant = dynamic(
	() => import("@components/organisms/explore/popularRestaurant"),
	{
		ssr: false,
	},
);

const SpecialOffers = dynamic(
	() => import("@components/organisms/explore/specialOffers"),
	{
		ssr: false,
	},
);

const StoriesComponent = dynamic(
	() => import("@components/organisms/explore/storiesComponent"),
	{
		ssr: false,
	},
);



function Explore() {
	const router = useRouter();
	const {
		tableId: paramTableID,
		zoneId: paramZoneID,
		businessId,
		name: paramTableName,
	} = router.query as {
		tableId: string;
		zoneId: string;
		businessId: string;
		name: string;
	};
	const [data, setData] = useState({
		settings: {},
		businessesData: {},
		dishesData: {},
	});
  
	useEffect(() => {
	  async function fetchData(businessId) {
		try {
		  const settings = (await axios(paths.settings(businessId))) || {};
		  const businessesData = await axios(paths.businessData(businessId));
		  const dishesData = (await axios(paths.dishesData(businessId))) || {};
		  const data = {};
  
		  data["settings"] = JSON.parse(JSON.stringify(settings?.data?.[0])) || {};
		  data["businessesData"] = businessesData?.data || {};
		  data["dishesData"] = dishesData?.data || {};
  
		  set(
			data,
			"settings.explore.openFrom",
			getTimeIn12HrFormat(data?.["settings"]?.explore?.openFrom),
		  );
		  set(
			data,
			"settings.explore.openTill",
			getTimeIn12HrFormat(data?.["settings"]?.explore?.openTill),
		  );
  
		  initializeAllBusiness(data);
  
		  setData(data);
		} catch (err) {
		  console.error('Error fetching data:', err.message, err.response?.data);
		  router.push(`/r/${businessId}/explore`);
		}
	  }
  
	  if (businessId) {
		fetchData(businessId);
	  }
	}, [businessId]);
	const setBusinessDetails = useBusinessDetails((s) => s.setBusinessDetails);
	const { loyaltySetting, setLoyaltySetting } = useLoyaltyData();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const isLogin = useLogin((s) => s.isLogin);
	const userName = useLogin((s) => s.userDetails.name);
	const phoneNumber = useLogin((s) => s.userDetails.phone);
	const setDirection = useLogin((s) => s.setDirection);
	const businessDetails = useBusinessDetails((s) => s.businessDetails);
	const { setTableId, setZoneId, setBusinessId, setTableName, tableName } =
		useIdDetails();
	const setCart = useCart((s) => s.setCart);
	const { hiCode, setHiCode } = useLogin();

	const cart = useCart((s) => s.cart);


	const openModal = () => {
		setTimeout(() => setIsModalOpen(true), 5000);
	};

	const closeModal = () => {
		setIsModalOpen(false);
	};

	useEffect(() => {
		setBusinessDetails({
			businessName: data?.businessesData?.businessName,
			logo: data?.businessesData?.logo,
			gstPercentage: data?.businessesData?.gstPercentage,
			serviceCharge: data?.businessesData?.serviceCharge,
			serviceChargePercentage: data?.businessesData?.serviceChargePercentage,
			isPaymentIntegrated: data?.businessesData?.isPaymentIntegrated,
		});
	}, [data]);

	const getLoyaltyCard = async () => {
		try {
			if (businessId === BUSINESS_ID.OTC) return;
			const response = await axios(paths.getLoyaltySettings(businessId));
			return response.data;
		} catch (err) {
			console.log(err);
		}
	};

	const {
		isLoading,
		error,
		data: loyalty,
	} = useQuery({
		queryKey: ["getLoyalty", businessId],
		queryFn: getLoyaltyCard,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 1000 * 10,
	});

	useEffect(() => {
		if (!loyalty) {
			return;
		}
		if (loyalty) {
			setLoyaltySetting(loyalty);
			findPattern(loyalty?.cardPattern);
			if (loyalty.loyaltyId) {
				openModal();
			}
		}
	}, [loyalty]);

	// customer reviews analytics
	const paymentCustomer = async () => {
		try {
			const config = {
				method: "POST",
				url: "/v1/payments/customer",
				data: {
					phone: phoneNumber,
					businessId: businessId,
					name: userName,
				},
			};
			await axios(config);
		} catch (err) {
			console.log(err);
		}
	};

	// for post api
	const addMutation = useMutation({
		mutationFn: paymentCustomer,
	});
	useEffect(() => {
		if (paramTableID && paramZoneID && businessId && paramTableName) {
			if (hiCode) {
				setHiCode("");
			}
			setTableId(paramTableID);
			setZoneId(paramZoneID);
			setBusinessId(businessId);
			setTableName(paramTableName);
		}
	}, [paramZoneID, businessId, paramTableID, paramTableName]);

	useEffect(() => {
		if (phoneNumber && userName) {
			addMutation.mutate();
		}
	}, [businessId, phoneNumber, userName]);

	useEffect(() => {
		if (cart && Object.keys(cart).length > 0) {
			const cartBusinessId = Object.values(cart)?.[0]?.dishData?.businessId;
			if (cartBusinessId !== businessId) {
				setCart({});
			}
		}
	}, [cart, businessId]);

	const findPattern = (pattern: string) => {
		const value = srcColor.find((item) => pattern in item.src);
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

	const goToLoyalty = (str: string) => {
		if (!isLogin) {
			setDirection(str);
			router.push(routePaths[PAGE_TYPES.SIGN_UP](businessId));
		} else {
			setDirection("");
			router.push(routePaths[PAGE_TYPES.LOYALTY](businessId));
		}
	};


	return (
		<>
			<div className="relative flex flex-col w-full pb-16 ">
				<MainBackground />

				<div className="z-10 flex flex-col w-full -mt-10 space-y-6 text-4xl shadow-xl bg-base-100 rounded-t-3xl">
					<HeroSection />

					<div className="-my-2">
						<StoriesComponent />
					</div>
					<SpecialOffers />
					{loyaltySetting?.loyaltyId && (
						<div
							onKeyDown={() => goToLoyalty("loyalty")}
							onClick={() => goToLoyalty("loyalty")}
						>
							<div className="relative p-4 mx-4 overflow-hidden border rounded-xl border-accent bg-base-200/50">
								<div className="absolute right-[2rem] -bottom-[1.1rem] bg-white w-[64px] h-[64px]" />
								<div className="absolute w-[35%] h-full transform rotate-45 bg-base-300 -bottom-[0.8125rem] -right-12" />
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

					<PopularRestaurant />

					<PageName />

					<Footer />
				</div>

				<ExploreBottomButton />
			</div>
			{isModalOpen && loyaltySetting?.loyaltyId && (
				<DishData show={isModalOpen} onClose={closeModal}>
					<MainLoyalty
						logo={businessDetails?.logo}
						cardColor={loyaltySetting?.cardColor}
						fontColor={loyaltySetting?.fontColor}
						src={
							findPattern(loyaltySetting?.cardPattern) ||
							beans(loyaltySetting?.fontColor)
						}
					/>
				</DishData>
			)}
		</>
	);
}

export default memo(Explore);

// // Only grab the entry for this page
// async function fetchAllBusinessIds() {
// 	const response = await axios.get(paths.listAllBusiness());
// 	return response.data.map((business) => business._id);
// }
// // Only grab the entry for this page
// export async function getStaticPaths() {
// 	try {
// 		// Replace with a function that fetches all business IDs from your database or API
// 		const businessIds = await fetchAllBusinessIds();
// 		const paths = businessIds.map((businessId) => ({
// 			params: { businessId: businessId },
// 		}));

// 		return { paths, fallback: "blocking" };
// 	} catch (error) {
// 		// console.error('Error fetching business IDs:', error)
// 		return { paths: [], fallback: "blocking" };
// 	}
// }

// export async function getStaticProps(context: {
// 	req: NextRequest;
// 	res: NextResponse;
// 	params: { businessId: string };
// }) {
// 	const businessId = context?.params?.businessId || "";
// 	try {
// 		const settings = (await axios(paths.settings(businessId))) || {};
// 		const businessesData = await axios(paths.businessData(businessId));
// 		const dishesData = (await axios(paths.dishesData(businessId))) || {};
// 		const data = {};

// 		data["settings"] = JSON.parse(JSON.stringify(settings?.data?.[0])) || {};
// 		data["businessesData"] = businessesData?.data || {};
// 		data["dishesData"] = dishesData?.data || {};

// 		set(
// 			data,
// 			"settings.explore.openFrom",
// 			getTimeIn12HrFormat(data?.["settings"]?.explore?.openFrom),
// 		);
// 		set(
// 			data,
// 			"settings.explore.openTill",
// 			getTimeIn12HrFormat(data?.["settings"]?.explore?.openTill),
// 		);

// 		initializeAllBusiness(data);

// 		return {
// 			props: {
// 				data,
// 			},
// 			revalidate: 1020,
// 		};
// 	} catch (err: any) {
// 		// console.error('Error fetching data for dish:', err.message, err.response?.data)
// 		return {
// 			redirect: {
// 				destination: `/r/${context?.params?.businessId}/explore`,
// 			},
// 		};
// 	}
// }
