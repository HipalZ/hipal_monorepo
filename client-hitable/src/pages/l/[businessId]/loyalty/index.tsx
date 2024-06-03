import Image from "next/image";
import React, { memo, useEffect, useState } from "react";
import HiPalLogo from "@/assets/svg/hipalLogoNew.svg";
import { HiSearch } from "react-icons/hi";
import { CgProfile } from "react-icons/cg";
import FooterLite from "@/components/molecules/footerLite";
import axios from "@/axios";
import { useRouter } from "next/router";
import { PAGE_TYPES, singleRoute } from "@/components/utils/routes";
import { paths } from "@/components/utils/paths";
import { useLogin } from "@/components/store/useLogin";
import {
	type IUserHistory,
	useUsersHistory,
} from "@/components/store/useUsersHistory";
import { isEqual } from "lodash-es";
import Logout from "@/components/atoms/logout";
import { BiChevronsLeft, BiChevronsRight } from "react-icons/bi";
import LoadingSpinner from "@/components/atoms/loadingSpinner";
import { useQuery } from "@tanstack/react-query";

const Loyalty = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [pageNumber, setPageNumber] = useState(1);
	const [usersHistory, setUsersHistory] = useState<IUserHistory[]>([]);
	const [singleUser, setSingleUser] = useState<IUserHistory[]>([]);
	const [isSearchActive, setIsSearchActive] = useState(false);
	const setUsersHistoryZ = useUsersHistory((s) => s.setUsersHistory);
	const usersHistoryZ = useUsersHistory((s) => s.usersHistory);
	const { setSingleUserHistory } = useUsersHistory();
	const loyaltyId = useLogin((s) => s.loyaltyId);
	const router = useRouter();
	const { businessId } = router.query as { businessId: string };

	useEffect(() => {
		setUsersHistory(usersHistoryZ);
	}, []);

	const handleSearchChange = async (e: any) => {
		const value = e.target.value.replace(/\D/g, "");
		setSearchQuery(value);
		if (value.length === 10 && loyaltyId !== undefined) {
			setIsSearchActive(true);
			setIsLoading(true)
			getUserData(value, businessId, loyaltyId);
		} else {
			setIsSearchActive(false);
		}
	};

	const getUserData = async (
		value: string,
		businessId: string,
		loyaltyId: string,
	) => {
		try {
			const userHistory = await axios(
				`/v1/users/${businessId}/RewardHistory?loyaltyId=${loyaltyId}&findUser=${value}`,
			);
			setIsLoading(false)
			if (userHistory.data) {
				setSingleUser([userHistory.data]);

			}
		} catch (err) {
			console.log(err);
		}
	};

	const getHistoryApi = async (loyaltyId: string) => {
		const fieldMasks =
			'[ "userName", "rewards", "status", "time", "loyaltyId", "id", "userPhone" ]';
		try {
			const userHistory = await axios(
				paths.getUsersHistory(pageNumber, businessId, loyaltyId, fieldMasks),
			);
			setIsLoading(false)
			if (!isEqual(usersHistoryZ, userHistory.data)) {
				setUsersHistoryZ(userHistory.data);
				setUsersHistory(userHistory.data);
				setIsLoading(false)
			}
			return userHistory.data;
		} catch (err) {
			console.log(err);
		}
	};

	const { isLoading:isLoadingHistory, error, data } = useQuery({
		queryKey: ["usersHistory", pageNumber, businessId, loyaltyId],
		queryFn: () => getHistoryApi(loyaltyId || ''),
		enabled: !!loyaltyId && !!businessId && !!pageNumber,
	})

	const handleUserData = async (e: any, user) => {
		if (searchQuery?.length > 0 && searchQuery?.length < 10) return;
		setIsLoading(true)
		try {
			if (!loyaltyId) return;
			const fieldMasks =
				'[ "userName", "rewards", "status", "time", "loyaltyId", "id","waiterName","userPhone","waiterName","day","total" ]';

			const response = await axios(
				paths.getSingleUserHistory(
					Number(searchQuery || user?.userPhone),
					loyaltyId,
					fieldMasks,
				),
			);
			setIsLoading(false)
			if (response.data) {
				setSingleUserHistory(response?.data);
				router.push(singleRoute[PAGE_TYPES.TRANSACTIONS](businessId));
			}
		} catch (err) {
			console.log(err);
		}
	};
	const handleClick = (newPage: number) => {
		setPageNumber(newPage);
	};

	if (isLoadingHistory) return <LoadingSpinner />
	if (error) return <div>Error: {error.message}</div>

	return (
		<div className="relative min-h-screen pb-20 bg-secondary/50">
			<div className="sticky top-0 z-20 bg-secondary">
				<div className="flex justify-between ml-[1.5rem] pt-[2rem] mb-4">
					<Image width={68} height={25} src={HiPalLogo} alt="Hi Table Logo" />
					<div className="flex items-center mx-6">
						<Logout />
					</div>
				</div>
				<div className="relative mx-6">
					<HiSearch
						size={16}
						className="absolute inset-y-0 text-primary/80 dark:text-primary flex items-center pointer-events-none top-[0.625rem] left-2"
					/>
					<input
						type="text"
						maxLength={10}
						pattern="\d{10}"
						placeholder="Search by number"
						onChange={handleSearchChange}
						className="w-full border border-primary pl-8 py-2 rounded-lg pr-2 text-[#8E92A1] text-sm"
					/>
				</div>
			</div>
			{isSearchActive ? (
				singleUser.length > 0 ? (
					singleUser?.map((user, index) => {
						return (
							<div
								onKeyDown={(e) => handleUserData(e, user)}
								key={index.toString()}
								onClick={(e) => handleUserData(e, user)}
								className="mx-[1.5rem] bg-base-100 rounded-2xl pb-[0.5rem] border border-[#e1e1e1]/50 mt-[1rem]"
							>
								<div className="flex justify-between">
									<div className="flex items-center justify-between w-full mt-4 ml-3">
										<div className="flex">
											<span className="mx-1">
												<CgProfile size={20} />
											</span>
											<span className="capitalize font-semibold ml-1 text-base-content text-[1rem] leading-[1.125rem]">
												{user?.userName || user?.userPhone}
											</span>
										</div>
									</div>
								</div>
								<div className="mx-4 my-2">
									<span>{user?.userPhone}</span>
								</div>
							</div>
						);
					})
				) : (
					<div className="fixed z-20 flex items-center justify-center space-x-4 transform -translate-x-1/2 left-1/2 top-1/2">
						Data Not Found
					</div>
				)
			) : usersHistory?.length > 0 ? (
				usersHistory?.map((user, index) => {
					return (
						<div
							key={index.toString()}
							onKeyDown={(e) => handleUserData(e, user)}
							onClick={(e) => handleUserData(e, user)}
							className="mx-[1.5rem] bg-base-100 rounded-2xl pb-[0.5rem] border border-[#e1e1e1]/50 mt-[1rem]"
						>
							<div className="flex justify-between">
								<div className="flex items-center justify-between w-full mt-4 ml-3">
									<div className="flex align-center">
										<span className="mx-1">
											<CgProfile size={20} />
										</span>
										<span className="capitalize font-semibold ml-1 text-base-content text-[1rem] leading-[1.125rem]">
											{user?.userName || user?.userPhone}
										</span>
									</div>
									<div className="mr-4">
										<span className="text-[#999] text-sm">{user?.time}</span>
									</div>
								</div>
							</div>
							<div className="mx-4">
								{user?.status === "plus" ? (
									<span className="font-[400] text-[0.875rem] leading-[1rem] text-[#00BA34]">
										Got {user?.rewards} coins
									</span>
								) : (
									<span className="font-[400] text-[0.875rem] leading-[1rem] text-[#fc4848]">
										Claim {user?.rewards} coins
									</span>
								)}
							</div>
						</div>
					);
				})
			) : (
				<div className="fixed z-20 flex items-center justify-center space-x-4 transform -translate-x-1/2 left-1/2 top-1/2">
					Loading or No Data
				</div>
			)}
			{!isSearchActive && (
				<div className="fixed z-20 flex items-center justify-center space-x-4 transform -translate-x-1/2 bottom-[5rem] left-1/2">
					<button
						type="button"
						onClick={() => handleClick(pageNumber - 1)}
						disabled={pageNumber === 1}
						className="text-base w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]"
					>
						<BiChevronsLeft />
					</button>
					<p className="w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]">
						{pageNumber}
					</p>
					{usersHistory && usersHistory.length >0 ? <button
						type="button"
						onClick={() => handleClick(pageNumber + 1)}
						className="text-base w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]"
					>
						<BiChevronsRight />
					</button>:null}
				</div>
			)}
			<FooterLite />
		</div>
	);
};

export default memo(Loyalty);
