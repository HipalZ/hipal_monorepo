import { useDishSelectionStore } from "@/components/store/useDishStore";
import type { ICategory } from "@/components/types/businessData";
import {
	PAGE_TYPES,
	routePathsWithId,
	routePathsWithIds,
} from "@/components/utils/routes";
import axios from "@/axios";
import { memo, startTransition, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useSettingsData } from "@/components/store/useSettingsData";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

const CategoriesContent = memo(({
	categories,
	hide,
	searchText,
}: {
	categories: ICategory[];
	hide: boolean;
	searchText: string;
}) => {
	const { businessId } = useParams<{ businessId: string }>();
	const navigate = useNavigate()
	const { resetStore } = useDishSelectionStore();
	const settings = useSettingsData((s) => s.settingsData)
	const setSettings = useSettingsData((s) => s.setSettingsData)
	const [categoryOrder, setCategoryOrder] = useState<string[]>([]);

	const handleAddCategoryClick = () => {
		resetStore();
		startTransition(()=>{
			navigate(routePathsWithId[PAGE_TYPES.CREATE](businessId || ''));
		})
	};

	const [categoryIDs, setCategoryIDs] = useState<string[]>([]);
	const [isEditingSequence, setIsEditingSequence] = useState<boolean>(false);
	const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
	const [draggedParentId, setDraggedParentId] = useState<string | null>(null);

	useEffect(() => {
		const ids = categories.map((category) => category.id);
		setCategoryIDs(ids);
	}, [categories]);

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		if (params.get('tab') !== 'Categories') {
			params.set('tab', 'Categories');
			startTransition(()=>{
				navigate({ search: params.toString() }, { replace: true });
			})
		}
	}, [location, navigate]);

	const organizeCategories = (categories) => {
		const obj = {};
	
		// Use categoryOrder to organize categories
		const orderedCategories = categoryOrder.length ? categoryOrder : categoryIDs;
	
		for (let index = 0; index < orderedCategories?.length; index++) {
			const categoryId = orderedCategories[index];
			const category = categories.find((cat) => cat.id === categoryId);
	
			if (category.hierarchy === "PARENT") {
				if (!obj[category.id]) {
					obj[category.id] = {
						parentName: category.name,
						id: category.id,
						child: [],
					};
				}
			}
			if (category.hierarchy === "CHILD") {
				if (obj[category.parentCategoryId]) {
					obj[category.parentCategoryId].child.push({
						name: category.name,
						id: category.id,
					});
				}
			}
		}
	
		for (let index = 0; index < categories?.length; index++) {
			const category = categories[index];
			if (orderedCategories.includes(category.id)) {
				continue;
			}
			if (category.hierarchy === "PARENT") {
				if (!obj[category.id]) {
					obj[category.id] = {
						parentName: category.name,
						id: category.id,
						child: [],
					};
				}
			}
			if (category.hierarchy === "CHILD") {
				if (obj[category.parentCategoryId]) {
					obj[category.parentCategoryId].child.push({
						name: category.name,
						id: category.id,
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
		startTransition(()=>{
			navigate(
				routePathsWithIds[PAGE_TYPES.EDIT_CATEGORY](businessId || '', create),
			);
		})
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

	const handleDragOver = (event:Event) => {
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
				const updatedCategories = [...prevCategoryOrder];
				const allCategoryIds = categories.map(cat => cat.id);
	
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
						const parentCategory = categories.find(cat => cat.id === draggedParentId);
						if (parentCategory) {
							const parentChildIds = updatedCategories.filter(id => {
								const cat = categories.find(cat => cat.id === id);
								return cat && cat.parentCategoryId === draggedParentId;
							});
							// const start = updatedCategories.indexOf(parentChildIds[0]);
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
				console.log('up', updatedCategories);
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
			setCategoryOrder(response.data[0].categoryOrder || []);
			return response.data[0].id;
		} catch (err) {
			console.log(err);
		}
	};
	
	const saveCategoryOrder = async () => {
		setIsEditingSequence(false);
		await handleCategoryOrder(settings[0]?.id);
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
								onDragStart={isEditingSequence ? (e) => { e.stopPropagation(); handleDragStart(parent.id, null); } : undefined}
								onDragOver={isEditingSequence ? handleDragOver : undefined}
								onDrop={isEditingSequence ? (e) => { e.stopPropagation(); handleDrop(parent.id, null); } : undefined}
								onDragEnd={isEditingSequence ? handleDragEnd : undefined}
								data-id={parent.id}
							>
								<div className={`${parent?.child.length > 0
									? "flex justify-between items-center pb-4"
									: "flex justify-between items-center"
									}`}>
									<div className="font-medium">{index+1}&#41;&nbsp;{parent?.parentName}</div>
									<div onClick={() => editCategory(parent?.id)} className="text-sm text-[#2F80ED] cursor-pointer">
										View
									</div>
								</div>
								{parent?.child.map((child) => (
									<div
										key={child.id}
										className="rounded-md p-2"
										draggable={isEditingSequence}
										onDragStart={isEditingSequence ? (e) => { e.stopPropagation(); handleDragStart(child.id, parent.id); } : undefined}
										onDragOver={isEditingSequence ? handleDragOver : undefined}
										onDrop={isEditingSequence ? (e) => { e.stopPropagation(); handleDrop(child.id, parent.id); } : undefined}
										onDragEnd={isEditingSequence ? handleDragEnd : undefined}
										data-id={child.id}
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
							key={parent?.id}
							className="p-4 border border-[#cacaca] mx-6 rounded-md"
						>
							<div className="flex justify-between items-center">
								<div className="font-medium">{parent?.name}</div>
								<div onClick={() => editCategory(parent.id)} className="text-sm text-[#2F80ED] cursor-pointer">
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
});

const CategoryCard = memo(({
	category,
	onAddCategory,
}: {
	category: ICategory;
	onAddCategory: (str: string) => void;
}) => {
	return (
		<div
			key={category.id}
			className="relative border border-[#CACACA] p-4 rounded-md"
		>
			<div className="font-medium opacity-70 truncate w-72">{category.name}</div>
			<div
				onClick={() => onAddCategory(category.id)}
				className="absolute right-4 bottom-4 text-sm text-[#2F80ED] cursor-pointer"
			>
				View
			</div>
		</div>
	);
});

export default CategoriesContent
