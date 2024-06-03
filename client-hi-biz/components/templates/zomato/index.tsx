import Header from "@/components/molecules/header";
import type React from "react";
import { memo, useEffect, useState } from "react";
import Hi from "@/assets/svg/hi.svg";
import { BsChevronLeft } from "react-icons/bs";
import { toast } from "react-toastify";
import PopUp from "@/components/atom/popUp";
import { MdCurrencyExchange } from "react-icons/md";
import EditPasswordForDeleteDish from "@/components/molecules/editPasswordForDeleteDish";
import Switch from "react-switch";
import AddTax from "@/components/molecules/addTax";
import axios from "@/axios";
import { useRouter } from "next/router";
import type { IAddTax } from "../swiggy";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/components/errorComponent";

function Zomato() {
	const setSelectedIcon = useSelectedIcon((s) => s.setSelectedIcon);
	const [isLoading, setIsLoading] = useState(false);
	const [toggleSwitch, setToggleSwitch] = useState(false);
	const [isPasswordModalOpen, setPasswordIsModalOpen] = useState(false);
	const [isExtraChargesModalOpen, setExtraChargesIsModalOpen] = useState(false);
	const [isEditModalOpen, setEditIsModalOpen] = useState(false);
	const [editTax, setEditTax] = useState<IAddTax | null>(null);
	const [commissionName, setCommissionName] = useState<string | null>(null);
	const [commissionType, setCommissionType] = useState<string | null>(null);
	const [value, setValue] = useState<number | null>(null);
	const [typeOfValue, setTypeOfValue] = useState<string | null>("percentage");
	const [addCharges, setAddCharges] = useState<IAddTax[]>([]);
	const router = useRouter();
	const { businessId } = router.query as { businessId: string };
	function toggleLoyality() {
		setToggleSwitch(!toggleSwitch);
	}

	async function handleCreate(str: string) {
		if (!commissionName || !commissionType || !value || !typeOfValue) {
			toast.error("Please fill in all mandatory fields.");
			return;
		}
		setIsLoading(true);
		const body = {
			businessId: businessId,
			zoneName: "zomato",
			zoneType: "take-away",
			password: "1111",
			action: "add",
			charge: {
				chargeName: commissionName,
				chargeType: commissionType,
				value: value,
				typeOfValue: typeOfValue,
			},
		};

		try {
			const response = await axios.post(
				`${process.env.NEXT_PUBLIC_API_HOST}/v1/zones/545644155/swiggy`,
				body,
			);

			if (response.status === 200 || response.status === 201) {
				getAllTaxes();
				setCommissionName("");
				setCommissionType("");
				setValue(null);
				setExtraChargesIsModalOpen(false);
				toast.success("Successfully added!");
			} else {
				toast.error("There was an issue with your request.");
			}
		} catch (error) {
			console.error(error);
			toast.error("There was an error processing your request.");
		}
		setIsLoading(false);
	}
	async function handleEdit(str: string) {
		if (str.toLowerCase() === "save") {
			const body = {
				businessId: businessId,
				zoneName: "zomato",
				zoneType: "take-away",
				password: "1111",
				action: "update",
				chargeName: editTax?.chargeName,
				charge: {
					chargeName: commissionName ? commissionName : editTax?.chargeName,
					chargeType: commissionType ? commissionType : editTax?.chargeType,
					value: value ? value : editTax?.value,
					typeOfValue: typeOfValue ? typeOfValue : editTax?.typeOfValue,
				},
			};
			setIsLoading(true);
			try {
				const response = await axios.post(
					`${process.env.NEXT_PUBLIC_API_HOST}/v1/zones/545644155/swiggy`,
					body,
				);

				if (response.status === 200 || response.status === 201) {
					getAllTaxes();
					setEditIsModalOpen(false);
					toast.success("Successfully edited!");
				} else {
					toast.error("There was an issue with your request.");
				}
			} catch (error) {
				console.error(error);
				toast.error("There was an error processing your request.");
			}
		} else {
			const body = {
				businessId: businessId,
				zoneName: "zomato",
				action: "remove",
				chargeName: editTax?.chargeName,
			};

			try {
				const response = await axios.post(
					`${process.env.NEXT_PUBLIC_API_HOST}/v1/zones/545644155/swiggy`,
					body,
				);

				if (response.status === 200 || response.status === 201) {
					getAllTaxes();
					setEditIsModalOpen(false);
					toast.success("Successfully Delete!");
				} else {
					toast.error("There was an issue with your request.");
				}
			} catch (error) {
				console.error(error);
				toast.error("There was an error processing your request.");
			}
		}
		setIsLoading(false);
	}

	const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const enteredValue = Number(e.target.value);

		if (typeOfValue === "percentage" && enteredValue <= 100) {
			setValue(enteredValue);
		} else if (typeOfValue === "rupess" && enteredValue <= 500) {
			setValue(enteredValue);
		} else {
			toast.error(
				`The max value for ${
					typeOfValue === "percentage" ? "percentage" : "rupees"
				} is ${typeOfValue === "percentage" ? 100 : 500}`,
			);
		}
	};

	const changePassword = async (pass: string) => {
		if (pass.trim().length < 4) {
			toast.error("Please enter a password of at least 4 digits");
			return;
		}
	};

	const getAllTaxes = async () => {
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_HOST}/v1/zones?businessId=${businessId}&zomato=true`,
			);
			setAddCharges(response.data.addCharges);
			return response.data;
		} catch (error) {
			console.log(error);
		}
	};

	const {isLoading:isLoadingTaxes , error, data,refetch} = useQuery({
		queryKey:['allTaxes', businessId],
		queryFn: getAllTaxes,
		enabled:!!businessId
	})

	if(isLoadingTaxes) return <LoadingSpinner/>
	if(error) return <ErrorComponent refetch={refetch}/>

	return (
		<div className="relative">
			<div className="bg-[#f5f5f5] sticky z-20 top-0">
				<Header
					title="Zomato"
					onBack={() => setSelectedIcon("")}
					leftIcon={<BsChevronLeft />}
					centerImage={Hi}
					rightImage={Hi}
					isIconBusinessShow={true}
				/>
				<div className="flex justify-between items-center mt-6 px-6 pb-4 border-b border-[#cacaca]">
					<div className="flex text-2xl">
						<span className="">Zomato</span>
					</div>
				</div>
			</div>
			<div className="flex justify-between items-center mt-6 px-6 py-4 rounded-md border mx-6 border-[#cacaca]">
				<span>Activate</span>
				<Switch
					uncheckedIcon={false}
					checkedIcon={false}
					onChange={toggleLoyality}
					checked={addCharges?.length > 0 ? true : toggleSwitch}
					offColor="#CACACA"
				/>
			</div>
			<div className="mt-6 px-6 py-4 rounded-md border mx-6 border-[#cacaca]">
				<div>Password Manager</div>
				<div className="flex items-center justify-between mt-4">
					<span>Edit Item</span>
					<button
						type="button"
						onClick={() => setPasswordIsModalOpen(true)}
						className="px-4 on_active_bounce py-1 border border-[#2B354D] rounded-md"
					>
						Edit
					</button>
				</div>
			</div>
			{isPasswordModalOpen && (
				<PopUp
					show={isPasswordModalOpen}
					onClose={() => setPasswordIsModalOpen(false)}
				>
					<EditPasswordForDeleteDish
						heading="Password for removing items"
						closeModal={() => setPasswordIsModalOpen(false)}
						changePassword={changePassword}
					/>
				</PopUp>
			)}
			<div className="mt-6 px-6 py-4 rounded-md border mx-6 border-[#cacaca]">
				<div className="flex items-center justify-between">
					<span>Add charges</span>
					<button
						type="button"
						onClick={() => setExtraChargesIsModalOpen(true)}
						className="px-4 on_active_bounce py-1 border border-[#2B354D] rounded-md"
					>
						Add
					</button>
				</div>
				{addCharges?.length > 0 &&
					addCharges?.map((charge, index) => (
						<div
							onClick={() => {
								setEditTax(charge);
								setEditIsModalOpen(true);
							}}
							key={index}
							className="border border-[#cacaca] rounded-md mt-4 p-2"
						>
							<div className="flex items-center">
								<MdCurrencyExchange className="mr-2" />
								{charge?.chargeName}
							</div>
							<div className="flex justify-between mt-2 item-center">
								<div className="opacity-50">
									{charge?.value}
									{charge?.typeOfValue === "percentage" ? "%" : ""}{" "}
									{charge?.chargeType}
								</div>
								<div className="text-[#2F80ED]">Remove</div>
							</div>
						</div>
					))}
			</div>
			{isExtraChargesModalOpen && (
				<PopUp
					show={isExtraChargesModalOpen}
					onClose={() => setExtraChargesIsModalOpen(false)}
				>
					<AddTax
						heading="Add Taxes and Charges"
						editTax={editTax}
						edit={false}
						commissionName={commissionName}
						commissionType={commissionType}
						value={value}
						typeOfValue={typeOfValue || "percentage"}
						handleValueChange={handleValueChange}
						setCommissionName={setCommissionName}
						setCommissionType={setCommissionType}
						setTypeOfValue={setTypeOfValue}
						handleCreate={handleCreate}
						handleEdit={handleEdit}
					/>
				</PopUp>
			)}
			{isEditModalOpen && (
				<PopUp show={isEditModalOpen} onClose={() => setEditIsModalOpen(false)}>
					<AddTax
						heading="Edit Taxes and Charges"
						edit={true}
						editTax={editTax}
						commissionName={commissionName}
						commissionType={commissionType}
						value={value}
						typeOfValue={typeOfValue || "percentage"}
						handleValueChange={handleValueChange}
						setCommissionName={setCommissionName}
						setCommissionType={setCommissionType}
						setTypeOfValue={setTypeOfValue}
						handleCreate={handleEdit}
						handleEdit={handleEdit}
					/>
				</PopUp>
			)}
      {isLoading && <LoadingSpinner/>}
		</div>
	);
}

export default memo(Zomato);
