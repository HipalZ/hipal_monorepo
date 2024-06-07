import { useBusinessData } from "@/components/store/useBusinessData";
import { useUserLogin } from "@/components/store/useUserLogin";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { MdMenuOpen } from "react-icons/md";
import HikicthenLogo from "../../../../assets/svg/hikitchenlogo.svg";
import { HiArrowNarrowRight } from "react-icons/hi";
import { useRouter } from "next/router";
import type { IKitchen } from "@/components/types";
import Link from "next/link";
import {
	PAGE_TYPES,
	doubleRoute,
	singleRoute,
} from "@/components/utils/routes";
import axios from "@/axios";
import { useQuery } from "@tanstack/react-query";

function Kitchens() {
	const { user, isLogin, setIsLogin, setKitchenName } = useUserLogin();
	const { businessData } = useBusinessData();
	const [kitchenData, setKitchenData] = useState<IKitchen[]>([]);
	const today = new Date();
	const date = today.toLocaleDateString("en-US", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
	const day = today.toLocaleDateString("en-US", { weekday: "long" });
	const router = useRouter();

	const { businessId } = router.query as { businessId: string };
  const id = useBusinessData((s) => s.businessData.id);
 

	const handleToggle = () => {
		setIsLogin(!isLogin);
	};

	const handleKitchenClick = (kitchenName: string) => {
		setKitchenName(kitchenName);
	};

	const getAllKitchenByChef = async () => {
		try {
			const config = {
				method: "get",
				url: `/v1/kitchens/All/ByChef?businessId=${businessId || id}&chefId=${user?.id}`,
			};
			const res = await axios(config);
      console.log(res.data);
			if (res.status === 200) {
				setKitchenData(res.data);
        return res.data;
			}
			
		} catch (error) {
			console.log(error);
		}
	};

	const { isPending, error, data } = useQuery({
		queryKey: ["kitchens", businessId, user?.id],
		queryFn: getAllKitchenByChef,
		enabled: !!businessId && !!user?.id,
	});

	if (isPending) {
		return <div>Loading...</div>;
	}
  

	return (
		<div className="bg-[#f5f5f5] min-h-screen pb-6">
			<div className="flex justify-between lg:justify-center ml-[1.5rem] pt-[2rem] md:mx-[4rem] lg:mx-[12rem]">
				<Image
					className="lg:w-[12rem] lg:h-[6rem] md:w-[8rem] md:h-[3rem]"
					width={90}
					height={40}
					src={HikicthenLogo}
					alt="Hi Table Logo"
				/>
				<Link href={singleRoute[PAGE_TYPES.SETTING](businessId)}>
					<MdMenuOpen className="mr-[1.5rem] text-2xl lg:hidden" />
				</Link>
			</div>
			<div className="grid grid-cols-1 lg:gap-6 md:grid-cols-1 lg:grid-cols-2 lg:mx-[11rem]">
				<div className="flex flex-row py-4 lg:h-[12rem] bg-[#50A466] rounded-2xl mx-6 md:mx-[4rem] lg:mx-4 mt-6">
					<div className="w-[25%] flex flex-col items-center justify-center text-center mx-4 py-4 text-[#505050] bg-white rounded-2xl">
						<div>{date}</div>
						<div className="text-[#505050] text-[1.125rem] font-bold">
							{day}
						</div>
					</div>
					<div className="flex flex-row flex-1 ">
						<div className="flex flex-col items-center justify-center flex-1 text-white">
							<div>Punch In</div>
							<div>Punch Out</div>
						</div>
						<div className="w-[0.125rem] bg-white" />
						<div className="flex flex-col items-center justify-center flex-1 text-white">
							<div>Punch In</div>
							<div>Punch Out</div>
						</div>
					</div>
				</div>

				<div className="mx-[1.5rem] md:mx-[4rem] lg:mx-4 bg-white rounded-2xl pb-[0.5rem] border border-[#e1e1e1]/50 mb-6 mt-[1.5rem]">
					<div className="flex justify-between">
						<div className="mt-4 ml-4 ">
							<span className="font-[400] text-black text-[1rem] md:text-xl lg:text-2xl xl:text-3xl leading-[1.125rem]">
								Hello,{" "}
							</span>
							<span className="font-semibold capitalize text-[#50A466] text-[1rem] md:text-xl lg:text-2xl xl:text-3xl leading-[1.125rem]">
								{user?.name}
							</span>
						</div>
						<div className="w-7 h-7 md:w-10 md:h-10 lg:w-12 lg:h-12 mt-[0.75rem] capitalize mr-[1rem] justify-center pt-1 flex border-[#50A466] bg-white border rounded-full font-semibold text-black text-[1rem] md:text-xl lg:text-2xl xl:text-3xl leading-[1.125rem]">
							{user?.name?.[0]}
						</div>
					</div>
					<div className="mx-4 mt-2">
						<span className="font-[400] text-black text-[0.875rem] md:text-lg lg:text-xl xl:text-2xl leading-[1rem]">
							You logged into{" "}
						</span>
						<span className="font-semibold capitalize text-[#50A466] text-[0.875rem] md:text-lg lg:text-xl xl:text-2xl leading-[1rem]">
							{businessData?.businessName}
						</span>
					</div>
					<div>
						<div className="flex items-center mx-[1rem] my-4 rounded-xl border border-[#50A466]/80">
							<button
								type="button"
								className={`relative capitalize flex w-full h-8 rounded-full transition-colors duration-300 ease-in-out ${
									isLogin ? "" : ""
								}`}
								onClick={handleToggle}
							>
								<span
									className={`absolute top-0.5 left-[0.125rem] bottom-0.5 w-[49.5%] h-7 transform transition-transform duration-300 ease-in-out rounded-xl ${
										isLogin ? "translate-x-full bg-green-500" : "bg-[#7D857F]"
									}`}
								/>
								<div
									className={`absolute z-50 left-12 top-2 font-[400] text-[0.875rem] leading-[1rem] ${
										isLogin ? "text-[#50A466]" : "text-white"
									}`}
								>
									day out
								</div>
								<div
									className={`absolute z-50 right-14 top-2 font-[400] text-[0.875rem] leading-[1rem] ${
										isLogin ? "text-white" : "text-[#50A466]"
									}`}
								>
									day in
								</div>
							</button>
						</div>
					</div>
					<span className="font-semibold mx-[1rem] mt-4 text-[#50A466]/40 text-[0.875rem] leading-[1rem]">
						Your break was at
					</span>
				</div>
			</div>
			<span className="font-[500] md:ml-[4rem] lg:ml-[12rem] ml-6 text-[#50A466] md:text-lg lg:text-2xl xl:text-3xl text-[0.875rem] leading-[1rem]">
				Kitchens
			</span>

			<div className="grid grid-cols-2 gap-4 md:gap-8 lg:gap-[2rem] xl:gap-[3rem] md:mx-[4rem] lg:mx-[12rem] mx-6 mt-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
				{kitchenData &&
					kitchenData?.length > 0 &&
					kitchenData?.map((item) => (
						<Link
							href={`${doubleRoute[PAGE_TYPES.KITCHEN_DETAIL](
								businessId,
								item?.id,
							)}`}
							key={item?.id}
							onClick={() => handleKitchenClick(item?.kitchenName)}
							className="relative bg-white w-full md:min-h-[12rem] min-h-[8rem] rounded-xl"
						>
							<div className="mt-4 ml-4">{item?.kitchenName}</div>
							<div className="absolute bottom-4 left-0 right-0 mx-4 rounded-2xl bg-[#50A466] h-[2rem]">
								<HiArrowNarrowRight className="text-white text-[1.25rem] absolute right-0 left-0 top-0 m-auto bottom-0" />
							</div>
						</Link>
					))}
			</div>
		</div>
	);
}

export default Kitchens;
