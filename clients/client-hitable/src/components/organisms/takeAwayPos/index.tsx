import type React from "react";
import { useEffect, useState } from "react";
import axios from "@/axios";
import { toast } from "react-toastify";
import { useCart } from "@/components/store/useCart";
import { useLogin } from "@/components/store/useLogin";
import { useRouter } from "next/router";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import ChildCategory from "../category/childCategory";
import MenuPopup from "@/components/molecules/menuPopup";
import ParentCategory from "../category/parentCategory";
import DayOutPopup from "@/components/atoms/dayoutPopup";
import InstructionInput from "@/components/atoms/instruction";
import InstructionItem from "@/components/atoms/instructionItem";
import FoodType, { type FOOD_TYPES } from "@/components/atoms/foodType";
import { addInstruction, deleteInstruction } from "@/components/utils/helpers";
import { MdOutlineKeyboardArrowUp, MdOutlineWidgets } from "react-icons/md";
import { HiOutlineClipboardList, HiX } from "react-icons/hi";
import { RiShoppingBagLine } from "react-icons/ri";
import SearchComponent from "@/components/molecules/searchPanel";
import { useBusinessStore } from "@/components/store/useBusinessData";
import type { IDish } from "@/components/types/hiTableData";
import NewDishMenu from "@/components/molecules/newDishMenu";
import Loader from "@/components/atoms/loader";

let tableId = "012345";

interface POSProps {
	activeButton: string;
	data: any;
	btnActive: boolean;
	selectDishId?: string;
}

const TakeAwayPos: React.FC<POSProps> = ({
	activeButton,
	data,
	btnActive,
	selectDishId,
}) => {
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const cart = useCart((s) => s.cart);
	const setCart = useCart((s) => s.setCart);
	const { userDetails, phoneNumber } = useLogin();
	const [menu, setMenu] = useState("");
	const [instruction, setInstruction] = useState("");
	const [activeInputId, setActiveInputId] = useState(null);
	const [search, setSearch] = useState("");
	const [searchOpen, setSearchOpen] = useState(false);
	const router = useRouter();
	const deleteItem = useCart((s) => s.deleteItem);
	const businessData = useBusinessStore((s) => s.businessData);
	const zoneName = useLogin((s) => s.zoneName);
	const clearCartForTable = useCart((s) => s.clearCartForTable);

	const [isSending, setIsSending] = useState(false);
	const { businessId, takeawayId, orderId } = router.query as {
		businessId: string;
		takeawayId: string;
		orderId: string;
	};
	const filteredCartItems = cart[tableId] ? Object.values(cart[tableId]) : [];

	const popOver = (search = "") => {
		if (search.length > 0) {
			if (!searchOpen) {
				setSearchOpen(true);
			}
		} else {
			setSearchOpen(false);
		}
	};

	const handleInputChange = (value) => {
		setSearch(value);
		popOver(value);
	};

	const menuOpenModal = (str: string) => {
		setMenu(str);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
	};

	const childCategories = data?.categories ?? [];

	const parentCategories = Object.values(data?.allCategoriesTypes?.main ?? {});

	parentCategories.forEach((parent: any) => {
		const childCategories = Object.values(
			data?.allCategoriesTypes?.sub[parent.id] ?? {},
		);
		parent.childCate = childCategories;
	});

	const getDishPrice = (
		dishData: any,
		selectedPortion: any,
		selectedExtras: any,
	) => {
		let price = 0;
		if (selectedPortion === undefined) {
			price += parseFloat(dishData?.price);
		}
		// Add portion price
		const portion = dishData?.portions.find(
			(portion) => portion?.name === selectedPortion,
		);
		if (portion) {
			price += parseFloat(portion.price);
		}
		// Add extra prices
		selectedExtras.map((extra: any, i: any) => {
			price += extra?.price * extra?.quantity;
		});
		return price?.toFixed(2);
	};

	const handleDeleteItem = (
		tableId: string,
		dishId: string,
		variantId: string,
	) => {
		let tableCart = { ...cart[tableId] };

		const dishItem = tableCart[dishId];
		if (dishItem) {
			const filteredVariants = dishItem.variants.filter(
				(variant) => variant.id !== variantId,
			);

			if (filteredVariants.length > 0) {
				const updatedDishItem = { ...dishItem, variants: filteredVariants };
				setCart(tableId, dishId, updatedDishItem);
			} else {
				deleteItem(tableId, dishId);
			}
		}
	};

	useEffect(() => {
		const tableCart = cart["012345"] || {};
		const isTableCartEmpty =
			Object.values(tableCart).filter((ele) => ele).length === 0;
		if (isTableCartEmpty) {
			closeModal();
		}
	}, [cart, tableId, closeModal]);

	const sendCart = async () => {
		if (isSending) {
			return;
		}
		setIsSending(true);
		try {
			const config = {
				method: "post",
				url: "/v1/kitchens/:kitchenId/swiggy",
				data: {
					businessId: businessId,
					zoneId: takeawayId,
					orderId: orderId,
					tableName: zoneName,
					waiterName: userDetails?.name,
					waiterPhone: phoneNumber,
					cart: cart[tableId],
					...(selectDishId && { deletedKotId: selectDishId }),
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
							tableName: zoneName,
							cart: cart[tableId],
							waiterName: userDetails?.name,
							orderId: orderId,
						},
					},
				};
				const response = axios(config);
			}

			if (res.status === 201) {
				closeModal();
				toast(`order placed sucessfully for ${zoneName}`);
				clearCartForTable(tableId);
				router.push(routePaths[PAGE_TYPES.TAKE_AWAY](businessId, takeawayId));
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsSending(false);
		}
	};
	const searchDishes: IDish[] = [];
	const dishIds = new Set<string>();

	if (search) {
		childCategories?.forEach((category) => {
			category?.dishes?.forEach((dish) => {
				const dishLower = dish?.name?.toLowerCase();
				if (
					dishLower.includes(search.toLowerCase()) &&
					!dishIds.has(dish?.id)
				) {
					const dishWithParent = {
						...dish,
						parentCategoryName: category.parentCategory
							? category.parentCategory
							: category.name,
					};
					searchDishes.push(dishWithParent);
					dishIds.add(dish?.id);
				}
			});
		});
	}

	return (
		<div>
			<div className="mx-6">
				<SearchComponent
					activeButton={activeButton}
					onSearch={(value) => handleInputChange(value)}
				/>
			</div>

			{activeButton.toLowerCase() === "pos" && (
				<div>
					{searchDishes?.length === 0 ? (
						<ChildCategory childCategories={childCategories} show={false} />
					) : (
						<div className="">
							<NewDishMenu category={searchDishes} show={true} />
						</div>
					)}

					<div
						onClick={() => menuOpenModal("menu")}
						className={`${
							Object.keys(cart).length === 0 ? "bottom-6" : "bottom-[5rem]"
						} bg-primary fixed  left-1/2 transition-all duration-500 transform -translate-x-1/2 text-base-100 flex items-center justify-center py-2 px-6 rounded-2xl`}
					>
						<MdOutlineWidgets className="mr-2 text-2xl " />
						<div className="text-lg font-[500]">Menu</div>
					</div>

					{menu.toLowerCase() == "menu" ? (
						<MenuPopup show={isModalOpen} onClose={closeModal}>
							<div className="relative min-h-[50vh]">
								<div className="fixed top-0 left-0 right-0 px-4 py-2 capitalize font-[500] ml-2 mt-2 text-base-content text-[1rem] leading-[1.25rem]">
									Category
								</div>
								<div className="absolute right-0 p-1 mt-3 mr-4 rounded-full bg-primary">
									<HiX
										className="text-2xl text-base-100"
										onClick={closeModal}
									/>
								</div>
								<div className="absolute inset-0 pb-4 overflow-y-auto top-12 max-h-[30rem] hide-scrollbar">
									<ParentCategory
										closeModal={closeModal}
										parentCategory={parentCategories}
									/>
								</div>
							</div>
						</MenuPopup>
					) : (
						<DayOutPopup show={isModalOpen} onClose={closeModal}>
							<div className="relative max-h-[80vh] overflow-y-auto">
								<div className="fixed top-0 bg-base-100 left-0 right-0 px-4 py-4 rounded-t-2xl border-b capitalize font-[500] text-base-content text-[1rem] leading-[1.25rem] z-10">
									{orderId}
								</div>
								{isSending ? (
									<Loader />
								) : (
									<div className="pb-[7rem] px-6 overflow-y-auto hide-scrollbar pt-16">
										{filteredCartItems
											.filter((ele) => ele)
											.map((cartItem, index) => {
												const { dishData, variants } = cartItem;
												const name = dishData?.name;
												return variants?.map((variant, variantIndex) => {
													const { portion, extra, id, quantity } = variant;
													const selectedPortion = portion?.name;
													const selectedExtra = extra
														? Object.values(extra)?.filter(
																(item: any) => item?.quantity > 0,
														  )
														: [];
													return (
														<div
															key={`${dishData?.id}-${index}-${variantIndex}`}
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
																						key={`${dishData?.id}-${index}-${variantIndex}-${extraIndex}`}
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
																					dishData?.id || "",
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
																	setActiveInputId={setActiveInputId}
																	addInstruction={addInstruction}
																	cart={cart}
																	dishId={dishData?.id}
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
																			dishId={dishData?.id}
																			variantId={id}
																			tableId={tableId}
																		/>
																	)}
																</>
															)}
															<div className="mt-6 border border-dashed"></div>
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
										className={`absolute on_active_bounce text-sm px-4 py-2 mr-2 font-[500] text-primary bg-base-100 rounded-full right-6 bottom-3 ${
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
							className="absolute text-sm px-4 py-2 mr-2 font-[500] text-primary bg-base-100 rounded-full right-6 bottom-3"
						>
							Continue
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default TakeAwayPos;
