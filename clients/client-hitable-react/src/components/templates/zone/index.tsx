import { startTransition, useEffect, useRef, useState } from "react";
import HiPalLogo from "@/assets/hipalLogoNew.svg";
import { MdMenuOpen } from "react-icons/md";
import { useLogin } from "@/components/store/useLogin";
import DayOutPopup from "@/components/atoms/dayoutPopup";
import { useBusinessStore } from "@/components/store/useBusinessData";
import { updateTheme } from "@/components/utils/themes";
import Loader from "@/components/atoms/loader";
import { useZoneStore } from "@/components/store/useZone";
import { useQuery } from "@tanstack/react-query";
import { IZoneData } from "@/components/types/hiTableData";
import { useNavigate, useParams } from "react-router-dom";
import axios from "@/components/utils/axios";
import { ICurrentView } from "@/pages/r/[businessId]/zone";
import { AxiosError } from "axios";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
interface IZoneProps {
	setCurrentView: (view: ICurrentView) => void;
}

function ZonesComponent({ setCurrentView }: IZoneProps) {
	const setZone = useZoneStore((state) => state.setZone);
	const { setSelectedZone } = useLogin();
	const businessData = useBusinessStore((s) => s.businessData);
	const navigate = useNavigate();
	const { userDetails, setIsLogin, isLogin, setZoneName } = useLogin();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const retryCount = useRef(0);
	const { businessId } = useParams<{ businessId: string }>();

	useEffect(() => {
		if (!businessId) {
			startTransition(() => {
				navigate("/");
			})
		}
	}, [businessId, navigate]);

	const handleToggle = () => {
		if (!isLogin) {
			setIsLogin(true);
		} else {
			setIsModalOpen(true);
		}
	};

	const logOut = () => {
		setIsLogin(false);
		setIsModalOpen(false);
	};

	const handleOnClick = (zone: IZoneData) => {
		setSelectedZone(zone);
		setZoneName(zone.zoneName);

		if (zone.zoneType === "Dine In") {
			startTransition(() => {
				navigate(
					routePaths[PAGE_TYPES.TABLES](businessId || zone.businessId, zone?._id),
				);
			})
		} else {
			setZone(zone);
			startTransition(() => {
				navigate(
					routePaths[PAGE_TYPES.TAKE_AWAY](
						businessId || zone.businessId,
						zone?._id,
					),
				);
			})
			updateTheme(zone.zoneName);
		}
	};

	const isTakeawayZone = (zoneType: string) =>
		zoneType?.toLowerCase().replace(/[-\s]/g, "") === "takeaway";

	const result = async () => {
		try {
			const response = await axios.get(
				`/v1/zones/getAllZoneByWaiter?businessId=${businessId}&waiterId=${userDetails?._id}`,
			);
			const zones = response.data.data;
			const orderedZones = zones.sort((a: IZoneData) =>
				isTakeawayZone(a.zoneType) ? 1 : -1,
			);

			updateTheme("normal");
			return orderedZones;
		} catch (error) {
			if ((error as AxiosError)?.response?.status === 401) {
				startTransition(()=>{
					navigate(`/r/${businessId}/login`);
				})
			}
		}
	};

	const {
		isLoading: zoneLoading,
		error,
		data: zones,
		refetch,
	} = useQuery({
		queryKey: ["zones", businessId],
		queryFn: result,
		enabled: !!businessId && !!isLogin && !!userDetails?._id,
	});

	const handleRetryClick = () => {
		retryCount.current += 1;
		if (retryCount.current >= 5) {
			startTransition(()=>{
				navigate(`/r/${businessId}/login`);
			})
		} else {
			refetch();
		}
	};

	const handleRoute = () => {
		startTransition(()=>{
			navigate(`/r/${businessId}/login`);
		})
	};

	if (zoneLoading) {
		return <Loader />;
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-screen">
				<button onClick={handleRoute} className="btn" type="button">
					Home
				</button>
				<button onClick={handleRetryClick} className="btn" type="button">
					Retry
				</button>
			</div>
		);
	}

	return (
		<div className="bg-secondary min-h-screen pb-[5rem] relative">
			<div className="sticky top-0 z-20 bg-secondary">
				<div className="flex justify-between ml-[1.5rem] pt-[2rem]">
					<img src={HiPalLogo} alt="Hi Table Logo" width={68} height={25} />
					<MdMenuOpen
						onClick={() => setCurrentView("setting")}
						className="mr-[1.5rem] text-2xl"
					/>
				</div>
				<div className="mx-[1.5rem] bg-base-100 rounded-2xl pb-[0.5rem] border border-base-300 mb-6 mt-[1.5rem]">
					<div className="flex justify-between">
						<div className="mt-4 ml-4">
							<span className="font-[400] text-base-content">Hello, </span>
							<span className="font-semibold capitalize text-base-content">
								{userDetails?.name}
							</span>
						</div>
					</div>
					<div className="mx-4 mt-2">
						<span className="font-[400] text-base-content text-[0.875rem] leading-[1rem]">
							You logged into{" "}
						</span>
						<span className="font-semibold capitalize text-base-content text-[0.875rem] leading-[1rem]">
							{businessData?.businessName}
						</span>
					</div>
					{isModalOpen && (
						<DayOutPopup
							show={isModalOpen}
							onClose={() => setIsModalOpen(false)}
						>
							<div className="pt-4 mt-6 ml-4 font-semibold">
								Are you sure, you want to Day-Out?
							</div>
							<div className="flex justify-between mx-12 mt-6 pb-9">
								<span onClick={() => setIsModalOpen(false)} className="text-sm">
									Cancel
								</span>
								<button
									type="button"
									onClick={logOut}
									className="px-6 py-2 -mr-6 text-sm text-base-100 bg-primary rounded-3xl"
								>
									Day Out
								</button>
							</div>
						</DayOutPopup>
					)}
					<div>
						<div className="flex items-center mx-[1rem] my-2 rounded-xl border border-primary/50">
							<button
								type="button"
								className={`relative capitalize flex w-full h-8 rounded-full transition-colors duration-300 ease-in-out ${isLogin ? "" : ""
									}`}
								onClick={handleToggle}
							>
								<span
									className={`absolute top-0.5 left-[0.125rem] bottom-0.5 w-[49.5%] h-7 transform transition-transform duration-300 ease-in-out rounded-xl ${isLogin ? "translate-x-full bg-green-500" : "bg-gray-300"
										}`}
								/>
								<div
									className={`absolute z-50 left-12 top-2 font-[400] text-[0.875rem] leading-[1rem] ${isLogin ? "text-primary" : "text-base-100"
										}`}
								>
									day out
								</div>
								<div
									className={`absolute z-50 right-14 top-2 font-[400] text-[0.875rem] leading-[1rem] ${isLogin ? "text-base-100" : "text-primary"
										}`}
								>
									day in
								</div>
							</button>
						</div>
					</div>
				</div>
				<span className="font-[500] ml-6 text-base-content text-sm">Zones</span>
			</div>
			<div className="grid gap-6 mx-6 mt-6 grid-col-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{zones?.map((ele: IZoneData) => (
					<div
						key={ele._id}
						onClick={() => handleOnClick(ele)}
						className={`flex justify-between items-center py-6 border border-base-300 rounded-xl ${isLogin ? "bg-base-100" : "bg-gray-200"
							}`}
					>
						<div
							className={`truncate pl-6 w-[70%] ${isLogin ? "font-[500]" : "font-[500] text-gray-400"
								}`}
						>
							<span>
								{ele.zoneName === "zomato" ? "Pick Up" : ele.zoneName}
							</span>
							<span className="ml-2 text-xs opacity-60">{ele.zoneType}</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default ZonesComponent;
