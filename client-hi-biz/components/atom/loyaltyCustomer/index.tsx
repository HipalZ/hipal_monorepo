import { useStore } from "@/components/store/useCustomerStore";
import type { Customer } from "@/components/types/businessData";
import { paths } from "@/components/utils/paths";
import { PAGE_TYPES, routePathsWithIds } from "@/components/utils/routes";
import axios from "@/axios";
import { useRouter } from "next/router";
import React, { memo, useEffect, useState } from "react";
import { MdPerson } from "react-icons/md";
import { BiChevronsLeft, BiChevronsRight } from "react-icons/bi";
import useBusinessData from "@/components/store/useBusinessData";
import LoadingSpinner from "../loadingSpinner";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/components/errorComponent";

const LoyaltyCustomer = () => {
	const router = useRouter();
	const { businessId } = router.query as { businessId: string };
	const loyaltyId = useBusinessData((s) => s.existingLoyalty.loyaltyId);
	const selectCustomer = useStore((state) => state.selectCustomer);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const onClickPagination = (newPage: number) => {
		setCurrentPage(newPage);
	};
	const handleClick = (customer: Customer) => {
		selectCustomer(customer);
		router.push(
			routePathsWithIds[PAGE_TYPES.LOYALTY_ID](businessId, customer.loyaltyId),
		);
	};
	const getLoyalCustomerData = async (loyaltyId: any, pageNumber: number) => {
		if (loyaltyId) {
			try {
				const response = await axios.get(
					`${paths.getAllLoyaltyCustomers(loyaltyId, pageNumber)}`,
				);
				return response.data;
			} catch (error) {
				console.error("Error fetching loyal customer data:", error);
			}
		}
	};

	useEffect(() => {
		router.query.tab = "Customer";
		router.push(router);
	}, []);

	const { isLoading, error, data: loyalCustomers,refetch } = useQuery<Customer[]>({
		queryKey: ['loyaltyCustomers', loyaltyId, currentPage],
		queryFn: () => getLoyalCustomerData(loyaltyId, currentPage),
		enabled: !!loyaltyId && !!currentPage,
	})

	if(error)return <ErrorComponent refetch={refetch}/>

	return (
		<>
			<div className="relative masonry-layout w-full px-6 pb-[10rem] mt-6 overflow-auto scroll-smooth">
				{isLoading ? (
					<LoadingSpinner />
				) : loyalCustomers && loyalCustomers.length > 0 ? (
					loyalCustomers?.map((customer) => (
						<div
							key={customer.id}
							onKeyDown={() => handleClick(customer)}
							onClick={() => handleClick(customer)}
							className="masonry-item bg-white hover:bg-[#2B354D]/10 cursor-pointer text-[#2B354D] rounded-lg border border-[#cacaca] font-medium capitalize"
						>
							<div className="flex items-center justify-between px-4 py-2">
								<div className="flex items-center">
									<MdPerson className="mr-2" />
									<span>{customer?.userName?.slice(0, 21)}</span>
								</div>
								<span className=""> {customer?.userPhone} </span>
							</div>
							<div className="flex items-center justify-between px-4 py-2">
								<span className="text-sm opacity-60">
									Rewards given so far ₹ {customer?.rewards}
								</span>
								<span className="text-[#2B354D] font-semibold">view</span>
							</div>
						</div>
					))
				) : (
					<>
						<span className="fixed transform -translate-x-1/2 top-1/2 left-1/2 text-center flex flex-col">
							No data Found
						</span>
					</>
				)}
			</div>
			<div className="fixed z-20 flex items-center justify-center space-x-4 transform -translate-x-1/2 bottom-[5rem] left-1/2">
				{loyalCustomers && loyalCustomers.length >= 0 && (
					<button
						type="button"
						onClick={() => onClickPagination(currentPage - 1)}
						disabled={currentPage === 1}
						className="text-base w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]"
					>
						<BiChevronsLeft />
					</button>
				)}
				<p className="w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]">
					{currentPage}
				</p>
				{loyalCustomers && loyalCustomers.length > 0 && (
					<button
						type="button"
						onClick={() => onClickPagination(currentPage + 1)}
						className="text-base w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]"
					>
						<BiChevronsRight />
					</button>
				)}
			</div>
		</>
	);
};

export default memo(LoyaltyCustomer);
