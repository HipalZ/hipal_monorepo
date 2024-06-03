import { memo, startTransition, useState } from "react";
import { MdOutlineTableBar } from "react-icons/md";
import type { IZones } from "@/components/types/businessData";
import { useZoneStore } from "@/components/store/useZoneStore";
import { GoDownload } from "react-icons/go";
import { downloadURI } from "@/components/utils/helper";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import AddZone from "@/components/templates/zone";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/components/errorComponent";
import axios from "@/axios";
import { useNavigate, useParams } from "react-router-dom";

const classCard = {
	text: "text-xl",
	font: "text-4xl",
	bg: "bg-[#2F80ED]/10",
};

const Zones = memo(() => {
	const { data, setData } = useZoneStore();
	const { zones, tables } = data;
	const navigate = useNavigate()
	const [isLoading, setIsLoading] = useState(false);
	const { businessId } = useParams<{ businessId: string }>();
	const { setSelectedSubIcon, selectedSubIcon } = useSelectedIcon();
	const handleEditButton = (zone: IZones) => {
		const { id } = zone;
		startTransition(()=>{
			navigate(`/app/business/${businessId}/zone/${id}`);
		})
	};
	const handleAddZone = () => {
		setSelectedSubIcon("addZones");
	};
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

	const getZonesData = async (businessId: string) => {
		try {
			const zones = await axios.get(`/v1/zones?businessId=${businessId}`);
			setData({ zones: zones?.data })
			return zones.data;
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};

	const { isLoading: isTableDataPending, error: TableErrorData, data: tableData, refetch: refetchTableData } = useQuery({
		queryKey: ['tablesData', businessId],
		queryFn: () => getTablesData(businessId),
		enabled: !!businessId
	})

	const { isLoading: isZoneDataPending, error: ZoneErrorData, data: zoneData, refetch: refetchZoneData } = useQuery({
		queryKey: ['zonesData', businessId],
		queryFn: () => getZonesData(businessId),
		enabled: !!businessId
	})

	if (TableErrorData) return <ErrorComponent refetch={refetchTableData} />
	if (ZoneErrorData) return <ErrorComponent refetch={refetchZoneData} />

	const ZonesData = () => {
		return (
			<div className="mb-[10rem]">
				{zones?.map((zone) => {
					return (
						<div key={zone?.id}>
							<div className="p-3 mx-6 mt-6 border border-gray-200 rounded-lg border-1">
								<div className="pb-3 flex justify-between items-center">
									<h1 className="capitalize text-base text-[#2B354D] font-semibold">
										{zone.zoneName}
									</h1>
									<div onClick={() => handleEditButton(zone)}>
										<button
											type="button"
											className="text-[#2F80ED] hover:underline"
										>
											Edit
										</button>
									</div>
								</div>
								{zone?.tables && zone?.tables?.length > 0 ?
									<>
										<hr className="bg-[#cacaca] h-0.5" />
										<div className="pb-3 flex justify-between items-center border-b-1 border-[#cacaca] border-b mb-2">
											<h1 className="mt-3 text-[#2B354D]/70">
												Tables in this zone
											</h1>
											<p>{zone?.tables?.length}</p>
										</div>
									</> : null
								}
								<div className="grid grid-cols-1 md:grid-cols-2 md:gap-2 lg:grid-cols-4">
									{tables?.map(
										(table) =>
											table?.zoneId === zone?.id && (
												<div key={table?.id} className="my-1">
													<div className="flex items-center rounded-lg p-2 border border-[#CACACA] w-full">
														<div className="flex justify-between">
															<MdOutlineTableBar
																className={` ${classCard.font} ${classCard.bg} px-2 rounded-full`}
															/>
														</div>
														<div className="text-base px-2 font-medium">
															{table.name}
														</div>
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
															className="on_active_bounce flex justify-self-end items-center ml-auto rounded-md border border-[#2B354D] py-1 px-2"
														>
															<GoDownload />
															<span>Qr</span>
														</div>
													</div>
												</div>
											),
									)}
								</div>
							</div>
						</div>
					);
				})}
				<div className="fixed w-full px-6 bottom-5">
					<button
						type="button"
						onClick={handleAddZone}
						className="on_active_bounce text-white rounded-md bg-[#2B354D] py-2.5 w-full"
					>
						Add Zone
					</button>
				</div>
				{isLoading && <LoadingSpinner />}
				{isZoneDataPending && <LoadingSpinner />}
				{isTableDataPending && <LoadingSpinner />}
			</div>
		);
	};
	const renderData = () => {
		switch (selectedSubIcon) {
			case "addZones":
				return (
					<AddZone refetchZoneData={refetchZoneData} />
				);

			default:
				return (
					<ZonesData />
				);
		}
	};
	return <>{renderData()}</>;
})

export default Zones
