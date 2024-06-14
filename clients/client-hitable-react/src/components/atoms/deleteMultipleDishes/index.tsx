import React, { memo, useRef, useState } from "react";
import { IStatus } from "@/components/types/hiTableData";
import DeleteItemComponent from "../deleteItem";
import DeleteConfirmationModal from "../deleteItemConfirmation";
import { useBusinessStore } from "@/components/store/useBusinessData";
import { toast } from "react-toastify";
import { useLogin } from "@/components/store/useLogin";
import { useParams } from "react-router-dom";
import axios from "@/components/utils/axios";

interface DeleteMultipleProps {
	statusData: IStatus[][];
	onClose: () => void;
	refetch: () => void;
}

export interface DeleteData {
	reasonForDelete: string;
	staffName: string;
	inventory: string;
	password: string;
	staffResponsible: string;
}

const DeleteMultipleDishes = ({
	statusData,
	onClose,
	refetch,
}:DeleteMultipleProps):JSX.Element => {
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [incorrectPassword, setIncorrectPassword] = useState<boolean>(true);
	const [step, setStep] = useState(0);
	const userDetails = useLogin((s) => s.userDetails);
	const businessData = useBusinessStore((s) => s.businessData);
	const [deleteData, setDeleteData] = useState<DeleteData>({
		reasonForDelete: "",
		staffName: "",
		inventory: "used",
		password: "",
		staffResponsible: "",
	});
	const deleteDataRef = useRef(deleteData);
	const handleUpdateDeleteData = (newValues: Partial<DeleteData>) => {
		deleteDataRef.current = deleteData;
		setDeleteData((prevValues) => ({
			...prevValues,
			...newValues,
		}));
	};
	const params = useParams<{
		businessId: string;
	
	}>();
	const { businessId} = params;

	const handleCheckboxChange = (id: string) => {
		setSelectedIds((prevSelectedIds) =>
			prevSelectedIds.includes(id)
				? prevSelectedIds.filter((selectedId) => selectedId !== id)
				: [...prevSelectedIds, id],
		);
	};

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(event.target.value);
	};

	const handleSelectAll = () => {
		const allIds = statusData
			.flat()
			.filter(
				(status) =>
					!status.isDeleted && status.dishStatus.toLowerCase() !== "delivered",
			)
			.map((status) => status._id);

		if (selectedIds.length === allIds.length) {
			setSelectedIds([]);
		} else {
			setSelectedIds(allIds);
		}
	};

	const handleSubmit = async () => {
		try {
			const response = await axios(`/v1/kitchens/:kotId/updateSingleKot`, {
				method: "PUT",
				data: {
					businessId: businessId,
					reasonForDelete: deleteData.reasonForDelete,
					staffName: deleteData.staffName,
					inventory: deleteData.inventory === "used",
					password: deleteData.password,
					isDeleted: true,
					deletedBy: userDetails?.name || deleteData.staffResponsible,
					deleteKotIds: selectedIds,
					kotPrinter: businessData?.kotPrinter,
				},
			});

			if (response.status === 200) {
				handleUpdateDeleteData({
					reasonForDelete: "",
					staffName: "",
					inventory: "used",
					password: "",
					staffResponsible: "",
				});
				onClose();
				refetch();
				// const data = response.data;

				// const getCart = getUpdatedCart(data, true);
				// if ( businessData?.kotPrinter) {
				// 	const config = {
				// 		method: "POST",
				// 		url: "https://ws.hipal.life",
				// 		data: {
				// 			businessId: businessId,
				// 			payload: {
				// 				tableName: data.tableName,
				// 				cart: getCart,
				// 			},
				// 		},
				// 	};
				// }
				// 	await axios(config);
				// }
				// const today = new Date();
				// const formattedDate = `${today
				// 	.getDate()
				// 	.toString()
				// 	.padStart(2, "0")}-${(today.getMonth() + 1)
				// 	.toString()
				// 	.padStart(2, "0")}-${today.getFullYear().toString()}`;
				// try {
				// 	await axios("/v1/kitchens/:id/deleteKotAlert", {
				// 		method: "POST",
				// 		data: {
				// 			businessName: businessData?.businessName,
				// 			tableName: data.tableName,
				// 			date: formattedDate || "12-12-2023",
				// 			itemName: data.dish.name,
				// 			reasonForDelete: data.reasonForDelete,
				// 			orderBy: data.customerName,
				// 			waiterName: data.staffName,
				// 			itemPrice: data.dish.price,
				// 			phone: businessData?.ownerPhone || "9588413799",
				// 		},
				// 	});
				// } catch (error) {
				// 	console.error("Failed to send delete kot alert", error);
				// }

				toast.success("Item deleted successfully");
			}
		} catch (error) {
			setIncorrectPassword(false);
			toast.error("The password you entered is wrong");
			console.error("Failed to submit delete request", error);
		}
	};

	const filteredStatusData = statusData.map((tableData) =>
		tableData.filter(
			(status) =>
				!status.isDeleted &&
				(status.dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					status.customerName
						.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					status.tableName.toLowerCase().includes(searchQuery.toLowerCase())),
		),
	);

	const renderUi = () => {
		switch (step) {
			case 0:
				return (
					<div className="relative pb-[3rem] px-4 rounded-t-2xl bg-secondary min-h-[20vh] max-h-[80vh] overflow-auto">
						<section className="sticky top-0 z-20 py-4 bg-secondary">
							<h3 className="text-xl font-medium ">Delete Multiple Dishes</h3>
							<article className="flex items-center justify-between">
								<input
									type="search"
									placeholder="Search..."
									value={searchQuery}
									onChange={handleSearchChange}
									className="w-[60%] px-4 py-2 mt-2 bg-white rounded-md"
								/>
								<button
									onClick={handleSelectAll}
									className="h-10 px-8 mt-2 text-white bg-primary rounded-2xl "
								>
									{selectedIds.length ===
									statusData.flat().filter((status) => !status.isDeleted).length
										? "Deselect All"
										: "Select All"}
								</button>
							</article>
						</section>
						{filteredStatusData.map((tableData, tableIndex) => {
							if (tableData.length === 0) {
								return null;
							}
							return (
								<div
									key={tableIndex}
									className="p-4 mb-4 space-y-2 bg-base-100 rounded-xl"
								>
									<article className="flex justify-between border-b">
										<h3 className="mb-2 text-lg">Table</h3>
										<h3 className="mb-2 text-lg">
											{tableData[0]?.tableName || "Unknown"}
										</h3>
									</article>
									{tableData
										.filter(
											(dish) => dish?.dishStatus?.toLowerCase() !== "delivered",
										)
										.map((status: IStatus) => (
											<div
												key={status._id}
												className="flex items-start justify-between"
											>
												<div>
													<span>{status.dish.name}</span>
													<div className="mt-1 text-sm font-semibold capitalize text-base-content/40">
														{status?.dish?.portions?.name}
													</div>
													<div className="mt-1 mb-2 text-xs font-normal capitalize text-base-content/40">
														{status?.dish?.extras?.map(
															(extra) => extra?.name + ", ",
														)}
													</div>
												</div>
												<input
													type="checkbox"
													className="w-4 h-4 mt-1"
													checked={selectedIds.includes(status._id)}
													onChange={() => handleCheckboxChange(status._id)}
												/>
											</div>
										))}
								</div>
							);
						})}
					</div>
				);
			case 1:
				return (
					<DeleteItemComponent
						deleteData={deleteData}
						handleUpdateDeleteData={handleUpdateDeleteData}
						incorrectPassword={incorrectPassword}
					/>
				);
			case 2:
				return <DeleteConfirmationModal />;
			default:
				return null;
		}
	};

	const handleNextStep = () => {
		if (step === 1) {
			if (deleteData.password === "") {
				toast.error("Password is required");
				return;
			}
		}
		if (step === 2) {
			console.log(
				"Confirmed deletion for selected items:",
				selectedIds,
				deleteData,
			);
			handleSubmit();
		} else {
			setStep(step + 1);
		}
	};

	const handleGoBack = () => {
		setStep(step - 1);
	};

	const renderButtons = () => {
		switch (step) {
			case 0:
				return (
					<div className="fixed flex gap-4 bottom-4 w-full max-w-[27rem] px-4">
						<button
							onClick={onClose}
							className="w-full px-4 py-2 border text-primary border-primary bg-base-100 rounded-2xl"
						>
							Cancel
						</button>
						<button
							onClick={handleNextStep}
							disabled={selectedIds.length === 0}
							className={`w-full px-4 py-2 text-white rounded-2xl ${
								selectedIds.length === 0 ? "bg-gray-400" : "bg-primary"
							}`}
						>
							Next
						</button>
					</div>
				);
			case 1:
				return (
					<div className="fixed flex gap-4 bottom-4 w-full max-w-[27rem] px-4">
						<button
							onClick={handleGoBack}
							className="w-full px-4 py-2 border text-primary border-primary bg-base-100 rounded-2xl"
						>
							Back
						</button>
						<button
							onClick={handleNextStep}
							className={`w-full px-4 py-2 text-white rounded-2xl ${
								deleteData.reasonForDelete === "" ? "bg-gray-400" : "bg-primary"
							}`}
							disabled={deleteData.reasonForDelete === ""}
						>
							Next
						</button>
					</div>
				);
			case 2:
				return (
					<div className="fixed flex gap-4 bottom-4 w-full max-w-[27rem] px-4">
						<button
							onClick={handleGoBack}
							className="w-full px-4 py-2 border text-primary border-primary bg-base-100 rounded-2xl"
						>
							Go Back
						</button>
						<button
							onClick={handleNextStep}
							className="w-full px-4 py-2 text-white bg-primary rounded-2xl"
						>
							Confirm
						</button>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<>
			{renderUi()}
			{renderButtons()}
		</>
	);
};

export default memo(DeleteMultipleDishes);
