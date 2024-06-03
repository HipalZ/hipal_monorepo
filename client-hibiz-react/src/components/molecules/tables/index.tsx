import axios from "@/axios";
import AddTables from "@/components/atom/addTable";
import EditTables from "@/components/atom/editTable";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import PopUp from "@/components/atom/popUp";
import ErrorComponent from "@/components/errorComponent";
import { useZoneStore } from "@/components/store/useZoneStore";
import type { IStaffs, ITables, IZones } from "@/components/types/businessData";
import { downloadURI } from "@/components/utils/helper";
import { paths } from "@/components/utils/paths";
import { classCard } from "@/pages/app/business/[businessId]/zone";
import { useQuery } from "@tanstack/react-query";
import { memo, useEffect, useState } from "react";
import { BsFillPersonFill } from "react-icons/bs";
import { GoDownload } from "react-icons/go";
import { MdOutlineTableBar } from "react-icons/md";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const Tables = memo(() => {
	const { businessId } = useParams<{
		businessId: string;
	}>();
	const [tableModal, setTableModal] = useState(false);
	const [createdTable, setCreatedTable] = useState<ITables[]>([]);
	const [postStaffs, setPostStaffs] = useState<IStaffs[]>([]);
	const [postZones, setPostZones] = useState<IZones[]>([]);
	const { data, setData, editTable } = useZoneStore();
	const [createTable, setCreateTable] = useState(false);
	const staffs = useZoneStore((s) => s.data?.staff);

	useEffect(() => {
		setPostZones(data?.zones);
		setPostStaffs(data?.staff);
		setCreatedTable(data?.tables);
	}, [businessId, data?.zones, data?.staff, data?.tables]);
	const getTablesData = async (businessId: string) => {
		try {
			const tables = await axios.get(`/v1/zones/all/tables?businessId=${businessId}`);
			setData({
				tables: tables.data,
			});
			return tables.data;
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};
	const getStaffData = async (businessId: string) => {
		try {
			const staff = await axios.get(`/v1/users/${businessId}`);
			setData({
				staff: staff?.data
			});
			return staff.data;
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};
	const { isLoading: isTableDataPending, error: TableErrorData, data: tableData, refetch: refetchTableData } = useQuery({
		queryKey: ['tablesData', businessId],
		queryFn: () => getTablesData(businessId),
		enabled: !!businessId
	})

	const { isLoading: isStaffDataPending, error: StaffErrorData, data: staffData, refetch: refetchStaffData } = useQuery({
		queryKey: ['staffData', businessId , tableModal],
		queryFn: () => getStaffData(businessId),
		enabled: !!businessId && !!tableModal
	})

	function closeTableModal() {
		setTableModal(false);
	}
	const [selectedTable, setSelectedTable] = useState<ITables>({});
	const [isLoading, setIsLoading] = useState(false);
	const handleEditTable = (table: ITables) => {
		setSelectedTable(table);
		setCreateTable(true);
	};
	function closePopUpModal() {
		setCreateTable(false);
	}
	const closeModal = () => { };
	const getTableUpdatedData = async (data: ITables) => {
		await updateTableData(data);
	};
	const updateTableData = async (data: ITables) => {
		setIsLoading(true);
		try {
			const config = {
				url: paths.updateTableApi(data?.id),
				method: "PUT",
				mode: "cors",
				headers: {
					"Content-Type": "application/json",
				},
				data: {
					...data,
					staff: data?.staffs,
				},
			};

			const response = await axios(config);
			if (response?.status === 201 || response?.status === 200) {
				toast.success("Table data updated successfully");
				editTable(response?.data);
			}
		} catch (err) {
			console.log(err);
		}
		setIsLoading(false);
	};

	if (isTableDataPending || isStaffDataPending) return <LoadingSpinner />
	if (TableErrorData) return <ErrorComponent refetch={refetchTableData} />
	if (StaffErrorData) return <ErrorComponent refetch={refetchStaffData} />
	return (
		<>
			<div className="relative p-4 space-y-4 mb-20">
				{createdTable?.map((table) => {
					const zone = postZones?.find((zone) => table?.zoneId === zone?.id);
					const countStaffs = table?.staff?.length;
					return (
						<div
							key={table?.name}
							className="flex flex-col space-y-4 rounded-lg p-2 w-full border border-[#CACACA]"
						>
							<div className="flex items-center">
								<div>
									<MdOutlineTableBar
										className={` ${classCard.font} ${classCard.bg} px-2 rounded-full`}
									/>
								</div>
								<div className={`${classCard.text} px-2 font-medium`}>
									{table?.name}
								</div>
								<div className="ml-auto flex items-center space-x-4">
									<div
										onClick={async () => {
											setIsLoading(true);
											await downloadURI(
												table?.id,
												table?.name,
												table?.zoneId,
												businessId || '',
											);
											setIsLoading(false);
										}}
										className="on_active_bounce flex items-center space-x-2 rounded-md border border-[#2B354D] py-1 px-2"
									>
										<GoDownload />
										<span>Qr</span>
									</div>
								</div>
							</div>
							<p className="px-3 font-medium opacity-75">
								Zone : {zone?.zoneName}
							</p>
							<div className="px-3 flex justify-between items-center opacity-75">
								<div className="flex items-center space-x-2">
									<BsFillPersonFill />
									<h1 className="text-base">Staff : {countStaffs}</h1>
								</div>
								<button
									type="button"
									onClick={() => handleEditTable(table)}
									className="on_active_bounce ml-auto text-[#2F80ED] hover:underline"
								>
									Edit
								</button>
							</div>
						</div>
					);
				})}

				{tableModal && (
					<PopUp show={tableModal} onClose={closeTableModal}>
						<AddTables
							postZones={postZones}
							closeModal={closeTableModal}
							setCreatedTable={setCreatedTable}
							postStaffs={postStaffs}
							setTableModal={setTableModal}
							tableModal={tableModal}
						/>
					</PopUp>
				)}
			</div>
			{createTable && selectedTable && (
				<PopUp show={createTable} onClose={closePopUpModal}>
					<EditTables
						postZones={postZones}
						setPostZones={setPostZones}
						table={selectedTable}
						closeModal={closeModal}
						closePopUpModal={closePopUpModal}
						getTableUpdatedData={getTableUpdatedData}
						postStaffs={staffs}
					/>
				</PopUp>
			)}
			<div className="fixed w-full px-6 bottom-4">
				<button
					type="button"
					onClick={() => {
						setTableModal(true)
					}}
					className="on_active_bounce text-white rounded-md bg-[#2B354D] py-2.5 w-full"
				>
					Add
				</button>
			</div>
			{isLoading && <LoadingSpinner />}
		</>
	);
});

export default Tables;
