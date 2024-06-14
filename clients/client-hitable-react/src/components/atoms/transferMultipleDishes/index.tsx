import { IStatus } from "@/components/types/hiTableData";
import React, { useRef, useState } from "react";
import TransferItem from "@/components/molecules/transferItem";
import { useLogin } from "@/components/store/useLogin";
import { toast } from "react-toastify";
import axios from "@/components/utils/axios";

interface TransferMultipleProps {
	statusData: IStatus[][];
	onClose: () => void;
	refetch: () => void;
}
export interface TransferData {
	toZoneId: string;
	toTableId: string;
	name: string;
}
const TransferMultipleDishes = ({
	statusData,
	onClose,
	refetch,
}:TransferMultipleProps):JSX.Element => {
	const [selectedDishes, setSelectedDishes] = useState<IStatus[]>([]);
	const [step, setStep] = useState(0);
	const [searchQuery, setSearchQuery] = useState<string>("");

	const [transferData, setTransferData] = useState<TransferData>({
		toZoneId: "",
		toTableId: "",
		name: "",
	});

	const user = useLogin((s) => s.userDetails);

	const transferREf = useRef(transferData);
	const handleUpdateTransferData = (newValues: Partial<TransferData>) => {
		transferREf.current = transferData;
		setTransferData((prevValues) => ({
			...prevValues,
			...newValues,
		}));
	};

	const handleCheckboxChange = (dish: IStatus) => {
		setSelectedDishes((prevSelectedDishes) =>
			prevSelectedDishes.find((selectedDish) => selectedDish._id === dish._id)
				? prevSelectedDishes.filter(
						(selectedDish) => selectedDish._id !== dish._id,
					)
				: [...prevSelectedDishes, dish],
		);
	};
	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(event.target.value);
	};

	const handleSelectAll = () => {
		const allDishes = statusData
			.flat()
			.filter(
				(status) =>
					!status.isDeleted && status.dishStatus.toLowerCase() !== "delivered",
			);

		if (selectedDishes.length === allDishes.length) {
			setSelectedDishes([]);
		} else {
			setSelectedDishes(allDishes);
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

	const transferItem = async () => {
		console.log(selectedDishes);
		try {
			const config = {
				toZoneId: transferData?.toZoneId,
				toTableId: transferData?.toTableId,
				transferBy: user.name,
				customerName: user?.name,
				customerPhone: user?.phone,
				kotObjectArray: selectedDishes,
			};
			const res = await axios.post("/v1/kitchens/:id/transferKot", config);
			if (res.status === 200) {
				toast.success("Dishes transferred successfully");
				refetch();
				onClose();
			}
		} catch (error: any) {
			console.log(error);
		}
	};
	const handleNextStep = () => {
		if (step === 2) {
			transferItem();
		} else {
			setStep(step + 1);
		}
	};

	const handleGoBack = () => {
		setStep(step - 1);
	};

	const renderUi = () => {
		switch (step) {
			case 0:
				return (
					<div className="relative pb-[3rem] px-4 rounded-t-2xl bg-secondary min-h-[20vh] max-h-[80vh] overflow-auto">
						<section className="sticky top-0 z-20 py-4 bg-secondary">
							<h3 className="text-xl font-medium ">Transfer Multiple Dishes</h3>
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
									{selectedDishes.length ===
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
													checked={selectedDishes.some(
														(dish) => dish._id === status._id,
													)}
													onChange={() => handleCheckboxChange(status)}
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
					<>
						<TransferItem
							handleNextStep={handleNextStep}
							handleUpdateTransferData={handleUpdateTransferData}
						/>
					</>
				);
			case 2:
				return (
					<section className="h-48">
						<div className="p-4">
							Transfer Dishes from {selectedDishes[0]?.tableName} to{" "}
							{transferData.name}
						</div>
					</section>
				);
			default:
				return null;
		}
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
							disabled={selectedDishes.length === 0}
							className={`w-full px-4 py-2 text-white rounded-2xl ${
								selectedDishes.length === 0 ? "bg-gray-400" : "bg-primary"
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
		<div>
			{renderUi()}
			{renderButtons()}
		</div>
	);
};

export default TransferMultipleDishes;
