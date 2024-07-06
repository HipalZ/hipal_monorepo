"use client";
import { getRandomBlurImg } from "@/components/utils/images"
import Image from "next/image"
import { memo, useCallback, useEffect } from "react"
import img from "@/assets/img/cut.png"
import RestaurantTime from "@/components/atoms/time/restaurant";
import type { IExplore } from "@/components/types/businessData";
import { useLogin } from "@/components/store/useLogin";
import { useRouter, useSearchParams } from "next/navigation";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import useTableData from "@/components/store/useTableData";

const MainBackground = (props: { explore: IExplore | undefined }) =>{  
	const searchParams = useSearchParams();

	const tableName = searchParams?.get("tableName");
	const { setTableName } = useTableData();
	const customLink = useBusinessDetails((s)=>s.businessDetails?.customLink)
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

	const router = useRouter()

	const { isLogin } = useLogin()

	useEffect(()=>{
		if(!!tableName){
			setTableName(tableName)
		}
	},[tableName])

	const goToLoginPage = useCallback(() => {
		router.push(`${routePaths[PAGE_TYPES.SIGN_UP](customLink)}`)
	}, [customLink, router])

	return (
		<div className="relative h-[60vh] max-h-96 overflow-hidden w-full mx-auto">
			<Image
				src={explore?.wallpaper || img.src}
				quality={95}
				sizes="(max-width: 450px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw"
				alt={"Explore page wallpaper"}
				placeholder="blur"
				blurDataURL={getRandomBlurImg(500, 500)}
				width={500}
				height={400}
				priority={true}
			/>

			<div className="absolute top-0 flex px-4 py-3 mb-10">
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

const MemoMainBackground = memo(MainBackground)
export default MemoMainBackground
