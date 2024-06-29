"use client";
import React, { useCallback, useState } from "react";
import Image from "next/image";
import type { IBusinessData, UserData } from "@/components/types/businessData";
import { timestampToDateTime } from "@/components/utils/helpers";
import { useLogin } from "@/components/store/useLogin";
import axios from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";
import useUserReward from "@/components/store/useUserReward";
import avatar from "@/assets/img/avatar.png";
import Link from "next/link";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import dynamic from "next/dynamic";

const BackButton = dynamic(() => import('@/components/atoms/backButton'));
const BottomButton = dynamic(() => import('@/components/molecules/bottomButton'));

const LoyaltyId = ({ data }: { data: IBusinessData }) => {
	const [loading, setLoading] = useState(false);
	const [pageNumber, setPageNumber] = useState(1);
	const { userDetails } = useLogin();
	const [itemData, setItemData] = useState<UserData[]>([]);
	const { userTotalHistory } = useUserReward();
	const customLink = useBusinessDetails((s) => s?.businessDetails?.customLink);
	const [hasMoreData, setHasMoreData] = useState(true);

	const getUserHistory = async (pageNumber:Number) => {
		if (
			userDetails.phone === "NaN" ||
			Number(userDetails.phone) === 0 ||
			data?.loyalty?.loyaltyId === undefined
		)
			return;
		setLoading(true);
		const config2 = {
			method: "GET",
			url:`/v1/users/:businessId/getUserRewardHistory?userPhone=${Number(userDetails.phone)}&loyaltyId=${data?.loyalty?.loyaltyId}&pageNumber=${pageNumber}`
		};
		try {
			const response = await axios(config2);
            const newData = response?.data?.data?.items || [];
            if (newData.length === 0) {
                setHasMoreData(false); 
            } else {
                setItemData(prevData => [...prevData, ...newData]);
            }
            return newData;
		} catch (err) {
			console.log(err);
		} finally {
			setLoading(false);
		}
	};

	const handleClick = useCallback((newPage: number) => {
		if (newPage < 1) return;
		setPageNumber(newPage);
	},[]);

	useQuery({
		queryKey: [
			"userHistory",
			data?.loyalty?.loyaltyId,
			userDetails.phone,
			pageNumber,
		],
		queryFn: () => getUserHistory(pageNumber),
		enabled: !!data?.loyalty?.loyaltyId && !!userDetails.phone && !!pageNumber,
	});

	return (
		<div className="relative flex flex-col w-full pb-16 mt-6 syne-font">
			<div className="mx-6 mb-[5rem]">
				<div className="flex items-center justify-between">
					<span className="flex items-center space-x-2">
						<BackButton />
						<Image
							src={avatar}
							alt="avatar"
							className="sm:w-10 sm:h-10 lg:h-12 lg:w-12 rounded-full"
						/>
						<b>Hey {userDetails?.name} !!</b>
					</span>
					<Link href={`/r/${customLink}/loyalty/`}>
						<button
							type="button"
							className="px-4 py-2 border on_active_bounce bg-base-100 text-primary border-primary rounded-full text-xs"
						>
							My Wallet
						</button>
					</Link>
				</div>
				&nbsp;
				<div className="bg-primary/90 h-[7rem] flex justify-between items-center -mx-6 rounded-t-3xl pt-4 mb-4 px-10 h-[7rem]">
					<h3 className="mt-4 text-3xl font-thin capitalize text-base-100">
						{data?.business?.businessName}
					</h3>
					<figure>
						<Image
							src={data?.business?.logo || ""}
							alt="logo"
							width={64}
							height={64}
						/>
					</figure>
				</div>
				<br />
				<section className="flex text-center justify-around text-primary mb-8">
					<article className="border-r-2 border-primary pr-5">
						<h1 className="text-3xl">{userTotalHistory?.totalWin || 0}</h1>
						<p>Total win</p>
					</article>
					<article className="border-r-2 border-primary pr-5">
						<h1 className="text-3xl">{userTotalHistory?.totalSave || 0}</h1>
						<p>Total saved</p>
					</article>
					<article>
						<h1 className="text-3xl">Silver</h1>
						<p>VIP Level</p>
					</article>
				</section>
				<center className="font-semibold text-2xl">My History</center>
				<br />
				<div>
					{itemData?.map((item) => {
						return (
							<section className="bg-base-200 my-2 flex justify-between items-center px-2 py-3 rounded-lg">
								<article className="flex space-x-0">
									<figure className="w-[4rem] shrink-0 ">
										<Image
											src={data?.business?.logo || ""}
											alt="logo"
											width={52}
											height={52}
										/>
									</figure>
									<div>
										<h1 className="text-lg font-semibold">
											{item?.rewards} Coinz{" "}
											{item?.status === "plus" ? "Won" : "Used"}
										</h1>
										<span className="text-sm">
											{timestampToDateTime(item?.date)}
										</span>
									</div>
								</article>
								<div className="flex flex-col w-[5rem] bg-white justify-center items-center p-2">
									<p className="font-bold">{item?.rewards}</p>
									<center className="text-xs font-bold">
										Coinz {item?.status === "plus" ? "Won" : "Used"}
									</center>
								</div>
							</section>
						);
					})}
					{!hasMoreData && (
                        <div className="text-center text-gray-500 my-4">
                            No more data available.
                        </div>
                    )}
					<button
                        onClick={() => handleClick(pageNumber + 1)}
                        disabled={loading || !hasMoreData}
                        type="button"
                        className="w-full mt-4 bg-primary rounded-full on_active_bounce btn"
                    >
                        {loading ? (
                            <span className="loader_spinner !border-t-base-100 "></span>
                        ) : (
                            hasMoreData ? "Load More" : "No More Data"
                        )}
                    </button>
				</div>
			</div>
			<BottomButton/>
		</div>
	);
};

export default LoyaltyId;
