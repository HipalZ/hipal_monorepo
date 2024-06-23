import HeaderButton from "@/components/atoms/buttons/headerButton";
import { useState, memo, useCallback, startTransition } from "react";
import { MdAlarm } from "react-icons/md";
import { TbToolsKitchen2 } from "react-icons/tb";
import { SiGoogleassistant } from "react-icons/si";
import { MdOutlineDinnerDining, MdOutlinePeopleOutline } from "react-icons/md";
import { useLogin } from "@/components/store/useLogin";
import { useTable } from "@/components/store/useTable";
import type { ITable } from "@/components/types/hiTableData";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/atoms/loader";
import { AxiosError } from "axios";
import { Link, use, useParams } from "react-router-dom";
import axios from "@/components/utils/axios";
import { PAGE_TYPES, newRoutes } from "@/components/utils/routes";

const filterButtons = [
	{
		name: "Active",
		Icon: MdAlarm,
		text: "Active",
	},
	{
		name: "Empty",
		Icon: TbToolsKitchen2,
		text: "Empty",
	},
	{
		name: "Need Assistance",
		Icon: SiGoogleassistant,
		text: "Assistant",
	},
];

const classByStatus: { [key: string]: any } = {
	occupied: {
		classNames:
			"relative h-[5.75rem] mx-6 mb-4 border border-[#e1e1e1]/50 rounded-xl bg-[#E3EFFF]",
		businessNameClasses:
			"absolute font-[500] capitalize truncate left-6 top-9 w-[50%]",
		tableClasses: "right-8 top-6 absolute text-[1rem] opacity-50",
		numberClasses: "absolute right-6 bottom-6 text-sm font-[500] text-primary",
	},
	reserved: {
		classNames:
			"relative h-[3.75rem]  mx-6 mb-4 border border-[#e1e1e1]/50 rounded-xl bg-gray-200",
		businessNameClasses:
			"absolute font-[500] capitalize truncate left-6 top-2 w-[50%]",
		tableClasses: "right-8 top-2 absolute text-[1rem] opacity-50",
		numberClasses: "absolute right-6 bottom-2 text-sm font-[500] text-primary",
	},
	empty: {
		classNames:
			"relative h-[3.75rem]  mx-6 mb-4 border border-[#e1e1e1]/50 rounded-xl bg-base-100",
		businessNameClasses:
			"absolute font-[500] capitalize truncate left-6 top-2 w-[50%]",
		tableClasses: "right-8 top-2 absolute text-[1rem] opacity-50",
		numberClasses: "absolute right-6 bottom-2 text-sm font-[500] text-primary",
	},
	active: {
		classNames:
			"relative h-[5.75rem] mx-6 mb-4 border border-[#e1e1e1]/50 rounded-xl bg-[#DBFFE2]",
		businessNameClasses:
			"absolute font-[500] capitalize truncate left-6 top-9 w-[50%]",
		tableClasses: "right-8 top-6 absolute text-[1rem] opacity-50",
		numberClasses: "absolute right-6 bottom-6 text-sm font-[500] text-primary",
	},
	settled: {
		classNames:
			"relative h-[5.75rem] mx-6 mb-4 border border-[#e1e1e1]/50 rounded-xl bg-[#FFF3D3]",
		businessNameClasses:
			"absolute font-[500] capitalize truncate left-6 top-9 w-[50%]",
		tableClasses: "right-8 top-6 absolute text-[1rem] opacity-50",
		numberClasses: "absolute right-6 bottom-6 text-sm font-[500] text-primary",
	},
	"need assistance": {
		classNames:
			"relative h-[5.75rem]  mx-6 mb-4 border border-[#e1e1e1]/50 rounded-xl bg-[#FFE5E5]",
		businessNameClasses:
			"absolute font-[500] capitalize truncate left-6 top-9 w-[50%]",
		tableClasses: "right-8 top-6 absolute text-[1rem] opacity-50",
		numberClasses: "absolute right-6 bottom-6 text-sm font-[500] text-primary",
	},
	kitchen: {
		classNames:
			"relative h-[5.75rem]  mx-6 mb-4 border border-[#e1e1e1]/50 rounded-xl bg-[#FFE5E5]",
		businessNameClasses:
			"absolute font-[500] capitalize truncate left-6 top-9 w-[50%]",
		tableClasses: "right-8 top-6 absolute text-[1rem] opacity-50",
		numberClasses: "absolute right-6 bottom-6 text-sm font-[500] text-primary",
	},
	settle: {
		classNames:
			"relative h-[5.75rem]  mx-6 mb-4 border border-[#e1e1e1]/50 rounded-xl bg-[#FFE5E5]",
		businessNameClasses:
			"absolute font-[500] capitalize truncate left-6 top-9 w-[50%]",
		tableClasses: "right-8 top-6 absolute text-[1rem] opacity-50",
		numberClasses: "absolute right-6 bottom-6 text-sm font-[500] text-primary",
	},
};

const Table = () => {
	const [tableData, setTableData] = useState<ITable[]>([]);
	const [originalZoneData, setOriginalZoneData] = useState<ITable[]>([]);
	const [search, setSearch] = useState("");
	const [activeButton, setActiveButton] = useState("");
	const {
		password,
		setIsLogin,
		userDetails,
		zoneName,
		setUserDetails,
	} = useLogin();
	const setTableLocal = useTable((s) => s.setTableData);
	const  = use();
	const params = useParams<{ businessId: string; zoneId: string }>();
	const { businessId, zoneId } = params;

	const handleOnclick = (filterName: string) => {
		if (filterName === activeButton) {
			setTableData(originalZoneData);
			setActiveButton("");
		} else {
			const filteredData = originalZoneData.filter(
				(ele) => ele?.status?.toLowerCase() === filterName.toLowerCase(),
			);
			setTableData(filteredData);
			setActiveButton(filterName);
		}
	};

	const waiterLogin = useCallback(async () => {
		try {
			const config = {
				method: "POST",
				url: "/v1/users/waiterLogin",
				data: { phone: userDetails.phone, password: password },
			};

			const response = await axios(config);

			if (response.status === 201) {
				setUserDetails(response.data.data);
				setIsLogin(true);
				result();
			}
		} catch (err) {
			if (err instanceof AxiosError) {
				if (err.response && err.response.status === 400) {
					toast.error("Phone or Password invalid...!");
				} else {
					console.log(err);
				}
			}
		}
	}, [userDetails.phone, password, setUserDetails, setIsLogin]);

	const result = useCallback(async () => {
		try {
			const response = await axios.get(
				`/v1/zones/${zoneId}/tables/ByWaiter?businessId=${businessId}&staffId=${userDetails?._id}`,
			);
			const res = response.data.data;
			const capacityMap = res.reduce((map: Record<string, number>, table: ITable) => {
				map[table._id] = table.capacity;
				return map;
			}, {});
			const processedData = res
				.map((table: ITable) => {
					if (table.isMerge && table.hierarchy === "PARENT") {
						const totalCapacity = table.mergeTables.reduce(
							(total, mergedTable) => {
								// use mergedTable.id only
								return total + capacityMap[mergedTable.id];
							},
							0,
						);
						return { ...table, capacity: totalCapacity };
					}
					return table;
				})
				.filter(
					(table: ITable) =>
						!table.isMerge || (table.isMerge && table.hierarchy === "PARENT"),
				);

			setOriginalZoneData(processedData);
			setTableData(processedData);
			const preprocessedData = processedData.map((item: ITable) => ({
				...item,
				status: item.status.toLowerCase(),
			}));

			const statusOrder = {
				"need assistance": 1,
				active: 2,
				occupied: 3,
				empty: 4,
				default: 5,
			} as any;

			preprocessedData.sort((a: ITable, b: ITable) => {
				const aStatusOrder = statusOrder[a.status] || statusOrder.default;
				const bStatusOrder = statusOrder[b.status] || statusOrder.default;

				return aStatusOrder - bStatusOrder;
			});

			return preprocessedData;
		} catch (e) {
			if ((e as AxiosError).response?.status === 401) {
				waiterLogin();
			}
		}
	}, [businessId, userDetails?._id, zoneId, waiterLogin]);

	const { isLoading, error, data } = useQuery({
		queryKey: ["zones", businessId],
		queryFn: result,
		enabled: !!businessId && !!userDetails?._id && !!zoneId,
	});

	const handleTableClick = useCallback(
		(tableData: any) => {
			setTableLocal(tableData);
		},
		[setTableLocal],
	);


	const goToHome = () => {
		toast.error("Session has ended Please login again");
		startTransition(() => {
			(`/r/${businessId}/login`);
		})
	};

	const searchTables = () => {
		return tableData.filter((tables: ITable) =>
			tables.name.toLowerCase().includes(search.toLowerCase()),
		);
	};
	const searchResults = searchTables();
	const handleClick = (ele) => {
		startTransition(() => {
			return (
				newRoutes[PAGE_TYPES.SINGLE_TABLE](
					businessId || ele.businessId,
					zoneId || ele.zoneId,
					ele._id
				)
			);
		});
	};
	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader />
			</div>
		);
	}
	if (error) {
		return (
			<div className="flex items-center justify-center h-screen">
				<button onClick={goToHome} className="btn" type="button">
					Retry
				</button>
			</div>
		);
	}

	return (
		<div className="pb-6">
			<div className="sticky top-0 z-50 bg-secondary">
				<section className="flex items-center justify-between mx-4 mt-4">
					<div className="font-bold capitalize text-base-content">
						{zoneName}
					</div>
					<div className="relative">
						<input
							onChange={(e) => {
								setSearch(e.target.value);
							}}
							value={search}
							type="search"
							id="simple-search"
							className="border border-gray-300 text-gray-900 text-sm rounded-xl focus:outline-none focus:border-primary block pl-4 p-1.5"
							placeholder="Search"
							required
						/>
					</div>
				</section>
				<div className="sticky flex justify-between pb-6 mx-6 mt-6 ">
					{filterButtons.map(({ name, Icon, text }, index) => (
						<HeaderButton
							onClick={() => handleOnclick(name)}
							key={`${index}${name}`}
							className={
								activeButton === name
									? "bg-blue-500 focus:font-[500] focus:rounded-full focus:text-primary focus:bg-primary/10 "
									: ""
							}
						>
							<Icon className="mt-1 mr-1 -ml-1 text-primary" />
							{text}
						</HeaderButton>
					))}
				</div>
			</div>
			<div className="mb-[4rem]">
				<div className="grid items-center gap-0 grid-col-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{search.length === 0 ? (
						<>
							{data?.map((ele: ITable, index: number) => {
								return (
									<div
										key={`${ele._id + zoneId}search${index}`}
										onClick={() => handleClick(ele)}
									>
										<div
											onClick={() => handleTableClick(ele)}
											className={`${classByStatus[ele?.status?.toLowerCase() || "empty"]
												?.classNames
												} ${ele.isMerge ? "bg-[#d6ebda]" : ""}`}
										>
											<div
												className={`${classByStatus[ele?.status?.toLowerCase() || "empty"]
													?.businessNameClasses
													} text-black`}
											>
												{ele.isMerge
													? ele.mergeTables
														.map((table) =>
															table.name.length > 4
																? `${table.name.slice(0, 4)}...`
																: table.name,
														)
														.join(" + ")
													: ele.name}
											</div>
											<MdOutlinePeopleOutline
												className={`${classByStatus[ele?.status?.toLowerCase() || "empty"]
													?.tableClasses
													}`}
											/>
											<div
												className={`${classByStatus[ele?.status?.toLowerCase() || "empty"]
													?.numberClasses
													}`}
											>
												{ele?.activeUser < 10
													? `0${ele?.activeUser}`
													: ele?.activeUser == null
														? "00"
														: ele?.activeUser}
											/
											{ele?.capacity < 10 ? `0${ele?.capacity}` : ele?.capacity}
											</div>
											{ele?.status?.toLowerCase() !== "empty" &&
												ele?.status?.toLowerCase() !== "reserved" && (
													<div>
														<div className="absolute top-3 left-6 text-sm font-[500] text-primary">
															{ele?.time}
														</div>
													</div>
												)}
											<div className="absolute text-sm font-normal capitalize bottom-2 left-6 text-base-content/40">
												{ele.status}
												{ele.isMerge ? " (Merged) " : ""}
											</div>
											{ele?.status?.toLowerCase() !== "empty" &&
												ele?.status?.toLowerCase() !== "reserved" && (
													<div>
														<MdOutlineDinnerDining className="right-[5.5rem] top-6 absolute text-[1rem] opacity-50" />
														<div className="absolute right-20 bottom-6 text-sm font-[500] text-primary">
															{ele?.totalDishQuantity < 10
																? `0${ele?.deliverdDish}`
																: ele?.deliverdDish == null
																	? "00"
																	: ele?.deliverdDish}
														/
														{ele?.totalDishQuantity < 10
																? `0${ele?.totalDishQuantity}`
																: ele?.totalDishQuantity}
														</div>
													</div>
												)}
										</div>
									</div>
								)
							})}
						</>
					) : (
							<>
								{searchResults?.map((ele: ITable, index: number) => (
									<Link
										key={`${ele._id + zoneId}search${index}`}
										to={`${newRoutes[PAGE_TYPES.SINGLE_TABLE](
											businessId || ele.businessId,
											zoneId || ele.zoneId,
											ele?._id,
										)}`}
									>
										<div
											onClick={() => handleTableClick(ele)}
											className={`${classByStatus[ele?.status?.toLowerCase() || "empty"]
												?.classNames
												} ${ele.isMerge ? "bg-[#d6ebda]" : ""}`}
										>
											<div
												className={`${classByStatus[ele?.status?.toLowerCase() || "empty"]
													?.businessNameClasses
													} text-black`}
											>
												{ele.isMerge
													? ele.mergeTables
														.map((table) =>
															table.name.length > 4
																? `${table.name.slice(0, 4)}...`
																: table.name,
														)
														.join(" + ")
													: ele.name}
											</div>
											<MdOutlinePeopleOutline
												className={`${classByStatus[ele?.status?.toLowerCase() || "empty"]
													?.tableClasses
													}`}
											/>
											<div
												className={`${classByStatus[ele?.status?.toLowerCase() || "empty"]
													?.numberClasses
													}`}
											>
												{ele?.activeUser < 10
													? `0${ele?.activeUser}`
													: ele?.activeUser == null
														? "00"
														: ele?.activeUser}
											/
											{ele?.capacity < 10 ? `0${ele?.capacity}` : ele?.capacity}
											</div>
											{ele?.status?.toLowerCase() !== "empty" &&
												ele?.status?.toLowerCase() !== "reserved" && (
													<div>
														<div className="absolute top-3 left-6 text-sm font-[500] text-primary">
															{ele?.time}
														</div>
													</div>
												)}
											<div className="absolute text-sm font-normal capitalize bottom-2 left-6 text-base-content/40">
												{ele.status}
												{ele.isMerge ? " (Merged) " : ""}
											</div>
											{ele?.status?.toLowerCase() !== "empty" &&
												ele?.status?.toLowerCase() !== "reserved" && (
													<div>
														<MdOutlineDinnerDining className="right-[5.5rem] top-6 absolute text-[1rem] opacity-50" />
														<div className="absolute right-20 bottom-6 text-sm font-[500] text-primary">
															{ele?.totalDishQuantity < 10
																? `0${ele?.deliverdDish}`
																: ele?.deliverdDish == null
																	? "00"
																	: ele?.deliverdDish}
														/
														{ele?.totalDishQuantity < 10
																? `0${ele?.totalDishQuantity}`
																: ele?.totalDishQuantity}
														</div>
													</div>
												)}
										</div>
									</Link>
								))}
							</>
						)}
				</div>
			</div>
		</div>
	);
};

export default memo(Table);
