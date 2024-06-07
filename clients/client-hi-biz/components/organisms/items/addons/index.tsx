import type { IAddOn } from "@/components/types/businessData";
import {
	PAGE_TYPES,
	routePathsWithId,
	routePathsWithIds,
} from "@/components/utils/routes";
import { useRouter } from "next/router";
import { memo, useEffect, useMemo, useState } from "react";

const AddOns = ({
	addOns,
	searchText,
}: {
	addOns: IAddOn[];
	searchText: string;
}) => {
	const router = useRouter();
	const { businessId } = router.query as { businessId: string };
	const handleAddOnClick = () => {
		router.push(routePathsWithId[PAGE_TYPES.ADD_ADD_ONS](businessId));
	};
	const EditAddOn = (addOnId: string) => {
		router.push(
			routePathsWithIds[PAGE_TYPES.EDIT_ADD_ONS](businessId, addOnId),
		);
	};
	const [addOnData, setAddOnData] = useState<IAddOn[]>(addOns);
	let addOnSearch = useMemo(
		() =>
			(addOns || []).filter((addOn) =>
				addOn?.name?.toLowerCase()?.includes(searchText?.toLowerCase()),
			),
		[addOns, searchText],
	);
	useEffect(() => {
		setAddOnData(addOns);
	}, [addOns]);
	useEffect(() => {
		router.query.tab = "Add Ons";
		router.push(router);
	}, []);
	return (
		<section>
			<div className="pb-[5rem]">
				{searchText === "" ? (
					addOnData.length > 0 ? (
						<div className="px-6 mt-6 masonry-layout">
							{addOnData.map((addOn) => (
								<div
									key={addOn?._id}
									className="py-2 px-4 border masonry-item border-[#cacaca] rounded-md space-y-2"
								>
									<h6 className="font-semibold truncate w-48">{addOn?.name}</h6>
									<div className="flex justify-between">
										<span>{addOn?.items?.length} variations</span>
										<button
											type="button"
											onClick={() => EditAddOn(addOn?._id)}
											className="text-[#2F80ED]"
										>
											Edit
										</button>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="fixed z-20 flex items-center justify-center space-x-4 transform -translate-x-1/2 top-1/2  left-1/2">No Addons found</div>
					)
				) : addOnSearch.length > 0 ? (
					<div className="px-6 mt-6 masonry-layout">
						{addOnSearch.map((addOn) => (
							<div
								key={addOn?._id}
								className="py-2 px-4 border masonry-item border-[#cacaca] rounded-md mt-6 space-y-2"
							>
								<h6 className="font-semibold truncate w-48">{addOn?.name}</h6>
								<div className="flex justify-between">
									<span>{addOn?.items?.length} variations</span>
									<button
										type="button"
										onClick={() => EditAddOn(addOn?._id)}
										className="text-[#2F80ED]"
									>
										Edit
									</button>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="fixed z-20 flex items-center justify-center space-x-4 transform -translate-x-1/2 top-1/2 left-1/2">No Addons found</div>
				)}
				<div
					onKeyUp={handleAddOnClick}
					onClick={handleAddOnClick}
					className="fixed bottom-0 w-full p-4 bg-white outline-none cursor-pointer"
				>
					<button
						type="button"
						className="bg-[#2B354D] w-full py-2 rounded-md text-white"
					>
						Add
					</button>
				</div>
			</div>
		</section>
	);
};

export default memo(AddOns);
