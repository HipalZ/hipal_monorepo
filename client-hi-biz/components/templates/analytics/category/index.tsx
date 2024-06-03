import DateRangePicker from "@/components/molecules/dateRangePicker";
import Header from "@/components/molecules/header";
import React, { memo, useState } from "react";
import { BsChevronLeft } from "react-icons/bs";
import Hi from "@/assets/svg/hi.svg";
import { useRouter } from "next/router";
import useTimings from "@/components/store/useTimings";
import axios from "@/axios";
import { Disclosure } from "@headlessui/react";
import { IoFastFoodOutline } from "react-icons/io5";
import type { IAnalyticsItem } from "@/components/types/businessData";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/components/errorComponent";

function AnalyticsCategory() {
	const { inTime, outTime } = useTimings();
	const { setSelectedSubIcon, selectedSubIcon } = useSelectedIcon();
	const router = useRouter();
	const { businessId } = router.query as { businessId: string };
	const [category, setCategory] = useState<IAnalyticsItem[] | null>(null);

	const getCategory = async () => {
		let url = `/v1/kitchens/:id/Category?businessId=${businessId}`;

		if (inTime && outTime) {
			url += `&from=${inTime}&to=${outTime}`;
		}

		try {
			const res = await axios.get(url);
			setCategory(res.data);
			return res.data
		} catch (error) {
			console.error("Error fetching sales report:", error);
		}
	};

	const {isLoading, error, data,refetch} = useQuery<IAnalyticsItem[]>({
		queryKey: ['category', businessId, inTime, outTime],
		queryFn: getCategory,
		enabled: !!businessId && !!inTime && !!outTime && selectedSubIcon==='category',
	})

	if(error) return <ErrorComponent refetch={refetch}/>

	return (
		<>
			<div className="bg-[#f5f5f5]">
				<Header
					title="Analytics"
					onBack={() => setSelectedSubIcon("")}
					leftIcon={<BsChevronLeft />}
					centerImage={Hi}
					rightImage={Hi}
					isIconBusinessShow={true}
				/>
				<div className="flex justify-between items-center mt-6 px-6 pb-4 border-b border-[#cacaca]">
					<div className="flex text-2xl">
						<span className="ml-2"> Category</span>
					</div>
				</div>
				<DateRangePicker />
			</div>
			<div className="relative masonry-layout w-full px-6 mt-6 overflow-auto scroll-smooth space-y-4">
				{isLoading ? (
					<LoadingSpinner />
				) : category && category.length > 0 ? (
					category.map((eachCategory: IAnalyticsItem) => {
						return (
							<div key={eachCategory.categoryName}>
								<Disclosure>
									{({ open }) => {
										return (
											<div className="border border-[#cacaca] rounded-lg">
												<Disclosure.Button className="w-full p-4 cursor-auto">
													<section className="flex justify-between items-center">
														<h1 className="text-base font-semibold capitalize">
															{eachCategory?.parentCategoryName}
														</h1>
													</section>
													<section className="mt-2 text-base flex justify-between items-center">
														<h1>{eachCategory?.orders} orders</h1>
														<h1>{eachCategory?.percentage} %</h1>
													</section>
												</Disclosure.Button>
												{eachCategory?.childs?.length > 0 &&
													eachCategory?.childs.map((eachChild, index) => {
														if (eachChild?.orders === 0) return;
														return (
															<Disclosure.Panel
																key={index.toString()}
																className="mx-4 text-sm"
															>
																<div className="pb-4 space-y-2 text-sm font-medium">
																	<hr className="bg-[#cacaca]" />
																	<div
																		key={index.toString()}
																		className="flex justify-between items-center"
																	>
																		<div className="flex items-center">
																			<IoFastFoodOutline className="text-2xl" />
																			<span className="ml-2">
																				{eachChild?.childCategoryName}
																			</span>
																		</div>
																		<div className="flex justify-between items-center">
																			<span>{eachChild?.orders}</span>
																		</div>
																	</div>
																</div>
															</Disclosure.Panel>
														);
													})}
											</div>
										);
									}}
								</Disclosure>
							</div>
						);
					})
				) : (
					<>
						<div className="fixed transform -translate-x-1/2 top-1/2 left-1/2 text-center flex flex-col">
							No Category Analytics Found
							<div className="text-base">
								({inTime && outTime ? `${inTime} to ${outTime} ` : ""} )
							</div>
						</div>
					</>
				)}
			</div>
		</>
	);
}

export default memo(AnalyticsCategory);
