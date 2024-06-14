import type React from "react";
import { useState, useEffect, useCallback, memo } from "react";
import { toast } from "react-toastify";
import { ICartVariant, useCart } from "@/components/store/useCart";
import { useTable } from "@/components/store/useTable";
import { useLogin } from "@/components/store/useLogin";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import ChildCategory from "../category/childCategory";
import MenuPopup from "@/components/molecules/menuPopup";
import ParentCategory from "../category/parentCategory";
import DayOutPopup from "@/components/atoms/dayoutPopup";
import InstructionInput from "@/components/atoms/instruction";
import InstructionItem from "@/components/atoms/instructionItem";
import FoodType, { type FOOD_TYPES } from "@/components/atoms/foodType";
import {
	addInstruction,
	deleteInstruction,
} from "@/components/utils/helpers";
import { MdOutlineKeyboardArrowUp, MdOutlineWidgets } from "react-icons/md";
import { HiOutlineClipboardList, HiX } from "react-icons/hi";
import { RiShoppingBagLine } from "react-icons/ri";
import { useBusinessStore } from "@/components/store/useBusinessData";
import type { ICategories, IDish } from "@/components/types/hiTableData";
import NewDishMenu from "@/components/molecules/newDishMenu";
import { useSearch } from "@/components/store/useSearch";
import LoaderComponent from "@/components/atoms/coolLoader";
import { useNavigate,useParams } from "react-router-dom";
import axios from "@/components/utils/axios";

interface POSProps {
	activeButton: string;
	data: any;
	search: string;
}

const POSComponent = ({ activeButton, data, search }:POSProps):JSX.Element => {
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [menuModal, setMenuMOdal] = useState<boolean>(false);
	const cart = useCart((s) => s.cart);
	const setCart = useCart((s) => s.setCart);
	const clearCartForTable = useCart((s) => s.clearCartForTable);
	const deleteItem = useCart((s) => s.deleteItem);
	const tableData = useTable((s) => s.tableData);
	const { userDetails } = useLogin();
	const [menu, setMenu] = useState("");
	const [instruction, setInstruction] = useState("");
	const [activeInputId, setActiveInputId] = useState<string>('');
	const [searchDishes, setSearchDishes] = useState<IDish[]>([]);
	const { searchHistory, setSearchHistory, isFocused } = useSearch();
	const businessData = useBusinessStore((s) => s.businessData);
	const navigate = useNavigate()
	const [isSending, setIsSending] = useState(false);
	const params = useParams<{
		businessId: string;
		zoneId: string;
		tableId: string;
	}>();
	const { businessId, zoneId, tableId } = params;
	const filteredCartItems = cart[tableId || ''] ? Object.values(cart[tableId || '']) : [];

	const menuOpenModal = (str: string) => {
		setMenu(str);
		if (str === "liveCart") {
			setIsModalOpen(true);
		}
		if (str === "menubtn") {
			setMenuMOdal(true);
		}
	};

	const closeModal = () => {
		setIsModalOpen(false);
	};
	const closeMenuModal = () => {
		setMenuMOdal(false);
	};

	const childCategories = data?.categories ?? [];

	const organizeCategories = useCallback((categories:ICategories[]) => {
		const parentChildrenMap = {};
		const parentDetailsMap = {};

		categories.map((category) => {
			if (category.hierarchy === "PARENT") {
				parentDetailsMap[category._id] = {
					name: category.name,
					parentId: category._id,
				};
			}
		});

		categories.map((category) => {
			if (category.hierarchy === "CHILD") {
				const { parentCategoryId, parentCategory } = category;
				if (!parentChildrenMap[parentCategoryId]) {
					parentChildrenMap[parentCategoryId] = {
						parentId: parentCategoryId,
						parentName: parentDetailsMap[parentCategoryId]
							? parentDetailsMap[parentCategoryId].name
							: parentCategory,
						children: [],
					};
				}
				parentChildrenMap[parentCategoryId].children.push({
					name: category.name,
					id: category._id,
				});
			}
		});

		return Object.values(parentChildrenMap);
	}, []);

	const organizedData = organizeCategories(childCategories);
	
	const getDishPrice = (
		dishData: IDish,
		selectedPortion: any,
		selectedExtras: any,
	) => {
		let price = 0;
		if (selectedPortion === undefined) {
			price += dishData?.price;
		}
		// Add portion price
		const portion = dishData?.portions.find(
			(portion) => portion?.name === selectedPortion,
		);
		if (portion) {
			price += Number.parseFloat(portion.price);
		}
		// Add extra prices
		selectedExtras.map((extra: any) => {
			price += extra?.price * extra?.quantity;
		});
		return price?.toFixed(2);
	};

	const handleDeleteItem = (
		tableId: string,
		dishId: string,
		variantId: string,
	) => {
		const tableCart = { ...cart[tableId] };

		const dishItem = tableCart[dishId];
		if (dishItem) {
			const filteredVariants = dishItem.variants.filter(
				(variant:ICartVariant) => variant._id !== variantId,
			);

			if (filteredVariants.length > 0) {
				const updatedDishItem = { ...dishItem, variants: filteredVariants };
				setCart(tableId, dishId, updatedDishItem);
			} else {
				deleteItem(tableId, dishId);
			}
		}
	};

	const sendCart = async () => {
		setIsSending(true);
		const time = new Date().toLocaleTimeString("it-IT");
	
		try {
			const config = {
				method: "post",
				url: "/v1/kitchens/:id/waiter/kots",
				data: {
					businessId: businessId,
					zoneId: zoneId,
					tableId: tableId,
					tableName: tableData?.name,
					waiterName: userDetails?.name,
					waiterPhone: userDetails.phoneNumber,
					timeWithSeconds: time,
					cart: cart[tableId],
				},
			};
			const res = await axios(config);
			if (businessData?.kotPrinter) {
				const config = {
					method: "POST",
					url: "https://ws.hipal.life",
					data: {
						businessId: businessId,
						payload: {
							tableName: tableData?.name,
							cart: cart[tableId],
							waiterName: userDetails?.name,
						},
					},
				};
				axios(config);
			}

			if (res.data.status) {
				closeModal();
				toast(`order placed successfully for ${tableData.name}`);
				clearCartForTable(tableId);
				navigate(routePaths[PAGE_TYPES.TABLES](businessId, zoneId));
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsSending(false);
		}
	};

	useEffect(() => {
		const tableCart = cart[tableId] || {};
		const isTableCartEmpty =
			Object.values(tableCart).filter((ele) => ele).length === 0;
		if (isTableCartEmpty) {
			closeModal();
		}
	}, [cart, tableId, closeModal]);

	useEffect(() => {
		const newSearchDishes: IDish[] = [];
		const dishIds = new Set<string>();

		if (search) {
			for (const category of childCategories) {
				for (const dish of category?.dishes) {
					const dishLower = dish?.name?.toLowerCase();
					if (
						dishLower.includes(search.toLowerCase()) &&
						!dishIds.has(dish?._id)
					) {
						const dishWithParent = {
							...dish,
							parentCategoryName: category.parentCategory
								? category.parentCategory
								: category.name,
						};
						newSearchDishes.push(dishWithParent);
						dishIds.add(dish?._id);
					}
				}
			}
			setSearchDishes(newSearchDishes);
			for (const dish of newSearchDishes) {
				if (!searchHistory.some((historyDish) => historyDish._id === dish._id)) {
					setSearchHistory(dish);
				}
			}
		}
	}, [search, childCategories]);

	return (
		<div>
			{activeButton.toLowerCase() === "pos" && (
				<div>
					{search.length > 0 ? (
						<NewDishMenu category={searchDishes} show={true} />
					) : isFocused && search?.length === 0 ? (
						<>
							<NewDishMenu category={searchHistory} show={true} />
						</>
					) : (
						<ChildCategory childCategories={childCategories} show={false} />
					)}
					<div
						className={`${
							Object.keys(cart).length === 0 ? "bottom-6" : "bottom-[5rem]"
						} bg-primary fixed z-1000 left-1/2 transition-all duration-500 transform -translate-x-1/2 text-base-100 flex items-center justify-center py-2 px-6 rounded-2xl`}
					>
						<MdOutlineWidgets className="mr-2 text-2xl" />
						<div
							onKeyDown={() => menuOpenModal("menubtn")}
							onClick={() => menuOpenModal("menubtn")}
							className="text-lg font-medium"
						>
							Menu
						</div>
					</div>

					{menu === "menubtn" && (
						<>
							<MenuPopup show={menuModal} onClose={closeMenuModal}>
								<div className="relative min-h-[50vh]">
									<div className="fixed top-0 left-0 right-0 px-4 py-2 mt-2 ml-2 font-medium capitalize text-base-content">
										Category
									</div>
									<div className="absolute right-0 p-1 mt-2 mr-2 rounded-full bg-base-100">
										<HiX
											className="text-2xl text-primary"
											onClick={closeMenuModal}
										/>
									</div>
									<div className="absolute inset-0 pb-4 overflow-y-auto top-12 max-h-[30rem] hide-scrollbar">
										<ParentCategory
											closeModal={closeMenuModal}
											parentCategory={organizedData}
										/>
									</div>
								</div>
							</MenuPopup>
						</>
					)}

					{menu.toLowerCase() === "livecart" && (
						<DayOutPopup show={isModalOpen} onClose={closeModal}>
							<div className="relative max-h-[80vh] overflow-y-auto">
								<div className="fixed top-0 left-0 right-0 z-10 px-4 py-4 font-medium capitalize border-b bg-base-100 rounded-t-2xl text-base-content">
									{tableData?.name}
								</div>
								{isSending ? (
									<div className="flex items-start justify-center h-[60vh]">
										<LoaderComponent />
									</div>
								) : (
									<div className="pb-[7rem] px-6 overflow-y-auto hide-scrollbar pt-16">
										{filteredCartItems
											.filter((ele) => ele)
											.map((cartItem, index) => {
												const { dishData, variants } = cartItem;
												const name = dishData?.name;
												return variants?.map((variant, variantIndex) => {
													const { portion, extra, id } = variant;
													const selectedPortion = portion?.name;
													const selectedExtra = extra
														? Object.values(extra)?.filter(
																(item: any) => item?.quantity > 0,
															)
														: [];
													return (
														<div
															key={`${dishData?._id}-${index}-${variantIndex}`}
														>
															<div className="relative flex justify-between mt-4">
																<div className="mr-4">
																	{dishData?.dishType && (
																		<FoodType
																			type={dishData?.dishType as FOOD_TYPES}
																		/>
																	)}
																</div>
																<div className="w-[70%] -ml-12">
																	<div className="font-medium text-base-content">
																		{name?.length && name.length < 35
																			? name
																			: name?.slice(0, 35) + "..."}
																	</div>

																	<div className="mt-1 font-medium text-base-content/50">
																		<div>{selectedPortion}</div>
																		<div>
																			{selectedExtra.map(
																				(extraItem: any, extraIndex) => (
																					<div
																						key={`${dishData?._id}-${index}-${variantIndex}-${extraIndex}`}
																					>
																						<span className="mr-2 text-sm">
																							{extraItem?.quantity}
																						</span>
																						x
																						<span className="ml-2 text-sm">
																							{extraItem?.name}
																						</span>
																					</div>
																				),
																			)}
																		</div>
																	</div>

																	<div className="flex justify-between">
																		<div className="mt-4 font-medium text-base-content/50">
																			₹
																			{getDishPrice(
																				dishData,
																				selectedPortion,
																				selectedExtra,
																			)}
																		</div>
																		<button
																			type="button"
																			onClick={() =>
																				handleDeleteItem(
																					tableId,
																					dishData?._id,
																					id,
																				)
																			}
																			className="text-primary rounded-2xl on_active_bounce border border-primary px-6 py-2 bg-base-100 mt-1 -mr-[6rem] font-medium"
																		>
																			Delete
																		</button>
																	</div>
																</div>
																<div className="mr-4 font-medium text-right text-base-content/">
																	x 1
																</div>
															</div>
															{activeInputId === id ? (
																<InstructionInput
																	instruction={instruction}
																	setInstruction={setInstruction}
																	activeInputId={activeInputId}
																	addInstruction={addInstruction}
																	cart={cart}
																	dishId={dishData?._id}
																	variantId={id}
																	tableId={tableId}
																/>
															) : (
																<>
																	{!variant?.instruction && (
																		<div
																			onClick={() => setActiveInputId(id)}
																			className="flex mt-4 -ml-1 text-orange-600"
																		>
																			<HiOutlineClipboardList className="text-2xl" />{" "}
																			Cooking Instruction
																		</div>
																	)}

																	{variant?.instruction && (
																		<InstructionItem
																			deleteInstruction={deleteInstruction}
																			setActiveInputId={setActiveInputId}
																			variant={variant}
																			cart={cart}
																			dishId={dishData?._id}
																			variantId={id}
																			tableId={tableId}
																		/>
																	)}
																</>
															)}
															<div className="mt-6 border border-dashed" />
														</div>
													);
												});
											})}
									</div>
								)}
							</div>
							<div className="pb-4 pt-4 fixed w-full h-[4rem] bottom-0 bg-primary">
								<div className="mx-[3rem] flex justify-between">
									<button
										type="button"
										onClick={closeModal}
										className="absolute flex px-4 py-2 mr-2 text-sm rounded-full text-base-100 bg-primary bottom-3 left-6"
									>
										<RiShoppingBagLine className="mt-[0.125rem] mr-2 -ml-4 " />
										Items Added
										<MdOutlineKeyboardArrowUp className="ml-3 text-xl" />
									</button>

									<button
										type="button"
										onClick={sendCart}
										disabled={isSending}
										className={`absolute on_active_bounce text-sm px-4 py-2 mr-2 font-medium text-primary bg-base-100 rounded-full right-6 bottom-3 ${
											isSending ? "opacity-50" : ""
										}`}
									>
										{isSending ? "Loading..." : "Continue"}
									</button>
								</div>
							</div>
						</DayOutPopup>
					)}

					<div
						onClick={() => menuOpenModal("liveCart")}
						className={`${
							activeButton.toLowerCase() === "pos" ? "" : "hidden"
						} ${
							filteredCartItems.filter((ele) => ele).length > 0 ? "" : "hidden"
						} fixed w-full h-[4rem] bottom-0 bg-primary`}
					>
						<button
							type="button"
							className="absolute flex px-4 py-2 mr-2 text-sm rounded-full text-base-100 bg-primary bottom-3 left-6"
						>
							<RiShoppingBagLine className="mt-[0.125rem] mr-2 -ml-4 " />
							Items Added
							<MdOutlineKeyboardArrowUp className="ml-3 text-xl" />
						</button>

						<button
							type="button"
							className="absolute px-4 py-2 mr-2 text-sm font-medium rounded-full text-primary bg-base-100 right-6 bottom-3"
						>
							Continue
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default memo(POSComponent);
