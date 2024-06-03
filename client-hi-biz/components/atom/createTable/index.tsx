import type { IStaffs, ITables, IZones } from "@/components/types/businessData";
import { paths } from "@/components/utils/paths";
import axios from "@/axios";
import React, { memo, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BsFillPersonFill } from "react-icons/bs";
import { useRouter } from "next/router";
import { useZoneStore } from "@/components/store/useZoneStore";

type ITableObj = {
	name: string;
	capacity: number | undefined;
	businessId: string;
	staff?: string[];
	zoneId: string;
};
const CreateTables = ({
	postZones,
	zoneId,
	closeModal,
	closePopUpModal,
	postStaffs,
}: any) => {
	const [staffs, setStaffs] = useState<IStaffs[]>([]);
	const { data, addTable } = useZoneStore();
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const [eachZoneId, setEachZoneId] = useState("");
	const { businessId } = router.query as { businessId: string };
	const [activeClick, setActiveClick] = useState<Array<string>>([]);
	const [tableData, setTableData] = useState<ITableObj>({
		name: "",
		capacity: undefined,
		businessId: businessId,
		staff: activeClick,
		zoneId: zoneId,
	});
	useEffect(() => {
		setStaffs(postStaffs);
	}, []);
	const createTable = async () => {
		createSingleTable();
	};
	function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
		setTableData((tableData: ITables) => {
			return {
				...tableData,
				name: e.target.value,
			};
		});
	}
	function handleCapacityChange(e: React.ChangeEvent<HTMLInputElement>) {
		setTableData((tableData: ITables) => {
			return {
				...tableData,
				capacity: e.target.value,
			};
		});
	}

	function handleActiveClick(id: string) {
		setActiveClick((prev) => {
			if (prev.includes(id)) {
				return prev.filter((activeId) => activeId !== id);
			}
				return [...prev, id];
		});
	}
	const handleZonesData = (id: string) => {
		const selectedZone = postZones.find((zone:IZones) => zone.id === id);

		const newStaffs = postStaffs.filter(
			(eachStaff:IStaffs) => selectedZone ? selectedZone.staff.includes(eachStaff.id) :'',
		);

		setStaffs(newStaffs);
		setEachZoneId(id);
		setTableData((tableData: ITables) => ({
			...tableData,
			zoneId: id,
		}));
	};

	useEffect(() => {
		setTableData((tableData: ITables) => {
			return {
				...tableData,
				staff: activeClick,
			};
		});
	}, [activeClick]);
	const createSingleTable = async () => {
		const isTableNameExists = data?.tables?.some(
			(table) => table.name === tableData?.name,
		);
		if (isTableNameExists) return toast.error("Table Name already exists");
		setLoading(true)
		try {
			const config = {
				url: paths.postTablesApi(eachZoneId),
				method: "POST",
				mode: "cors",
				headers: {
					"Content-Type": "application/json",
				},
				data: tableData,
			};
			const response = await axios(config);
			if (response?.status === 201 || response?.status === 200) {
				toast.success("Table successfully created");
				addTable(response?.data);
				closePopUpModal();
				closeModal();
			}
		} catch (err) {
			console.log(err);
		}finally{
			setLoading(false)
		}
	};
	return (
		<div className="bg-[#F5F5F5] rounded-t-[1.5rem]">
			<div className="overflow-y-auto max-h-[85vh]">
				<h1 className="px-6 pt-6 text-[#2B354D] text-2xl">Add Tables</h1>
				<div className="bg-white rounded-lg mx-6 my-5 border border-1 border-[#CACACA] px-4">
					<div className="my-4">
						<h1 className="my-4 text-base">Name of the Table</h1>
						<input
							value={tableData?.name}
							maxLength={20}
							onChange={handleNameChange}
							className="w-full rounded-md"
							type="text"
							placeholder="Name"
						/>
					</div>
					<div className="my-4">
						<h1 className="my-4 text-base">Capacity of the Table</h1>
						<input
							value={tableData?.capacity}
							maxLength={5}
							onChange={handleCapacityChange}
							className="w-full rounded-md"
							type="text"
							placeholder="Capacity"
						/>
					</div>
					<div className="my-4 border border-[#CACACA] p-4 rounded-lg">
						<h1 className="text-base">Zones</h1>
						{postZones?.map((zone: IZones) => {
							return (
								<div
									key={zone?.id}
									onClick={() => handleZonesData(zone?.id)}
									onKeyUp={() => handleZonesData(zone?.id)}
									className="border-1 border-[#CACACA] bg-white rounded-md my-5 p-3 border"
								>
									<div className="flex items-center">
										<input
											type="checkbox"
											checked={tableData?.zoneId === zone.id}
											onChange={() => {}}
											className="mr-2 rounded-sm"
										/>
										<h1 className="mx-2 text-base">{zone.zoneName}</h1>
									</div>
								</div>
							);
						})}
					</div>
					<div className="my-4 border border-[#CACACA] p-4 rounded-lg">
						<h1 className="text-base">Staff</h1>
						{staffs?.map((staff: IStaffs) => {
							return (
								<div
									key={staff?.id}
									onClick={() => handleActiveClick(staff.id)}
									onKeyUp={() => handleActiveClick(staff.id)}
									className={`${
										activeClick.includes(staff.id)
											? "border-[#2B354D] border-2"
											: "border-1 border-[#CACACA]"
									} bg-white rounded-md my-5 p-3 border`}
								>
									<div className="flex items-center">
										<input
											type="checkbox"
											checked={tableData?.staff?.includes(staff?.id)}
											onChange={() => {}}
											className="mr-2 rounded-sm"
										/>
										<BsFillPersonFill />
										<h1 className="mx-2 text-base">{staff.name}</h1>
									</div>
									<div className="flex justify-between mt-2">
										<p className="text-sm text-[#2B354D]/70">
											{staff.customRole[0]?.roleName}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				</div>
				<div className="sticky mx-6 my-6 bottom-5">
					<button
						type="button"
						onClick={() => createTable()}
						className={`${loading ? 'pointer-events-none opacity-50' : ''} on_active_bounce text-white rounded-md bg-[#2B354D] py-2.5 w-full`}
					>
						{loading ? 'Loading...' : 'Create'}
					</button>
				</div>
			</div>
		</div>
	);
};

export default memo(CreateTables);
