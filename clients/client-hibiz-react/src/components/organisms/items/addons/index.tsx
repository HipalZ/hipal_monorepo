import type { IAddOn } from "@/components/types/businessData";
import {
	PAGE_TYPES,
	routePathsWithId,
	routePathsWithIds,
} from "@/components/utils/routes";
import { memo, startTransition, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const AddOns = memo(({
	addOns,
	searchText,
}: {
	addOns: IAddOn[];
	searchText: string;
}) => {
	const navigate = useNavigate()
	const { businessId } = useParams<{ businessId: string }>();
	const handleAddOnClick = () => {
		startTransition(()=>{
			navigate(routePathsWithId[PAGE_TYPES.ADD_ADD_ONS](businessId || ''));
		})
	};
	const EditAddOn = (addOnId: string) => {
		startTransition(() => {
			navigate(
				routePathsWithIds[PAGE_TYPES.EDIT_ADD_ONS](businessId || '', addOnId),
			);
		})
	};
	const [addOnData, setAddOnData] = useState<IAddOn[]>(addOns);
	const addOnSearch = useMemo(
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
		const params = new URLSearchParams(location.search);
		if (params.get('tab') !== 'Add Ons') {
			params.set('tab', 'Add Ons');
			startTransition(()=>{
				navigate({ search: params.toString() }, { replace: true });
			})
		}
	}, [location, navigate]);

	return (
		<section>
			<div className="pb-[5rem]">
				{searchText === "" ? (
					addOnData.length > 0 ? (
						<div className="px-6 mt-6 masonry-layout">
							{addOnData.map((addOn) => (
								<div
									key={addOn?.id}
									className="py-2 px-4 border masonry-item border-[#cacaca] rounded-md space-y-2"
								>
									<h6 className="font-semibold truncate w-48">{addOn?.name}</h6>
									<div className="flex justify-between">
										<span>{addOn?.items?.length} variations</span>
										<button
											type="button"
											onClick={() => EditAddOn(addOn?.id)}
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
								key={addOn?.id}
								className="py-2 px-4 border masonry-item border-[#cacaca] rounded-md mt-6 space-y-2"
							>
								<h6 className="font-semibold truncate w-48">{addOn?.name}</h6>
								<div className="flex justify-between">
									<span>{addOn?.items?.length} variations</span>
									<button
										type="button"
										onClick={() => EditAddOn(addOn?.id)}
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
});

export default AddOns
