import Header from "@/components/molecules/header";
import type React from "react";
import { memo, useState } from "react";
import { BsChevronLeft, BsFillPersonFill } from "react-icons/bs";
import { RiExchangeDollarLine } from "react-icons/ri";
import Hi from "@/assets/svg/hi.svg";
import PopUp from "@/components/atom/popUp";
import ACCharges from "@/components/atom/acCharges";
import AddTables from "@/components/atom/addTable";
import axios from "@/axios";
import { paths } from "@/components/utils/paths";
import { useRouter } from "next/router";
import type {
	ICharges,
	IDineIn,
	IStaffs,
	ITables,
	IZones,
} from "@/components/types/businessData";
import { toast } from "react-toastify";
import AddZoneStaffs from "@/components/atom/addZoneStaffs";
import { zoneType } from "@/components/utils/helper";

export const classCard = {
	text: "text-xl",
	background: "bg-[#2B354D]",
	font: "text-4xl",
	bg: "bg-[#2F80ED]/10",
	color: "text-white",
};
const AddZone = () => {
	const router = useRouter();
	const { businessId } = router.query as { businessId: string };
	const [zoneData, setZoneData] = useState<IZones>({
		businessId: businessId,
		zoneName: "",
		zoneType: "select a zone type",
		startTime: "10:00",
		endTime: "10:00",
		staff: [],
		tables: [],
		Occupied: 0,
		charges: [],
	});
	const [staffs, setStaffs] = useState<IStaffs[]>([]);
	const [postStaffs, setPostStaffs] = useState<IStaffs[]>([]);
	const [postCharges, setPostCharges] = useState<ICharges[]>([]);
	const [acCharge, setAcCharge] = useState<ICharges[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [addModalOpen, setAddModalOpen] = useState(false);
	const [tableModal, setTableModal] = useState(false);
	const [data, setData] = useState<IDineIn | any>({
		tables: [],
		zones: [],
		staffs: [],
		charges: [],
	});
	const fetchChargesData = async () => {
		try {
			const charges = await axios.get(paths.getChargesApi(businessId));
			setAcCharge(charges?.data || []);
			setData({ charges: charges?.data });
		} catch (err) {
			console.log(err);
		}
	};
	const fetchStaffData = async () => {
		try {
			const staffs = await axios.get(paths.getStaffApi(businessId));
			setStaffs(staffs?.data || []);
			setData({ staffs: staffs?.data });
		} catch (err) {
			console.log(err);
		}
	};
	const postZoneData = async () => {
		if (
			zoneData?.zoneType === "select a zone type" ||
			zoneData?.zoneName === ""
		) {
			return toast.error("Please fill the details");
		}

		try {
			const config = {
				url: paths.postZonesApi(),
				method: "POST",
				mode: "cors",
				headers: {
					"Content-Type": "application/json",
				},
				data: zoneData,
			};
			const response = await axios(config);
			if (response?.status === 201 || response?.status === 200) {
				setZoneData(response?.data);
				toast.success("zone successfully created");
        router.push(`/business/${businessId}`);
			}
		} catch (err) {
			console.log(err);
		}
	};
	const closeModal = () => {
		setIsModalOpen(false);
	};
	const closeACModal = () => {
		setAddModalOpen(false);
	};
	async function addStaff() {
		setIsModalOpen(true);
		if (data?.staffs?.length > 0) return;
		fetchStaffData();
	}
	async function createZone() {
		await postZoneData();
	}

	async function addACCharges() {
		setAddModalOpen(true);
		if (data?.charges?.length > 0) return;
		fetchChargesData();
	}
	function closeTableModal() {
		setTableModal(false);
	}
	function handleAddStaff(activeClick: IStaffs[]) {
		const staffIds = activeClick.map((staff: IStaffs) => staff.id);
		setPostStaffs(activeClick);
		setZoneData((prevZone) => {
			return {
				...prevZone,
				staff: staffIds,
			};
		});
		setIsModalOpen(false);
	}
	function removeStaff(indexToRemove: number) {
		setPostStaffs((prev: IStaffs[]) =>
			prev.filter((pre: IStaffs, index: number) => index !== indexToRemove),
		);
	}
	function handleACCharges(activeClick: ICharges[]) {
		setPostCharges(activeClick);
		setZoneData((prevZone) => {
			return {
				...prevZone,
				charges: activeClick,
			};
		});
		setAddModalOpen(false);
	}
	function removeACCharges(indexToRemove: number) {
		setPostCharges((prev: ICharges[]) =>
			prev.filter((_, index: number) => index !== indexToRemove),
		);
	}
	function handleAddZone(e: React.ChangeEvent<HTMLInputElement>) {
		setZoneData((prevZone) => {
			return {
				...prevZone,
				zoneName: e.target.value,
			};
		});
	}
	function handleAddType(e: React.ChangeEvent<HTMLSelectElement>) {
		setZoneData((prevZone) => {
			return {
				...prevZone,
				zoneType: e.target.value,
			};
		});
	}
	return (
		<>
			<div className="bg-[#f5f5f5] sticky z-20 top-0">
				<Header
					title="Zone"
					leftIcon={<BsChevronLeft />}
					centerImage={Hi}
					rightImage={Hi}
					isIconBusinessShow={true}
				/>
				<div className="flex justify-between items-center mt-6 px-6 pb-4 border-b border-[#cacaca]">
					<div className="flex text-2xl">
						<span className="ml-2">Add a Zone</span>
					</div>
				</div>
			</div>
			<div className="pb-[10rem]">
				<div className="rounded-lg mx-6 my-6 border border-1 border-[#CACACA] px-4">
					<div className="my-4">
						<h1 className="my-4 text-base">
							Name of the zone <span className="text-red-500">*</span>
						</h1>
						<input
							onChange={(e) => handleAddZone(e)}
							value={zoneData?.zoneName}
							className="w-full rounded-md"
							type="text"
							placeholder="Name"
						/>
						<div className="mt-4 font-medium">
							Zone Type <span className="text-red-500">*</span>
						</div>
						<div className="relative w-full">
							<select
								onChange={(e) => handleAddType(e)}
								value={zoneData?.zoneType}
								className="w-full p-2 my-2 border rounded-md"
							>
								{zoneType?.map((zone: any) => (
									<option
										className="!bg-white !text-[#2B354D]"
										key={zone?.id}
										value={zone?.type}
									>
										{zone?.type}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>
				<div className="rounded-lg mx-6 my-6 border border-1 border-[#CACACA] px-4">
					<div className="flex justify-between my-4">
						<h1>Staff in the zone</h1>
						<div onKeyDown={addStaff} onClick={addStaff}>
							<button
								type="button"
								className="px-4 py-1 border rounded-md on_active_bounce border-1 "
							>
								Add
							</button>
						</div>
					</div>
					{postStaffs?.map((staff: IStaffs, index: number) => {
						return (
							<div
								key={staff?.id}
								className="p-3 my-4 border rounded-md border-1"
							>
								<div className="flex items-center">
									<BsFillPersonFill />
									<h1 className="mx-2 text-base">{staff?.name}</h1>
								</div>
								<div className="flex justify-between mt-4">
									<p className="text-sm text-[#2B354D]/70">
										{staff?.customRole?.[0]?.roleName}
									</p>
									<button
										type="button"
										onClick={() => removeStaff(index)}
										className="on_active_bounce text-[#2F80ED]"
									>
										Remove
									</button>
								</div>
							</div>
						);
					})}
				</div>
				<div className="rounded-lg mx-6 my-6 border border-1 border-[#CACACA] px-4">
					<div className="flex justify-between my-4">
						<h1 className="text-base text-[#2B354D]">Add Charges</h1>
						<div>
							<button
								type="button"
								onClick={addACCharges}
								className="px-4 py-1 border rounded-md on_active_bounce border-1 "
							>
								Add
							</button>
						</div>
					</div>
					{postCharges?.map((acChar: ICharges, index: number) => {
						return (
							<div
								key={acChar?.id}
								className="p-3 my-4 border rounded-md border-1"
							>
								<div className="flex items-center">
									<RiExchangeDollarLine />
									<h1 className="mx-2 capitalize">{acChar?.chargeName}</h1>
								</div>
								<div className="flex justify-between mt-4">
									<p className="text-sm text-[#2B354D]/70">
										{acChar?.value}% on billing
									</p>
									<button
										type="button"
										onClick={() => removeACCharges(index)}
										className="text-[#2F80ED]"
									>
										Remove
									</button>
								</div>
							</div>
						);
					})}
				</div>
				<div className="fixed w-full px-6 bottom-5">
					<button
						type="button"
						onClick={createZone}
						className="on_active_bounce text-white rounded-md bg-[#2B354D] py-2.5 w-full"
					>
						Save
					</button>
				</div>
				{isModalOpen && (
					<PopUp show={isModalOpen} onClose={closeModal}>
						<AddZoneStaffs
							handleData={handleAddStaff}
							Data={staffs}
							selectedData={postStaffs}
						/>
					</PopUp>
				)}
				{addModalOpen && (
					<PopUp show={addModalOpen} onClose={closeACModal}>
						<ACCharges
							handleACCharges={handleACCharges}
							acCharges={acCharge}
							selectedData={postCharges}
						/>
					</PopUp>
				)}
				{tableModal && (
					<PopUp show={tableModal} onClose={closeTableModal}>
						<AddTables
							zoneId={zoneData?.id}
							closeModal={closeTableModal}
							postStaffs={postStaffs}
							setTableModal={setTableModal}
							tableModal={tableModal}
						/>
					</PopUp>
				)}
			</div>
		</>
	);
};

export default memo(AddZone);
