import Header from "@/components/molecules/header";
import React, { memo, useEffect } from "react";
import { BsChevronLeft } from "react-icons/bs";
import Hi from "@/assets/svg/hi.svg";
import axios from "@/axios";
import { useRouter } from "next/router";
import { PAGE_TYPES, routePathsWithIds } from "@/components/utils/routes";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import AddKitchen from "./addKitchen";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import ErrorComponent from "@/components/errorComponent";

interface IKitchen {
	businessId: string;
	kitchenName: string;
	description: string;
	staff: string[];
	id: string;
}

function Kitchen() {
	const router = useRouter();
	const { businessId } = router.query as { businessId: string };
	const setSelectedSubIcon = useSelectedIcon((s) => s.setSelectedSubIcon);
	const selectedSubIcon = useSelectedIcon((s) => s.selectedSubIcon);
	const addKitchen = () => {
		setSelectedSubIcon("addKitchen");
	};

	const getData = async () => {
		try {
			const response = await axios(`/v1/kitchens/?businessId=${businessId}`);
			return response?.data
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		if (selectedSubIcon !== "addKitchen") {
			setSelectedSubIcon("kitchen");
		}
		router.query.tab = "Kitchen";
		router.push(router);
	}, [])


	const { isLoading, error, data: kitchens, refetch } = useQuery<IKitchen[]>({
		queryKey: ['kitchens', businessId],
		queryFn: getData,
		enabled: !!businessId && selectedSubIcon === "kitchen"
	})

	if (error) {
		return (
			<ErrorComponent refetch={refetch} />
		);
	}

	const toggleKitchen = () => {
		switch (selectedSubIcon) {
			case "kitchen":
				return (
					<KitchenDashboard
						loading={isLoading}
						kitchens={kitchens || []}
						addKitchen={addKitchen}
						businessId={businessId}
					/>
				);
			case "addKitchen":
				return <AddKitchen setSelectedButton={setSelectedSubIcon} />;
			default:
				return (
					<KitchenDashboard
						kitchens={kitchens || []}
						addKitchen={addKitchen}
						businessId={businessId}
					/>
				);
		}
	};
	return <>{toggleKitchen()}</>;
}

export default memo(Kitchen);

type IProp = {
	kitchens: IKitchen[];
	addKitchen: () => void;
	businessId: string;
	loading?: boolean;
};
const KitchenDashboard = ({
	kitchens,
	addKitchen,
	businessId,
	loading,
}: IProp) => {
	const { setSelectedIcon } = useSelectedIcon();
	const router = useRouter();
	return (
		<>
			<div className="relative">
				<div className="bg-[#f5f5f5] sticky top-0 z-20">
					<Header
						title="Kitchens"
						onBack={() => setSelectedIcon("")}
						leftIcon={<BsChevronLeft />}
						centerImage={Hi}
						rightImage={Hi}
						isIconBusinessShow={true}
					/>
					<div className="flex justify-between items-center mt-6 px-6 pb-4 border-b border-[#cacaca]">
						<div className="flex text-2xl">
							<span className="ml-2">Kitchens</span>
						</div>
					</div>
				</div>
				<div className="mx-6 mt-6 space-y-4 overflow-auto pb-[5rem] masonry-layout">
					{loading ? (
						<LoadingSpinner />
					) : (
						kitchens?.map((kitchen) => (
							<div
								key={kitchen.id}
								className="flex justify-between masonry-item relative items-center px-4 pb-6 pt-2 border border-[#cacaca] rounded-md"
							>
								<div className="">
									<div className="pb-4 ml-2">{kitchen.kitchenName}</div>
									<div
										onClick={() =>
											router.push(
												routePathsWithIds[PAGE_TYPES.EDIT_KITCHEN](
													businessId,
													kitchen.id,
												),
											)
										}
										className="absolute bottom-2 right-4 text-[#2F80ED]"
									>
										Edit
									</div>
								</div>
							</div>
						))
					)}
				</div>
				{kitchens.length === 0 && <div className="fixed transform -translate-x-1/2 top-1/2 left-1/2 text-center flex flex-col">
					No Kitchen Added
				</div>}
				<div
					onClick={addKitchen}
					className="fixed bottom-0 w-full p-4 bg-white outline-none cursor-pointer"
				>
					<button
						type="button"
						className={`${loading ? 'pointer-events-none opacity-50' : ''} bg-[#2B354D] w-full py-2 rounded-md text-white on_active_bounce`}
					>
						Add
					</button>
				</div>
			</div>
		</>
	);
};
