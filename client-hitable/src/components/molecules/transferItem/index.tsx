import type { ITable } from "@/components/types/hiTableData";
import React, { FC, useState } from "react";
import { Disclosure } from "@headlessui/react";
import { FiChevronDown } from "react-icons/fi";
import { useTable } from "@/components/store/useTable";
import axios from "@/axios";
import { useQuery } from "@tanstack/react-query";
import { useBusinessStore } from "@/components/store/useBusinessData";
import { toast } from "react-toastify";
import { TransferData } from "@/components/atoms/transferMultipleDishes";

interface TransferItemProps {
	handleNextStep: () => void;
	handleUpdateTransferData: (newValues: Partial<TransferData>) => void;
}

const TransferItem: FC<TransferItemProps> = ({
	handleNextStep,
	handleUpdateTransferData,
}) => {
	const [searchTerm, setSearchTerm] = useState("");
	const businessId = useBusinessStore((s) => s.businessData?.id);
	const handleSearchChange = (event) => {
		setSearchTerm(event.target.value.toLowerCase());
	};
	const tableData = useTable((s) => s.tableData);

	const fetchZones = async () => {
		try {
			const res = await axios.get(
				`/v1/zones/WithTables/Zones?businessId=${businessId}`,
			);
			return res.data;
		} catch (error) {
			toast.error("Failed to fetch zones");
		}
	};

	const { data, isLoading, error } = useQuery({
		queryKey: ["zones", businessId],
		queryFn: fetchZones,
		enabled: !!businessId,
	});

	let allTables: ITable[] = [];
	if (data) {
		allTables = data?.flatMap((zone) =>
			zone?.tables?.filter(
				(table: ITable) =>
					table?.hierarchy !== "CHILD" &&
					!tableData.mergeTables?.some(
						(mergeTable) => mergeTable.id === table.id,
					),
			),
		);
	}

	const filteredTables = allTables.filter(
		(table) =>
			table?.name.toLowerCase().includes(searchTerm) &&
			table?.id !== tableData?.id,
	);

	const handleSelectTable = (table: ITable) => {
		handleUpdateTransferData({
			toTableId: table.id,
			toZoneId: table.zoneId,
      name: table.name,
		});
		handleNextStep();
	};

	return (
		<div className="p-4 pb-16 min-h-[25vh] max-h-[80vh] overflow-auto">
			<div className="mt-4">
				<input
					type="text"
					placeholder="Search Table"
					value={searchTerm}
					onChange={handleSearchChange}
					className="w-full p-2 border border-[#cacaca] rounded-md bg-base-100"
				/>
			</div>
			{searchTerm ? (
				<>
					{filteredTables.map((table) => (
						<div
							key={table?.id}
							className="w-full max-w-md p-4 mx-auto mt-6 border bg-base-100 rounded-2xl"
						>
							<div className="flex justify-between">
								<div>{table?.name}</div>
								<button
									onClick={() => handleSelectTable(table)}
									className="px-4 py-1 font-medium border text-primary border-primary rounded-2xl"
								>
									Transfer
								</button>
							</div>
						</div>
					))}
				</>
			) : (
				<>
					{data
						?.filter((zone) => zone?.tables?.length > 0)
						?.map((zone) => (
							<div
								id={zone?.zoneName}
								key={zone?.zoneName}
								className="w-full max-w-md border mx-auto p-4 mt-6 bg-base-100 rounded-2xl scroll-mt-[13.2rem]"
							>
								<Disclosure>
									{({ open }) => (
										<>
											<div>
												<Disclosure.Button className="flex justify-between w-full px-4 text-lg font-medium text-left rounded-2xl">
													<div className="w-[80%] mt-[0.125rem] -ml-4">
														{zone?.zoneName}
													</div>
													<span className="mt-1 -mr-4">
														{zone?.tables?.length}
													</span>
													<FiChevronDown
														className={`${
															open ? "rotate-180 transform" : ""
														} h-5 w-5 mt-2 -mr-2`}
													/>
												</Disclosure.Button>
												<div>
													{open && (
														<Disclosure.Panel className="pt-4 pb-2 text-sm text-gray-500 transition-all duration-300">
															<div className="h-[0.125rem] bg-primary"></div>
															<div className="mt-2 ">
																{zone?.tables
																	.filter(
																		(table) =>
																			!table.isMerge ||
																			(table.isMerge &&
																				table.hierarchy === "PARENT"),
																	)
																	.map((table) => (
																		<div
																			key={table.id}
																			className="flex items-center justify-between py-4 mb-2 border-b border-dashed"
																		>
																			<div>{table?.name}</div>
																			{table.id !== tableData.id && (
																				<div className="on_active_bounce">
																					<button
																						onClick={() =>
																							handleSelectTable(table)
																						}
																						className="px-4 py-1 font-medium border text-primary border-primary rounded-2xl"
																					>
																						Transfer
																					</button>
																				</div>
																			)}
																		</div>
																	))}
															</div>
														</Disclosure.Panel>
													)}
												</div>
											</div>
										</>
									)}
								</Disclosure>
							</div>
						))}
				</>
			)}
		</div>
	);
};

export default TransferItem;
