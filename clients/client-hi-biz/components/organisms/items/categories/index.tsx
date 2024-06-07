import { useDishSelectionStore } from "@/components/store/useDishStore";
import type { ICategory } from "@/components/types/businessData";
import {
	PAGE_TYPES,
	routePathsWithId,
	routePathsWithIds,
} from "@/components/utils/routes";
import axios from "@/axios";
import { useRouter } from "next/router";
import { memo, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useSettingsData } from "@/components/store/useSettingsData";
import { useQuery } from "@tanstack/react-query";
import { useSelectedButtonStore } from "@/components/store/useSelectBtn";

const CategoriesContent = ({
	categories,
	hide,
	searchText,
}: {
	categories: ICategory[];
	hide: boolean;
	searchText: string;
}) => {
	const router = useRouter();
	const { businessId } = router.query as { businessId: string };
	const { resetStore } = useDishSelectionStore();
	const selectedButton = useSelectedButtonStore()
	const settings = useSettingsData((s) => s.settingsData)
	const setSettings = useSettingsData((s) => s.setSettingsData)
	const [categoryOrder, setCategoryOrder] = useState<string[]>([]);

	const handleAddCategoryClick = () => {
		resetStore();
		router.push(routePathsWithId[PAGE_TYPES.CREATE](businessId));
	};

	const [categoryIDs, setCategoryIDs] = useState<string[]>([]);
	const [isEditingSequence, setIsEditingSequence] = useState<boolean>(false);
	const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
	const [draggedParentId, setDraggedParentId] = useState<string | null>(null);

	useEffect(() => {
		const ids = categories.map((category) => category._id);
		setCategoryIDs(ids);
	}, [categories]);

	useEffect(() => {
		router.query.tab = "Categories";
		router.push(router);
	}, []);

	const organizeCategories = (categories) => {
		const obj = {};
	
		// Use categoryOrder to organize categories
		const orderedCategories = categoryOrder.length ? categoryOrder : categoryIDs;
	
		for (let index = 0; index < orderedCategories?.length; index++) {
			const categoryId = orderedCategories[index];
			const category = categories.find((cat) => cat._id === categoryId);
			if (category?.hierarchy === "PARENT") {
				if (!obj[category._id]) {
					obj[category._id] = {
						parentName: category.name,
						_id: category._id,
						child: [],
					};
				}
			}
			if (category?.hierarchy === "CHILD") {
				if (obj[category.parentCategoryId]) {
					obj[category.parentCategoryId].child.push({
						name: category.name,
						_id: category._id,
					});
				}
			}
		}
	
		for (let index = 0; index < categories?.length; index++) {
			const category = categories[index];
			if (orderedCategories.includes(category._id)) {
				continue;
			}
			if (category?.hierarchy === "PARENT") {
				if (!obj[category._id]) {
					obj[category._id] = {
						parentName: category.name,
						_id: category._id,
						child: [],
					};
				}
			}
			if (category?.hierarchy === "CHILD") {
				if (obj[category.parentCategoryId]) {
					obj[category.parentCategoryId].child.push({
						name: category.name,
						_id: category._id,
					});
				}
			}
		}
		return obj;
	};
	
	const organizedCategories = useMemo(() => {
		return organizeCategories(categories);
	}, [categories, categoryOrder]);
	
	const editCategory = (create: string) => {
		router.push(
			routePathsWithIds[PAGE_TYPES.EDIT_CATEGORY](businessId, create),
		);
	};
	const filterCategory = useMemo(
		() =>
			categories?.filter((obj) => {
				if (obj?.name?.toLowerCase()?.includes(searchText?.toLowerCase())) {
					return obj;
				}
			}),
		[categories, searchText],
	);

	const handleDragStart = (id: string, parentId: string | null = null) => {
		setDraggedItemId(id);
		setDraggedParentId(parentId);
	};

	const handleDragOver = (event) => {
		event.preventDefault();
	};

	const handleDrop = (targetId: string, targetParentId: string | null = null) => {
		if (draggedItemId) {
			// Check if dragging parent and dropping on child, prevent this action
			if ((draggedParentId === null && targetParentId !== null) ||
				(draggedParentId !== null && targetParentId === null)) {
				return;
			}
	
			if (draggedParentId && targetParentId && draggedParentId !== targetParentId) {
				return;
			}
	
			setCategoryOrder((prevCategoryOrder) => {
				// Ensure all categories, including new ones, are present in the categoryOrder
				let updatedCategories = [...prevCategoryOrder];
				const allCategoryIds = categories.map(cat => cat._id);
	
				allCategoryIds.forEach(id => {
					if (!updatedCategories.includes(id)) {
						updatedCategories.push(id);
					}
				});
	
				const draggedIndex = updatedCategories.indexOf(draggedItemId);
				const targetIndex = updatedCategories.indexOf(targetId);
	
				if (draggedIndex !== -1 && targetIndex !== -1) {
					if (draggedParentId && targetParentId && draggedParentId === targetParentId) {
						// Handle reordering within the same parent category
						const parentCategory = categories.find(cat => cat._id === draggedParentId);
						if (parentCategory) {
							const parentChildIds = updatedCategories.filter(id => {
								const cat = categories.find(cat => cat._id === id);
								return cat && cat.parentCategoryId === draggedParentId;
							});
							const start = updatedCategories.indexOf(parentChildIds[0]);
							const end = updatedCategories.indexOf(parentChildIds[parentChildIds.length - 1]);
							const [removed] = updatedCategories.splice(draggedIndex, 1);
							updatedCategories.splice(Math.min(targetIndex, end), 0, removed);
						}
					} else if (draggedParentId === null && targetParentId === null) {
						// Handle reordering among parent categories
						const [removed] = updatedCategories.splice(draggedIndex, 1);
						updatedCategories.splice(targetIndex, 0, removed);
					}
				}
				return updatedCategories;
			});
	
			setDraggedItemId(null);
			setDraggedParentId(null);
		}
	};
	
	const handleDragEnd = () => {
		setDraggedItemId(null);
		setDraggedParentId(null);
	};

	const handleCategoryOrder = async (settingID: string) => {
		try {
			const config = {
				method: "PUT",
				url: `/v1/settings/${settingID}`,
				data: {
					businessId: businessId,
					categoryOrder: categoryOrder,
				},
			};
			const response = await axios(config)
			if (response.status === 200) {
				toast.success('Order Changed Successfully')
			}
		} catch (err) {
			console.log(err);
		}
	}

	const settingsData = async () => {
		try {
			const response = await axios.get(`/v1/settings?businessId=${businessId}`);
			setSettings(response.data);
			setCategoryOrder(response?.data[0]?.categoryOrder || []);
			return response.data[0]._id || '';
		} catch (err) {
			console.log(err);
		}
	};
	
	const saveCategoryOrder = async () => {
		setIsEditingSequence(false);
		await handleCategoryOrder(settings[0]?._id);
	};

	const { isLoading, error, data: catOrderedData } = useQuery({
		queryKey: ["settings", businessId],
		queryFn: settingsData,
		enabled:!!businessId
	})

	return (
		<div className="pb-[5rem]">
			<div className="masonry-layout px-6 mt-6 pb-[5rem]">
				{searchText === "" ? (
					Object.values(organizedCategories).length > 0 ? (
						Object.values(organizedCategories).map((parent, index) => (
							<div
								key={index.toString()}
								className="p-4 border border-[#000] rounded-md masonry-item"
								draggable={isEditingSequence}
								onDragStart={isEditingSequence ? (e) => { e.stopPropagation(); handleDragStart(parent._id, null); } : undefined}
								onDragOver={isEditingSequence ? handleDragOver : undefined}
								onDrop={isEditingSequence ? (e) => { e.stopPropagation(); handleDrop(parent._id, null); } : undefined}
								onDragEnd={isEditingSequence ? handleDragEnd : undefined}
								data-id={parent._id}
							>
								<div className={`${parent?.child.length > 0
									? "flex justify-between items-center pb-4"
									: "flex justify-between items-center"
									}`}>
									<div className="font-medium">{index+1}&#41;&nbsp;{parent?.parentName}</div>
									<div onClick={() => editCategory(parent?._id)} className="text-sm text-[#2F80ED] cursor-pointer">
										View
									</div>
								</div>
								{parent?.child.map((child) => (
									<div
										key={child._id}
										className="rounded-md p-2"
										draggable={isEditingSequence}
										onDragStart={isEditingSequence ? (e) => { e.stopPropagation(); handleDragStart(child._id, parent._id); } : undefined}
										onDragOver={isEditingSequence ? handleDragOver : undefined}
										onDrop={isEditingSequence ? (e) => { e.stopPropagation(); handleDrop(child._id, parent._id); } : undefined}
										onDragEnd={isEditingSequence ? handleDragEnd : undefined}
										data-id={child._id}
									>
										<CategoryCard
											category={child}
											onAddCategory={editCategory}
										/>
									</div>
								))}
							</div>
						))
					) : (
						<div className="fixed transform -translate-x-1/2 top-1/2 left-1/2 text-center flex flex-col">
							No Categories Found
						</div>
					)
				) : filterCategory.length > 0 ? (
					filterCategory.map((parent) => (
						<div
							key={parent?._id}
							className="p-4 border border-[#cacaca] mx-6 rounded-md"
						>
							<div className="flex justify-between items-center">
								<div className="font-medium">{parent?.name}</div>
								<div onClick={() => editCategory(parent._id)} className="text-sm text-[#2F80ED] cursor-pointer">
									View
								</div>
							</div>
						</div>
					))
				) : (
					<div className="fixed transform -translate-x-1/2 top-1/2 left-1/2 text-center flex flex-col">
						No Categories Found
					</div>
				)}
			</div>
			{!hide && (
				<div className="flex">
					<div onClick={handleAddCategoryClick} className="fixed bottom-0 w-1/2 p-4 bg-white outline-none cursor-pointer">
						<button className="bg-[#2B354D] w-full py-2 rounded-md text-white">
							Add Category
						</button>
					</div>
					<div className="fixed bottom-0 right-0 w-1/2 p-4 bg-white outline-none cursor-pointer">
						{isEditingSequence ? (
							<button
								className="bg-[#2B354D] w-full py-2 rounded-md text-white mt-2"
								onClick={saveCategoryOrder}
							>
								Save Order
							</button>
						) : (
							<button
								className="bg-[#2B354D] w-full py-2 rounded-md text-white"
								onClick={() => setIsEditingSequence(!isEditingSequence)}
							>
								Edit Sequence
							</button>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

const CategoryCard = ({
	category,
	onAddCategory,
}: {
	category: ICategory;
	onAddCategory: (str: string) => void;
}) => {
	return (
		<div
			key={category?._id}
			className="relative border border-[#CACACA] p-4 rounded-md"
		>
			<div className="font-medium opacity-70 truncate w-72">{category.name}</div>
			<div
				onClick={() => onAddCategory(category?._id)}
				className="absolute right-4 bottom-4 text-sm text-[#2F80ED] cursor-pointer"
			>
				View
			</div>
		</div>
	);
};

export default memo(CategoriesContent);
