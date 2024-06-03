import Header from "@/components/molecules/header";
import type React from "react";
import { memo, startTransition, useRef, useState } from "react";
import { BsChevronLeft } from "react-icons/bs";
import Hi from "@/assets/svg/hi.svg";
import { MdDinnerDining } from "react-icons/md";
import Switch from "react-switch";
import PopUp from "@/components/atom/popUp";
import axios from "@/axios";
import type { Dish, ICategory } from "@/components/types/businessData";
import {
	type Hierarchy,
	useDishSelectionStore,
} from "@/components/store/useDishStore";
import DishComponent from "@/components/atom/dish";
import HierarchyComponent from "@/components/molecules/hierarchy";
import { HiX } from "react-icons/hi";
import { storeImageAfterSave } from "@/components/utils/helper";
import { toast } from "react-toastify";
import { useSelectedButtonStore } from "@/components/store/useSelectBtn";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/components/errorComponent";
import ReactCropper, { cropImage } from "@/components/atom/reactCropper";
import { useNavigate, useParams } from "react-router-dom";

interface IData {
	dishes: Dish[];
	category: ICategory;
	allCategories: ICategory[];
}

const EditCategory: React.FC = memo(() => {
	const navigate = useNavigate();
	const { businessId, categoryId } = useParams<{
		businessId: string;
		categoryId: string;
	}>();
	const [data, setData] = useState<IData | null>(null);

	const setSelectedButton = useSelectedButtonStore((s) => s.setSelectedButton);
	const [isHierarchyModalOpen, setIsHierarchyModalOpen] = useState(false);
	const [isDishModalOpen, setIsDishModalOpen] = useState(false);
	const [imageFile, setImageFiles] = useState<File | null>(null);
	const [showCropper, setShowCropper] = useState(false);
	const [croppingImage, setCroppingImage] = useState<string | null>(null);
	const cropperRef = useRef(null);
	let { parentCategory, parentCategoryId } = useDishSelectionStore();
	const [loading, setLoading] = useState(false);
	const {
		selectedDishes,
		hierarchy,
		addDish,
		removeDish,
		visibility,
		availability,
		setVisibility,
		setAvailability,
		categoryName,
		setCategoryName,
		setHierarchy,
		setSelectedDishes,
		imageUrl,
		setImageUrl,
		setParentCategory,
		setParentCategoryId,
	} = useDishSelectionStore();

	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.readAsDataURL(file);

			reader.onloadend = () => {
				setCroppingImage(reader.result as string);
				setShowCropper(true);
			};

			setImageFiles(file);
		}
	};

	const handleCrop = async () => {
		const cropper = cropperRef?.current;
		if (cropper) {
			const coordinates = cropper?.getCoordinates();
			if (coordinates) {
				try {
					const croppedDataUrl = await cropImage(croppingImage, coordinates);
					if (typeof croppedDataUrl === "string") {
						const blob = await (await fetch(croppedDataUrl)).blob();
						const croppedFile = new File([blob], imageFile?.name, { type: "image/png" });

						const reader = new FileReader();
						reader.onloadend = () => {
							setImageUrl(reader.result as string);
							setImageFiles(croppedFile);
							setShowCropper(false);
						};
						reader.readAsDataURL(croppedFile);
					}
				} catch (err) {
					console.error(err);
				}
			}
		}
	};

	const toggleDishSelection = (dish: Dish) => {
		if (selectedDishes.some((selectedDish) => selectedDish.id === dish.id)) {
			removeDish(dish.id);
		} else {
			addDish(dish);
		}
	};
	const resetAndCloseDishModal = () => {
		if (data) {
			useDishSelectionStore.setState({
				selectedDishes: [...data.category.dishes],
			});
			setIsDishModalOpen(false);
		}
	};
	const handleToggleAvailability = () => setAvailability(!availability);
	const handleToggleVisibility = () => setVisibility(!visibility);

	const handleSave = async () => {
		if (categoryName.trim() === "" || categoryName.length < 2) {
			toast.error("Please enter category name");
			return;
		}
		if (!hierarchy) {
			toast.error("Please select hierarchy");
			setIsHierarchyModalOpen(true);
			return;
		}
		if (hierarchy === "PARENT") {
			parentCategory = "";
			parentCategoryId = "";
		}

		let coverImage: string = imageUrl ?? "";
		if (imageFile) {
			const uploadedImageUrl = await storeImageAfterSave(imageFile);
			coverImage = uploadedImageUrl ?? "";
		}
		setLoading(true)

		const payload = {
			businessId: businessId,
			name: categoryName,
			visibility: visibility,
			timerOn: false,
			timerStart: null,
			timerEnd: null,
			availableDays: [],
			hierarchy: hierarchy,
			parentCategory: parentCategory,
			parentCategoryId: parentCategoryId,
			coverImage: coverImage,
			links: [],
			dishes: selectedDishes,
			availability: availability,
			charges: [],
		};

		try {
			await axios.put(
				`/v1/categories/${data?.category?.id}`,
				payload,
			);
			toast.success("Category updated successfully");
			startTransition(()=>{
				navigate(`/app/business/${businessId}/items?tab=items`);
			})
		} catch (error) {
			console.error("Error updating category:", error);
		}
		setLoading(false)
	};
	const deleteCategory = async () => {
		setLoading(true)
		try {
			const config = {
				method: "DELETE",
				url: `/v1/categories/${data?.category?.id}`,
			};
			await axios(config);
			toast.success("Category deleted successfully");
			setSelectedButton("Categories");
			startTransition(()=>{
				navigate(`/app/business/${businessId}?tab=items`);
			})
		} catch (error) {
			console.error("Error deleting category:", error);
		}
		setLoading(false)
	};

	const editCategory = async () => {
		try {
			const category = await axios.get<ICategory>(
				`/v1/categories/${categoryId}`,
			);
			const allCategories = await axios.get(
				`/v1/categories?businessId=${businessId}&queryCategories=true`,
			);
			const dishes = await axios.get(
				`/v1/dishes?businessId=${businessId}&queryDish=true`,
			)

			const data = {
				dishes: dishes?.data,
				category: category.data,
				allCategories: allCategories.data,
			};
			setData(data);
			setSelectedDishes(data.category.dishes);
			setCategoryName(data.category.name);
			setHierarchy(data.category.hierarchy as Hierarchy);
			setImageUrl(data.category.coverImage);
			setVisibility(data.category.visibility);
			setAvailability(data.category.availability);
			if (data?.category?.hierarchy === "CHILD") {
				setParentCategoryId(data.category.parentCategoryId)
				setParentCategory(data.category.parentCategory)
			}

			return data;
		} catch (error) {
			console.error("Error fetching dishes:", error);
		}
	};

	const { isLoading, error, data: ediCatData, refetch } = useQuery({
		queryKey: ['editCategory', businessId, categoryId],
		queryFn: editCategory,
		enabled: !!categoryId && !!businessId,
	})

	const handleBack = () =>{
		startTransition(()=>{
			navigate(`/app/business/${businessId}/items?tab=items`)
		})
	}

	if (error) return <ErrorComponent refetch={refetch} />

	return (
		<div className="pb-[7rem]">
			{" "}
			<div className="bg-[#f5f5f5] sticky z-20 top-0">
				<Header
					title="Category"
					onBack={handleBack}
					leftIcon={<BsChevronLeft />}
					centerImage={Hi}
					rightImage={Hi}
					isIconBusinessShow={false}
				/>
				<div className="flex justify-between items-center mt-6 px-6 pb-4 border-b border-[#cacaca]">
					<div className="flex text-2xl">
						<span className="">Edit a Category</span>
					</div>
				</div>
			</div>
			<div className="mt-4 ml-6 text-xl font-medium capitalize">
				{data?.category?.name}
			</div>
			<div className="relative w-full px-6 mt-4">
				<input
					onChange={(e) => {
						setCategoryName(e.target.value);
					}}
					type="text"
					maxLength={24}
					value={categoryName || ""}
					id="floating_outlined"
					className="block w-full pt-1 pb-2 pl-4 pr-[7rem] mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border-gray-800 rounded-md border dark:text-white focus:outline-none focus:ring-0 focus:border-[#2B354D] dark:border-[#2B354D] peer"
					placeholder={categoryName}
					required
				/>
			</div>
			<div className=" m-6 p-4 border border-[#cacaca] rounded-md">
				<div className="flex items-center justify-between">
					<span>Hierarchy</span>{" "}
					<button
						type="button"
						onClick={() => setIsHierarchyModalOpen(true)}
						className="px-3 py-1 text-sm on_active_bounce capitalize border border-[#2B354D] rounded-md"
					>
						Edit
					</button>
				</div>
				{hierarchy && (
					<div className="border border-[#cacaca] text-sm px-2 py-1 rounded-md mt-2">
						{hierarchy === "CHILD" ? (
							<>
								<strong>{hierarchy.toLowerCase()}</strong> is a child category of{" "}
								<strong>{parentCategory}</strong>
							</>
						) : (
							<>
								<strong>{categoryName}</strong> is a{" "}
								<strong>{hierarchy.toLowerCase()}</strong> category
							</>
						)}
					</div>
				)}
			</div>
			{isHierarchyModalOpen && (
				<PopUp
					show={isHierarchyModalOpen}
					onClose={() => setIsHierarchyModalOpen(false)}
				>
					<HierarchyComponent
						show={() => setIsHierarchyModalOpen(true)}
						closeModal={() => setIsHierarchyModalOpen(false)}
						allCategories={data?.allCategories || []}
					/>
				</PopUp>
			)}
			<div className="mx-6 my-6 border border-[#cacaca] px-4 pb-4 pt-2 rounded-md">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl">Dishes</h1>
					<button
						type="button"
						onClick={() => setIsDishModalOpen(true)}
						className="px-3 py-1 text-sm on_active_bounce capitalize border border-[#2B354D] rounded-md"
					>
						Edit
					</button>
				</div>
				{isDishModalOpen && (
					<PopUp
						show={isDishModalOpen}
						onClose={() => setIsDishModalOpen(false)}
					>
						<DishComponent
							dishes={data?.dishes || []}
							selectedDishes={selectedDishes}
							toggleDishSelection={toggleDishSelection}
							onClose={() => setIsDishModalOpen(false)}
							resetAndCloseDishModal={resetAndCloseDishModal}
						/>
					</PopUp>
				)}

				<div className="grid gap-4 pb-6 mt-4 grid-col-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{selectedDishes?.map((dish) => (
						<div
							key={dish?.id}
							className="relative flex items-center border rounded-md border-[#cacaca]"
						>
							<div className="flex items-center pb-8 mt-2 ml-2 rounded-md">
								<MdDinnerDining className="mr-2" />
								{dish?.name}
							</div>
							<button
								type="button"
								className="absolute text-blue-500 rounded-md bottom-2 on_active_bounce right-4"
								onClick={() => removeDish(dish?.id)}
							>
								Remove
							</button>
						</div>
					))}
				</div>
			</div>
			<div className="mx-6 mt-6 border border-[#cacaca] px-4 pt-2 rounded-md pb-4">
				<h1 className="pb-2 text-2xl">Display</h1>
				{imageUrl && (
					<div className="relative w-1/2 aspect-square w-[250px] h-[250px]">
						{" "}
						<img
							src={imageUrl}
							alt="Selected"
							className="rounded-xl object-cover"
							loading="lazy"
						/>
						<button
							type="button"
							onClick={() => setImageUrl("")}
							className="absolute top-2 right-2 bg-[#cacaca] text-black p-1 rounded-full"
						>
							<HiX className="w-4 h-4" />
						</button>
					</div>
				)}
				{!imageUrl && (
					<div className="pb-4 mt-2 space-y-4">
						<div
							className="flex justify-center w-1/2 items-center border border-[#cacaca] rounded-md p-8 mt-4"
							onClick={handleClick}
						>
							<span className="text-2xl">+</span>
						</div>
						<input
							type="file"
							ref={fileInputRef}
							style={{ display: "none" }}
							accept=".png, .jpeg, .jpg, .webp"
							onChange={handleImageChange}
						/>
					</div>
				)}
				<div className="space-y-4 p-2 border border-[#cacaca] rounded-md mt-2">
					<div className="flex items-center justify-between">
						<span>Availability off</span>
						<Switch
							uncheckedIcon={false}
							checkedIcon={false}
							onChange={handleToggleAvailability}
							checked={availability}
							offColor="#CACACA"
						/>
					</div>

					<div className="flex items-center justify-between">
						<span>Visibility off</span>
						<Switch
							uncheckedIcon={false}
							checkedIcon={false}
							onChange={handleToggleVisibility}
							checked={visibility}
							offColor="#CACACA"
						/>
					</div>
				</div>
			</div>
			<div className="fixed flex items-center justify-between w-full px-6 bottom-6">
				<button
					type="button"
					onClick={deleteCategory}
					className={`${loading ? 'pointer-events-none opacity-50' : ''} text-[#2B354D] on_active_bounce capitalize w-[40%] py-[0.4125rem] rounded-md border border-[#2B354D] bg-white`}
				>
					{loading ? 'Loading....' : 'Delete'}
				</button>
				<button
					type="button"
					onClick={handleSave}
					className={`${loading ? 'pointer-events-none opacity-50' : ''} bg-[#2B354D] on_active_bounce w-[55%] capitalize py-2 rounded-md text-white`}
				>
					{loading ? 'Loading....' : 'Save'}
				</button>
			</div>
			{(loading || isLoading) && <LoadingSpinner />}
			<PopUp show={showCropper} onClose={() => setShowCropper(false)}>
				<div>
					<ReactCropper
						image={croppingImage}
						ref={cropperRef}
						width={250}
						height={250}
					/>
					<div className="flex py-2 bg-white">
						<button
							type="button"
							className="fixed bottom-5 on_active_bounce mx-4 text-white rounded-md bg-[#2B354D] py-2.5 w-[25rem]"
							onClick={handleCrop}
						>
							Save & Close
						</button>
					</div>
				</div>
			</PopUp>
		</div>
	);
});

export default EditCategory
