import { getRandomBlurImg } from "@/components/utils/images"
import Image from "next/legacy/image"
import { memo } from "react"
import img from "@/assets/img/cut.png"
import RestaurantTime from "@/components/atoms/time/restaurant";
import { IExplore } from "@/components/types/businessData";
import { useLogin } from "@/components/store/useLogin";
import { useParams, useRouter } from "next/navigation";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";

function MainBackground(props: { explore: IExplore | undefined }) {
	const explore = props.explore ?? {
		wallpaper: img.src,
		phone: '',
		countryCode: '',
		location: '',
		openFrom: '',
		close: '',
		specialOffers: [],
		popular: [],
		highlights: [],
		openTill: ''
	};

	const { businessId } = useParams<{ businessId: string }>() ?? { businessId: '' };
	const router = useRouter()

	const { isLogin } = useLogin()

	const goToLoginPage = () => {
		router.push(`${routePaths[PAGE_TYPES.SIGN_UP](businessId)}`)
	}

	return (
		<div className="relative h-[60vh] max-h-96 overflow-hidden w-full mx-auto">
			<Image
				src={explore?.wallpaper || img.src}
				layout="fill"
				quality={75}
				sizes="(max-width: 450px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw"
				alt={"Explore page wallpaper"}
				placeholder="blur"
				blurDataURL={getRandomBlurImg(700, 700)}
				priority={true}
			/>

			<div className="sticky flex px-4 py-3 mb-10 bottom-[10%]">
				{
					explore.openFrom && explore.openTill && (
						<div className="">
							<RestaurantTime openFrom={explore?.openFrom}
								openTill={explore?.openTill}
							/>
						</div>
					)
				}
				{
					!isLogin && (
						<div onClick={goToLoginPage} className="flex flex-row ml-auto space-x-2">
							<button className="glass-morphism">
								Login/Sign up
							</button>
						</div>
					)
				}

			</div>
		</div>
	)
}

export default memo(MainBackground)
