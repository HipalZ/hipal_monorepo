"use client";
import { getRandomBlurImg } from "@/components/utils/images"
import Image from "next/image"
import { memo, useCallback, useEffect } from "react"
import img from "@/assets/img/cut.png"
import RestaurantTime from "@/components/atoms/time/restaurant";
import type { BusinessDetails } from "@/components/types/businessData";
import { useLogin } from "@/components/store/useLogin";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import useTableData from "@/components/store/useTableData";
import toast from "react-hot-toast";

const MainBackground = (props: { explore: BusinessDetails | undefined }) => {
	const searchParams = useSearchParams();
	const explore = props?.explore;
	const params = useParams();
	const customLink = params?.businessId as string;
	const tableName = searchParams?.get("tableName");
	const { setTableName } = useTableData();

	const router = useRouter()

	const { isLogin } = useLogin()

	useEffect(() => {
		if (!!tableName) {
			setTableName(tableName)
		}

	}, [tableName])

	const goToLoginPage = useCallback(() => {
		if(!customLink) return toast.error('Invalid business id')
		router.push(`${routePaths[PAGE_TYPES.SIGN_UP](customLink)}`)
	}, [customLink, router])

	const getTodayTiming = () => {
		const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		const today = new Date().getDay();
		const todayName = daysOfWeek[today];

		const customTimings = explore?.customTiming && explore.customTiming.length > 0
			? explore.customTiming
			: [
				{ day: 'Monday', openTime: explore?.fixOpenTime, closeTime: explore?.fixCloseTime },
				{ day: 'Tuesday', openTime: explore?.fixOpenTime, closeTime: explore?.fixCloseTime },
				{ day: 'Wednesday', openTime: explore?.fixOpenTime, closeTime: explore?.fixCloseTime },
				{ day: 'Thursday', openTime: explore?.fixOpenTime, closeTime: explore?.fixCloseTime },
				{ day: 'Friday', openTime: explore?.fixOpenTime, closeTime: explore?.fixCloseTime },
				{ day: 'Saturday', openTime: explore?.fixOpenTime, closeTime: explore?.fixCloseTime },
				{ day: 'Sunday', openTime: explore?.fixOpenTime, closeTime: explore?.fixCloseTime },
			];

		const todayTiming = customTimings.find(timing => timing.day === todayName);

		const openFrom = todayTiming?.openTime || explore?.fixOpenTime;
		const openTill = todayTiming?.closeTime || explore?.fixCloseTime;

		return { openFrom, openTill };
	}

	const { openFrom, openTill } = getTodayTiming();

	return (
		<div className="relative h-[60vh] max-h-96 overflow-hidden w-full mx-auto">
			<Image
				src={explore?.specialBannerUrl || img.src}
				quality={95}
				sizes="(max-width: 450px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw"
				alt={"Explore page wallpaper"}
				placeholder="blur"
				blurDataURL={getRandomBlurImg(500, 500)}
				width={500}
				height={400}
				priority={true}
			/>

			<div className="absolute top-0 flex justify-between w-full px-4 py-3 mb-10">
				<div>
					<RestaurantTime openFrom={openFrom} openTill={openTill} />
				</div>
				{
					!isLogin && (
						<div onClick={goToLoginPage} className="flex flex-row space-x-2">
							<button type="button" className="glass-morphism">
								Login/Sign up
							</button>
						</div>
					)
				}
			</div>
		</div>
	)
}

const MemoMainBackground = memo(MainBackground)
export default MemoMainBackground
