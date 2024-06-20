import {  useState } from "react";
import axios from "@/components/utils/axios";
import { Disclosure } from "@headlessui/react";
import { FiChevronDown } from "react-icons/fi";
import { HiX } from "react-icons/hi";
import DayOutPopup from "@/components/atoms/dayoutPopup";
import { useTable } from "@/components/store/useTable";
import { toast } from "react-toastify";
import type { ITable, ITransformedTable } from "@/components/types/hiTableData";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/atoms/loader";
import { useLogin } from "@/components/store/useLogin";
import { useParams } from "react-router-dom";

interface IMergeTables {
	setCurrentView: (view: string) => void;
}

const MergeTables = ({ setCurrentView }:IMergeTables) => {
	const { businessId, zoneId } = useParams<{
		businessId: string;
		zoneId: string;
	}>();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const tableData = useTable((s) => s.tableData);
	const [businesses, setBusinesses] = useState<any>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [tableDatas, setTableDatas] = useState<ITransformedTable[]>([]);
	const userDetails = useLogin((s) => s.userDetails);


	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value.toLowerCase());
	};

	const openModal = () => {
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
	};

	const allTables = businesses.flatMap((zone) => zone.tables);
	const filteredTables = allTables.filter(
		(table) =>
			table.name.toLowerCase().includes(searchTerm) &&
			table.status.toLowerCase() === "empty",
	);

	const fetchZones = async () => {
		try {
			const res = await axios.get(
				`/v1/zones/${zoneId}/tablesByZones?businessId=${businessId}`,
			);
			setBusinesses([res?.data?.data]);
			return res?.data;
		} catch (error) {
			toast.error("Error fetching tables");
		}
	};
	const { isLoading } = useQuery({
		queryKey: ["tables", businessId, zoneId],
		queryFn: fetchZones,
		enabled: !!zoneId && !!businessId,
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader />
			</div>
		);
	}

	const mergeTable = async () => {
		const parentData = {
			tableId: tableData?._id,
			name: tableData.name,
			hierarchy: "PARENT",
			parentTableId: "",
			parentZoneId: "",
		};
		try {
			const config = {
				method: "PUT",
				url: `/v1/zones/:zoneId/mergeTables?businessId=${businessId}`,
				data: {
					businessId: businessId,
					tables: [parentData, ...tableDatas],
					mergedBy: userDetails.name
				},
			};
			const response = await axios(config);
			//TODO: check the response status
			if (response.status === 200 || response.status === 201) {
				toast.success("Table Merged Successfully");
				setCurrentView("pos");
			} else {
				toast.error("Table Already Merged");
				setCurrentView("kick");
			}
		} catch (err: any) {
			if (err?.response?.status === 400) {
				toast.error("Table Already Merged");
			}
		}
	};
	function transformData(data: ITable): ITransformedTable {
		return {
			tableId: data._id,
			name: data.name,
			hierarchy: "CHILD",
			parentTableId: tableData?._id,
			parentZoneId: tableData?.zoneId,
		};
	}
	function handleCheckboxChange(
		e: React.ChangeEvent<HTMLInputElement>,
		data: any,
	) {
		if (e.target.checked) {
			addTablesData(data);
		} else {
			removeTablesData(data);
		}
	}

	function addTablesData(data: ITable) {
		const transformedData = transformData(data);
		setTableDatas((prev) => [...prev, transformedData]);
	}
	function removeTablesData(data: ITable) {
		setTableDatas((prev) => prev.filter((item) => item?.tableId !== data._id));
	}
	return (
		<div className="relative w-full bg-secondary min-h-screen px-6 pb-[10rem] pt-6 overflow-auto scroll-smooth">
			<div className="flex items-center justify-between text-xl font-medium">
				<div>Merge Table</div>
				<div>{tableData?.name}</div>
				<div onClick={() => setCurrentView("kick")}>
					<HiX />
				</div>
			</div>
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
					{filteredTables.map((table) => {
						if (!table?.isMerge) {
							return null;
						}
						if (table.status.toLowerCase() === "active") {
							return null;
						}
						return (
							<div
								key={table._id}
								className="w-full max-w-md p-4 mx-auto mt-6 border bg-base-100 rounded-2xl"
							>
								<div className="flex justify-between">
									<input type="checkbox" />
									<div>{table.name}</div>
								</div>
							</div>
						);
					})}
				</>
			) : (
				<>
					{businesses?.map((zone, index) => (
						<div
							id={zone.zoneId}
							key={zone.zoneId}
							className="w-full max-w-md border mx-auto p-4 mt-6 bg-base-100 rounded-2xl scroll-mt-[13.2rem]"
						>
							<Disclosure defaultOpen={index === 0}>
								{({ open }) => (
									<Disclosure>
										<div>
											<Disclosure.Button className="flex justify-between w-full px-4 text-lg font-medium text-left rounded-2xl">
												<div className="w-[80%] mt-[0.125rem] -ml-4">
													{zone.zoneName}
												</div>
												<span className="mt-1 -mr-4">{zone.tables.length}</span>
												<FiChevronDown
													className={`${
														open ? "rotate-180 transform" : ""
													} h-5 w-5 mt-2 -mr-2`}
												/>
											</Disclosure.Button>
											<div>
												{open && (
													<Disclosure.Panel className="pt-4 pb-2 text-sm text-gray-500 transition-all duration-300">
														<div className="h-[0.125rem] bg-primary" />
														<div className="mt-2 ">
															{zone.tables
																.filter((table) => table._id !== tableData?._id)
																.map((table) => {
																	if (table?.isMerge) {
																		return null;
																	}
																	if (table.status.toLowerCase() === "active") {
																		return null;
																	}
																	return (
																		<div
																			key={table._id}
																			className="flex items-center justify-start py-4 mb-2 space-x-3 border-b border-dashed"
																		>
																			<label className="flex items-center justify-start w-full space-x-3 cursor-pointer">
																				<input
																					type="checkbox"
																					onChange={(e) =>
																						handleCheckboxChange(e, table)
																					}
																				/>
																				<div>{table?.name}</div>
																			</label>
																		</div>
																	);
																})}
														</div>
													</Disclosure.Panel>
												)}
											</div>
										</div>
									</Disclosure>
								)}
							</Disclosure>
						</div>
					))}
				</>
			)}

			<DayOutPopup show={isModalOpen} onClose={closeModal}>
				<div className="mt-4 ml-4 text-xl font-bold capitalize text-base-content">
					{tableData?.name}
				</div>
				<div className="mt-4 ml-4 font-semibold">
					Do you want to Merge{" "}
					{tableDatas
						.map((table) =>
							table.name.length > 4
								? `${table.name.slice(0, 4)}..`
								: table.name,
						)
						.join(" + ")}{" "}
					to {tableData?.name} in zone ?
				</div>
				<div className="flex justify-between mx-12 mt-6 pb-9">
					<button
						type="button"
						onClick={closeModal}
						className="px-6 py-2 -mr-6 text-sm bg-red-500 text-base-100 rounded-3xl"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={() => mergeTable()}
						className="px-6 py-2 -mr-6 text-sm bg-primary text-base-100 rounded-3xl"
					>
						Merge
					</button>
				</div>
			</DayOutPopup>
			<div onClick={() => openModal()} className="flex justify-center mb-5">
				<button
					type="button"
					className="on_active_bounce fixed bottom-6 z-50 bg-primary rounded-full w-[20.5rem] font-[600] py-[0.75rem] text-base-100 text-[18px] leading-[1.15rem]"
				>
					Merge
				</button>
			</div>
		</div>
	);
};

export default MergeTables;
