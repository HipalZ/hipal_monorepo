import { initializeAllBusiness } from "@components/store/useAllBusiness";
import useBusinessDetails from "@components/store/useBusinessDetails";
import { useRoutingFlow } from "@components/store/useRoutingFlow";
import { getTimeIn12HrFormat } from "@components/utils/helpers";
import { paths } from "@components/utils/paths";
import axios from "@utils/axios";
import { set } from "lodash-es";
import isEmpty from "lodash-es/isEmpty";
import Link from "next/link";
import { useRouter } from "next/router";
import type { NextRequest, NextResponse } from "next/server";
import { memo, useEffect, useMemo, useState } from "react";
import {
	beans,
	bowl,
	bud,
	flower,
	love,
	triangleToDataurl,
	waveToDataUrl,
} from "@components/atoms/card/pathPattern";
import dynamic from "next/dynamic";
import useLoyaltyData from "@components/store/useLoyaltyData";
import DishData from "@components/atoms/dishDescription";
import MainLoyalty from "@components/atoms/mainLoyalty";
import { useLogin } from "@components/store/useLogin";
import { PAGE_TYPES, routePaths } from "@components/utils/routes";
import SkeletonLoader from "@components/atoms/loader/skeletonLoader";
// import PageName from '@components/molecules/pageName'

const MainBackground = dynamic(
	() => import("@components/organisms/explore/mainBackground"),
	{
		ssr: false,
		loading: () => <SkeletonLoader height={451} />,
	},
);

const BottomButton = dynamic(
	() => import("@components/molecules/bottomButton"),
	{
		ssr: false,
		loading: () => <SkeletonLoader />,
	},
);

const HeroSection = dynamic(
	() => import("@components/organisms/explore/heroSection"),
	{
		ssr: false,
		loading: () => <SkeletonLoader height={250} />,
	},
);
const StoriesComponent = dynamic(
	() => import("@components/organisms/explore/storiesComponent"),
	{
		ssr: false,
		loading: () => <SkeletonLoader height={300} />,
	},
);
const SpecialOffers = dynamic(
	() => import("@components/organisms/explore/specialOffers"),
	{
		ssr: false,
		loading: () => <SkeletonLoader height={400} />,
	},
);
const PopularRestaurant = dynamic(
	() => import("@components/organisms/explore/popularRestaurant"),
	{
		ssr: false,
		loading: () => <SkeletonLoader height={300} />,
	},
);
const SubLoyalty = dynamic(() => import("@components/atoms/subLoyalty"), {
	ssr: false,
	loading: () => <SkeletonLoader height={300} />,
});
const PageName = dynamic(() => import("@components/molecules/pageName"), {
	ssr: false,
	loading: () => <SkeletonLoader />,
});
const Footer = dynamic(() => import("@components/molecules/footer"), {
	ssr: false,
	loading: () => <SkeletonLoader height={450} />,
});

function Explore({ data }) {
	const setBusinessDetails = useBusinessDetails((s) => s.setBusinessDetails);
	const { loyaltySetting, setLoyaltySetting } = useLoyaltyData();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const router = useRouter();
	const { businessId } = router.query as { businessId: string };
	const isLogin = useLogin((s) => s.isLogin);
	const setDirection = useLogin((s) => s.setDirection);
	const businessDetails = useBusinessDetails((s) => s.businessDetails);

	const openModal = () => {
		setTimeout(() => setIsModalOpen(true), 5000);
	};

	const closeModal = () => {
		setIsModalOpen(false);
	};
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

	useEffect(() => {
		initializeAllBusiness(data);
	}, [data]);

	const goToLoyalty = (str: string) => {
		if (!isLogin) {
			setDirection(str);
			return routePaths[PAGE_TYPES.SIGN_UP](businessId);
		} else {
			setDirection("");
			return routePaths[PAGE_TYPES.LOYALTY](businessId);
		}
	};
	const getLoyaltyCard = async () => {
		try {
			const response = await axios(paths.getLoyaltySettings(businessId));
			if (response?.data?.loyaltyId) {
				openModal();
			}
			setLoyaltySetting(response?.data);
			findPattern(response?.data?.cardPattern);
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		getLoyaltyCard();
	}, []);

	useEffect(() => {
		setBusinessDetails({
			businessName: data?.businessesData?.businessName,
			logo: data?.businessesData?.logo,
		});
	}, [data]);

	const redirectToMenu = () => {
		router.push(routePaths[PAGE_TYPES.CATEGORY](businessId));
	};

	return (
		<>
			<div className="relative flex flex-col w-full pb-16 ">
				{/* <Themes /> */}

				<MainBackground />

				<div className="z-10 flex flex-col w-full -mt-10 space-y-6 text-4xl shadow-xl bg-base-100 rounded-t-3xl">
					<HeroSection />
					<div className="-my-2">
						<StoriesComponent />
					</div>

					<SpecialOffers />

					<PopularRestaurant />

					{loyaltySetting?.loyaltyId && (
						<Link href={`${goToLoyalty("loyalty")}`} passHref>
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
						</Link>
					)}

					<PageName />

					<Footer />
				</div>

				<BottomButton onClick={redirectToMenu}>
					<div className="flex flex-row space-x-2 capitalize">Menu</div>
				</BottomButton>
				{isModalOpen && (
					<DishData show={isModalOpen} onClose={() => closeModal()}>
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
			</div>
		</>
	);
}

export default memo(Explore);

async function fetchAllBusinessIds() {
	const response = await axios.get(paths.listAllBusiness());
	return response.data.map((business) => business.id);
}
export async function getStaticPaths() {
	try {
		const businessIds = await fetchAllBusinessIds();
		const paths = businessIds.map((businessId) => ({
			params: { businessId: businessId },
		}));

		return { paths, fallback: "blocking" };
	} catch (error) {
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
		const businessesData = await axios(paths.businessData(businessId));
		const dishesData = (await axios(paths.dishesData(businessId))) || {};
		const data = {};

		data["settings"] = JSON.parse(JSON.stringify(settings?.data?.[0])) || {};
		data["dishesData"] = dishesData?.data || {};
		data["businessesData"] = businessesData?.data || {};

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
		return {
			props: {
				data,
			},
			revalidate: 1020,
		};
	} catch (err: any) {
		// console.error('Error fetching data for dish:', err.message, err.response?.data)
		return {
			redirect: {
				destination: `/r/${context?.params?.businessId}/explore`,
			},
		};
	}
}
