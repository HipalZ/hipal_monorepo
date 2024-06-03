import {
	_useAllBusiness,
	initializeAllBusiness,
} from "@components/store/useAllBusiness";
import { useLogin } from "@components/store/useLogin";
import { useRoutingFlow } from "@components/store/useRoutingFlow";
import { getTimeIn12HrFormat } from "@components/utils/helpers";
import { getRandomBlurImg } from "@components/utils/images";
import { paths } from "@components/utils/paths";
import { PAGE_TYPES, routePaths } from "@components/utils/routes";
import axios from "@utils/axios";
import { isEmpty, set } from "lodash-es";
import moment from "moment";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import type { NextRequest, NextResponse } from "next/server";
import { memo, useEffect, useState } from "react";
import { BsEmojiFrown, BsEmojiHeartEyes, BsEmojiSmile } from "react-icons/bs";
import { BiDislike, BiLike } from "react-icons/bi";
import PlaceholderImg from "@components/atoms/placeholder";
import dynamic from "next/dynamic";
import Loader from "@components/atoms/loader";

const TopBackground = dynamic(
	() => import("@components/molecules/topBackground"),
	{
		ssr: false,
		loading: () => <Loader/>,
	},
);
const PageName = dynamic(() => import("@components/molecules/pageName"), {
	ssr: false,
	loading: () => <Loader/>,
});
const Footer = dynamic(() => import("@components/molecules/footer"), {
	loading: () => <Loader/>,
});
const Header = dynamic(() => import("@components/molecules/header"), {
	ssr: false,
	loading: () => <Loader/>,
});

export default memo(function Review(props: any) {
	const { data } = props;
	const { getPreviousPath } = useRoutingFlow();
	const [feedback, setFeedback] = useState("");
	const [rating, setRating] = useState(null);
	const [foodRating, setFoodRating] = useState(null);
	const [waiterRating, setWaiterRating] = useState(null);
	const [enableButton, setEnableButton] = useState(false);
	const router = useRouter();
	const { businessId } = router.query as { businessId: string };

	const userDetails = useLogin((s) => s.userDetails);
	const currentDate = moment().format("D MMMM YYYY [at] h:mm A");

	useEffect(() => {
		initializeAllBusiness(data);
	}, [data]);

	const handleRating = (newRating) => {
		setRating((prevRating) => {
			if (prevRating === newRating) {
				return null;
			}
			return newRating;
		});
	};
	const handleFoodRating = (newRating) => {
		setFoodRating((prevRating) => {
			if (prevRating === newRating) {
				return null;
			}
			return newRating;
		});
	};
	const handleWaiterRating = (newRating) => {
		setWaiterRating((prevRating) => {
			if (prevRating === newRating) {
				return null;
			}
			return newRating;
		});
	};
	const handleOnClick = (event) => {
		event.preventDefault();
		if (
			feedback === "" &&
			rating === null &&
			foodRating === null &&
			waiterRating === null
		)
			return;
		setFeedback(feedback);
		result();
		router.push(`${routePaths[PAGE_TYPES.EXPLORER](`${businessId}`)}`);
	};
	useEffect(() => {
		if (
			feedback !== "" ||
			rating !== null ||
			foodRating !== null ||
			waiterRating !== null
		) {
			setEnableButton(true);
		} else {
			setEnableButton(false);
		}
	}, [feedback, rating, foodRating, waiterRating, enableButton]);
	const result = async () => {
		try {
			const config = {
				method: "POST",
				url: "/v1/reviews",
				data: {
					businessId: businessId,
					reviewerName: userDetails?.name,
					satisfactionRating: rating,
					foodRating: foodRating,
					waiterRating: waiterRating,
					description: feedback,
					time: currentDate,
				},
			};

			const res = await axios(config);
		} catch (error) {
			console.log(error);
		}
	};

	const handleChange = (event) => {
		setFeedback(event.target.value);
	};

	// const button = ['Food', 'Ambience', 'Service', 'Hygien']
	const getColor = (ratingLevel) => {
		const color = "hsl(var(--p))";
		if (rating === "Great" && ratingLevel === "Great") {
			return color;
		}
		if (rating === "Good" && ratingLevel === "Good") {
			return color;
		}
		if (rating === "Bad" && ratingLevel === "Bad") {
			return color;
		}
		if (ratingLevel === "Food-Good" && foodRating === "Food-Good") {
			return color;
		}
		if (ratingLevel === "Food-Bad" && foodRating === "Food-Bad") {
			return color;
		}
		if (ratingLevel === "Waiter-Good" && waiterRating === "Waiter-Good") {
			return color;
		}
		if (ratingLevel === "Waiter-Bad" && waiterRating === "Waiter-Bad") {
			return color;
		}
		return "gray";
	};

	return (
		<div className="relative ">
			<div className="relative flex flex-col w-full gap-1">
				<TopBackground onBackURL={`${getPreviousPath()}`} />
				<Header
					hideBackBtn
					title={
						<>
							<div className="flex text-base-content">
								<h1 className="my-auto font-[550] text-[1.25rem] leading-[1.75rem]">
									Review
								</h1>
							</div>
						</>
					}
				/>
			</div>
			<div className="flex justify-center mx-auto my-[1rem]">
				<div>
					{!isEmpty(data?.businessesData?.logo) ? (
						<Image
							src={`${data?.businessesData?.logo}`}
							height={100}
							width={100}
							quality={75}
							objectFit="contain"
							alt="logo-business"
							className="object-center w-1/3 border rounded-lg shadow-sm aspect-square"
							placeholder="blur"
							blurDataURL={getRandomBlurImg(100, 100)}
						/>
					) : (
						<PlaceholderImg />
					)}
				</div>
			</div>
			{data?.businessesData?.businessName && (
				<h2 className="font-semibold text-center capitalize">
					{data?.businessesData?.businessName}
				</h2>
			)}
			<div className="mx-[1.5rem] mt-[1.5rem] rounded-[0.25rem]">
				<h1 className="text-sm font-medium text-primary">OverAll experience</h1>
				<div className="flex items-center mt-[1rem]">
					<div
						onClick={() => handleRating("Bad")}
						className="bg-base-200/50 rounded-lg w-[5.875rem] h-[5.875rem] flex flex-col justify-center items-center"
					>
						<BsEmojiFrown
							className="pt-2 text-4xl"
							size={45}
							color={getColor("Bad")}
						/>
						<p
							className={`${
								getColor("Bad") === "hsl(var(--p))"
									? "text-primary font-medium"
									: "text-base-content/50"
							} mt-[0.5rem] text-sm`}
						>
							Bad
						</p>
					</div>
					<div
						onClick={() => handleRating("Good")}
						className="bg-base-200/50 mx-[1rem] rounded-lg w-[5.875rem] h-[5.875rem] flex flex-col justify-center items-center focus:outline-none focus:text-primary"
					>
						<BsEmojiSmile
							className="pt-2 text-4xl"
							size={45}
							color={getColor("Good")}
						/>
						<p
							className={`${
								getColor("Good") === "hsl(var(--p))"
									? "text-primary font-medium"
									: "text-base-content/50"
							} mt-[0.5rem] text-sm`}
						>
							Good
						</p>
					</div>
					<div
						onClick={() => handleRating("Great")}
						className="bg-base-200/50 rounded-lg w-[5.875rem] h-[5.875rem] flex flex-col justify-center items-center focus:outline-none focus:text-primary"
					>
						<BsEmojiHeartEyes
							className="pt-2 text-4xl"
							size={45}
							color={getColor("Great")}
						/>
						<p
							className={`${
								getColor("Great") === "hsl(var(--p))"
									? "text-primary font-medium"
									: "text-base-content/50"
							} mt-[0.5rem] text-sm`}
						>
							Great
						</p>
					</div>
				</div>
			</div>
			{/* food review */}
			{!enableButton && <div className="my-10"></div>}
			{enableButton && (
				<div>
					<div className=" mt-[1rem] ">
						<h1 className="text-sm font-medium text-primary mx-[1.5rem]">
							Food
						</h1>
						<div className="flex">
							<div
								onClick={() => handleFoodRating("Food-Bad")}
								className="bg-base-200/50 px-4 w-[4.5rem] h-[4.5rem] rounded-lg flex flex-col items-center justify-center my-[1rem] ml-[1.5rem]"
							>
								<BiDislike
									size={40}
									color={getColor("Food-Bad")}
									className="pt-2"
								/>
								<p
									className={`${
										foodRating === "Food-Bad"
											? "text-primary font-medium"
											: "text-base-content/50"
									} text-sm my-1`}
								>
									Bad
								</p>
							</div>
							<div
								onClick={() => handleFoodRating("Food-Good")}
								className="bg-base-200/50 px-4 w-[4.5rem] h-[4.5rem]  rounded-lg flex flex-col items-center justify-center my-[1rem] ml-[1rem]"
							>
								<BiLike
									size={40}
									color={getColor("Food-Good")}
									className="pt-2"
								/>
								<p
									className={`${
										foodRating === "Food-Good"
											? "text-primary font-medium"
											: "text-base-content/50"
									} text-sm my-1`}
								>
									Good
								</p>
							</div>
						</div>
					</div>
					{/* waiter review */}
					<div className="">
						<h1 className="text-sm font-medium text-primary mx-[1.5rem] ">
							Waiter
						</h1>
						<div className="flex">
							<div
								onClick={() => handleWaiterRating("Waiter-Bad")}
								className="bg-base-200/50 px-4 w-[4.5rem] h-[4.5rem]  rounded-lg flex flex-col items-center justify-center my-[1rem] ml-[1.5rem]"
							>
								<BiDislike
									size={40}
									color={getColor("Waiter-Bad")}
									className="pt-2"
								/>
								<p
									className={`${
										waiterRating === "Waiter-Bad"
											? "text-primary font-medium"
											: "text-base-content/50"
									} text-sm my-1`}
								>
									Bad
								</p>
							</div>
							<div
								onClick={() => handleWaiterRating("Waiter-Good")}
								className="bg-base-200/50 px-4 w-[4.5rem] h-[4.5rem]  rounded-lg flex flex-col items-center justify-center my-[1rem] ml-[1rem]"
							>
								<BiLike
									size={40}
									color={getColor("Waiter-Good")}
									className="pt-2"
								/>
								<p
									className={`${
										waiterRating === "Waiter-Good"
											? "text-primary font-medium"
											: "text-base-content/50"
									} text-sm my-1`}
								>
									Good
								</p>
							</div>
						</div>
					</div>
					<div className="mx-[1.5rem]">
						<label htmlFor="feedback" className="text-sm text-primary">
							Please leave a comment:
						</label>
						<textarea
							value={feedback}
							maxLength={150}
							onChange={handleChange}
							placeholder="Please share your experience!"
							style={{ minHeight: "100px" }}
							className="w-full mt-3 bg-transparent px-2.5 placeholder:text-xs placeholder:text-base-content/60 py-2.5 mb-[2rem] border border-1 border-primary rounded focus:outline-none"
						/>
					</div>
				</div>
			)}

			<PageName />

			<div className="mb-[6rem]">
				<Footer />
			</div>

			<div className="fixed bottom-0 z-20 w-full py-2 rotate-180 shadow-lg bg-base-100 shadow-base-100">
				<div className="flex flex-col mx-auto rotate-180 justify-items-center">
					<button
					type="button"
						onClick={enableButton ? handleOnClick : undefined}
						className={`${
							enableButton ? "opacity-100" : "opacity-50"
						} min-h-[3rem] !capitalize btn btn-primary btn-md mx-auto font-normal text-[0.8rem] rounded-full shadow-lg min-w-389 min-w-[95%] my-auto !py-2 `}
					>
						Post review
					</button>
				</div>
			</div>
		</div>
	);
});

async function fetchAllBusinessIds() {
	const response = await axios.get(paths.listAllBusiness());
	return response.data.map((business) => business.id);
}
// Only grab the entry for this page
export async function getStaticPaths() {
	try {
		// Replace with a function that fetches all business IDs from your database or API
		const businessIds = await fetchAllBusinessIds();
		const paths = businessIds.map((businessId) => ({
			params: { businessId: businessId },
		}));

		return { paths, fallback: "blocking" };
	} catch (error) {
		// console.error('Error fetching business IDs:', error)
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
		const data = {};

		data["settings"] = JSON.parse(JSON.stringify(settings?.data?.[0])) || {};
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
