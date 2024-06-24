import DinningSVG from "@assets/svg/dinningSVG"
import CartCard from "@components/atoms/card/cartCard"
import { useActiveClass } from "@components/store/useActiveClass"
import {
	_useAllBusiness,
	initializeAllBusiness,
	useAllBusiness,
} from "@components/store/useAllBusiness"
import { useCart } from "@components/store/useCart"
import type { IBusinessData } from "@components/types/businessData"
import { getGrandTotal } from "@components/utils/helpers"
import { paths } from "@components/utils/paths"
import { PAGE_TYPES, routePaths } from "@components/utils/routes"
import axios from "@utils/axios"
import { useRouter } from "next/router"
import type { NextRequest, NextResponse } from "next/server"
import { memo, useCallback, useDeferredValue, useEffect, useMemo } from "react"
import { BiDish } from "react-icons/bi"
import { useLogin } from "@components/store/useLogin"
import useLoyaltyData from "@components/store/useLoyaltyData"
import useBusinessDetails from "@components/store/useBusinessDetails"
import {
	beans,
	bowl,
	bud,
	flower,
	love,
	triangleToDataurl,
	waveToDataUrl,
} from "@components/atoms/card/pathPattern"
import Link from "next/link"
import dynamic from "next/dynamic"
import SkeletonLoader from "@components/atoms/loader/skeletonLoader"

const TopBackground = dynamic(() => import("@components/molecules/topBackground"), {
	ssr: false,
	loading: () => <SkeletonLoader height={350} />,
})

const SubLoyalty = dynamic(() => import("@components/atoms/subLoyalty"), {
	ssr: false,
	loading: () => <SkeletonLoader />,
})

const PageName = dynamic(() => import("@components/molecules/pageName"), {
	ssr: false,
	loading: () => <SkeletonLoader />,
})
const Footer = dynamic(() => import("@components/molecules/footer"), {
	ssr: false,
	loading: () => <SkeletonLoader height={450} />,
})
const Header = dynamic(() => import("@components/molecules/header"), {
	ssr: false,
	loading: () => <SkeletonLoader />,
})

export default memo(function Dine() {
	const router = useRouter()
	const { businessId } = router.query as { businessId: string }
	const businessDetails = useBusinessDetails((s) => s.businessDetails)
	const isActiveCategory = useActiveClass((s) => s.isActiveCategory)
	const isLogin = useLogin((s) => s.isLogin)
	const setDirection = useLogin((s) => s.setDirection)
	const { data: _data } = useAllBusiness()
	const { data: finalCartData } = _useAllBusiness()
	const { cart } = useCart()
	const deferredCart = useDeferredValue(cart)
	const { loyaltySetting } = useLoyaltyData()
	const findPattern = (pattern: string) => {
		const value = srcColor?.find((item) => item?.src?.hasOwnProperty(pattern))
		return value?.src
	}
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
	]

	const sortedDishes = useCallback(() => {
		const newCart = { ...deferredCart }
		return newCart
	}, [deferredCart])

	const _getGrandTotal = useMemo(() => getGrandTotal(cart, _data), [_data, cart])

	useEffect(() => {
		initializeAllBusiness(finalCartData)
	}, [finalCartData])

	function redirectLoginPage() {
		if (!isLogin) {
			return routePaths[PAGE_TYPES.SIGN_UP](businessId)
		}
	}

	const goToLoyalty = (str: string) => {
		if (!isLogin) {
			setDirection(str)
			return routePaths[PAGE_TYPES.SIGN_UP](businessId)
		}
		setDirection("")
		return routePaths[PAGE_TYPES.LOYALTY](businessId)
	}

	return (
		<div className="relative flex flex-col w-full">
			<TopBackground
				onBackURL={`${routePaths[PAGE_TYPES.CATEGORY_BY_ID](businessId, isActiveCategory)}`}
			/>
			<Header
				hideBackBtn
				title={
					<>
						<div className="flex flex-row space-x-4 text-primary">
							<DinningSVG className="my-auto text-xl fill-primary" />
							<span className="my-auto ml-2 text-xl font-bold">Final Cart</span>
						</div>
					</>
				}
				showOtherButtons
				otherButtons={<>{/* <EmptyCartBtn /> */}</>}
			/>
			<div className="z-10 flex flex-col w-full pt-4 text-4xl shadow-xl bg-base-100 rounded-t-3xl">
				<div className="px-6 !my-0 " />
				{_getGrandTotal > 0 ? (
					<>
						<div
							onClick={redirectLoginPage}
							className="flex flex-row items-center py-4 mx-4 prose rounded-2xl bg-primary/90 "
						>
							<div className="mx-6 text-base-100 ">
								<BiDish className="text-3xl" />
							</div>
							<div className="text-left ml- text-base-100">
								<div className="">Please call the waiter</div>
								<div className="text-xs">and share your order!</div>
							</div>
						</div>
						<div className=" divide-base-content/20 flex pb-6 flex-col mx-6 divide-y  !my-0">
							{Object.keys(sortedDishes()).map((dishId, index) => (
								<CartCard key={index.toString()} cartDish={cart?.[dishId]} />
							))}
						</div>
					</>
				) : (
					<>
						<div className="py-8 pt-4 prose">
							<h3 className="text-center">Add Dishes to Order</h3>
						</div>
					</>
				)}

				{loyaltySetting?.loyaltyId && (
					<Link href={`${goToLoyalty("loyalty")}`} passHref>
						<div className="relative p-4 mx-4 mb-4 overflow-hidden border rounded-xl border-accent bg-base-200/50">
							<div className="absolute right-9 -bottom-4 bg-white w-[64px] h-[64px]" />
							<div className="absolute w-[35%] h-full transform rotate-45 bg-base-200 -bottom-4 -right-12" />
							<SubLoyalty
								logo={businessDetails?.logo}
								cardColor={loyaltySetting?.cardColor}
								fontColor={loyaltySetting?.fontColor}
								src={findPattern(loyaltySetting?.cardPattern) || beans(loyaltySetting?.fontColor)}
							/>
						</div>
					</Link>
				)}
				<PageName />
				<Footer />
			</div>

			{/* <FinalCartBtn /> */}
		</div>
	)
})
