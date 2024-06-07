import Header from "@/components/molecules/header";
import type React from "react";
import { memo, useState } from "react";
import { BsChevronLeft } from "react-icons/bs";
import Hi from "@/assets/svg/hi.svg";
import PopUp from "@/components/atom/popUp";
import useAddOnStore, { type Variant } from "@/components/store/useAddOn";
import VariantComponent from "@/components/molecules/addVariantPopup";
import { toast } from "react-toastify";
import axios from "@/axios";
import { useRouter } from "next/router";
import DeleteConfirmationModal from "@/components/atom/deleteUser";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/components/errorComponent";
import LoadingSpinner from "@/components/atom/loadingSpinner";

const EditAddOn = () => {
	const [isAddOnTypeModalOpen, setIsAddOnTypeModalOpen] = useState(false);
	const [deletePopup, setDeletePopup] = useState(false);
	const [storeDeleteVariant, setStoreDeleteVariant] = useState<Variant>({});
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const { addOnId, businessId } = router.query as {
		businessId: string;
		addOnId: string;
	};
	const {
		addOnName,
		setAddOnName,
		addOnType,
		setAddOnType,
		setSelections,
		setNoOfOptions,
		maxQuantity,
		setMaxQuantity,
		compulsoryQuantity,
		setCompulsoryQuantity,
		variants,
		deleteVariant,
		setCurrentVariant,
		setVariants,
	} = useAddOnStore();
	const [errorCompulsory, setErrorCompulsory] = useState(false);
	const [errorMaxQty, setErrorMaxQty] = useState(false);
	const openModal = () => {
		if (addOnType) {
			setIsAddOnTypeModalOpen(true);
		} else {
			toast.error("please select add on type");
		}
	};

	const handleDeleteVariant = (variant: Variant) => {
		setDeletePopup(true);
		setStoreDeleteVariant((prev) => {
			return { ...prev, id: variant?._id, name: variant?.name };
		});
	};
	const handleEditVariant = (variant: Variant) => {
		setCurrentVariant(variant);
		openModal();
	};

	const saveAddOn = async () => {
		if (variants.length === 0) {
			toast.error("Please add variants");
			return;
		}
		setLoading(true);
		try {
			const config = {
				method: "PUT",
				url: `/v1/dishes/:id/extra/${addOnId}`,
				data: {
					businessId: businessId,
					name: addOnName,
					numOptions: maxQuantity,
					numSelections: maxQuantity,
					compulsory: compulsoryQuantity,
					maxQuantity: maxQuantity,
					addOnType: addOnType,
					items: variants,
				},
			};
			const response = await axios(config);
			toast.success("Add on added successfully");
      router.push(`/business/${businessId}?tab=items`)
		} catch (error) {
			console.log(error);
		}
		setLoading(false);
	};

	const handleMaxQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let newValue = Number.parseFloat(e.target.value) || 0;
		newValue = Math.max(newValue, 0);
		
		  if(compulsoryQuantity > newValue){
			setCompulsoryQuantity(0)
			setMaxQuantity(newValue);
			setErrorMaxQty(true)
			setTimeout(() => {
			  setErrorMaxQty(false)
			}, 3500)
			return
		  }
		  setMaxQuantity(newValue);
		  setErrorMaxQty(false)
	};
	const handleCompulsoryQuantityChange = (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		let newValue = Number.parseFloat(e.target.value) || 0;
		newValue = Math.max(newValue, 0);
		if (maxQuantity < Number(e.target.value)) {
			setErrorCompulsory(true)
			setTimeout(() => {
			  setErrorCompulsory(false)
			}, 3500)
			return
		  }
		  setCompulsoryQuantity(newValue);
		  setErrorCompulsory(false)
		setCompulsoryQuantity(newValue);
	};

	const getAddOn = async () => {
		try {
			const getSingleAddOn = await axios.get(
				`/v1/dishes/:id/getExtra/${addOnId}`,
			);
			const data = getSingleAddOn.data;
			setAddOnName(data.name);
			setAddOnType(data.addOnType);
			setSelections(data.numSelections);
			setNoOfOptions(data.numOptions);
			setMaxQuantity(data.maxQuantity);
			setCompulsoryQuantity(data.compulsory);
			setVariants(data.items);
			return data;
		} catch (error) {
			console.log(error);
		}
	};

	const {isLoading, error, data:addonData, refetch} = useQuery({
		queryKey: ['addOn', addOnId],
		queryFn: getAddOn,
		enabled: !!addOnId,
	})
	function deleteItem() {
		deleteVariant(storeDeleteVariant?._id);
		setDeletePopup(false);
	}

	if(error) return <ErrorComponent refetch={refetch}/>
	return (
		<>
		{isLoading && <LoadingSpinner/>}
		<div className="pb-[7rem]">
			<div className="bg-[#f5f5f5] sticky z-20 top-0">
				<Header
					title="AddOn"
					onBack={() => router.push(`/business/${businessId}?tab=items`)}
					leftIcon={<BsChevronLeft />}
					centerImage={Hi}
					rightImage={Hi}
					isIconBusinessShow={false}
				/>
				<div className="flex justify-between items-center mt-6 px-6 pb-4 border-b border-[#cacaca]">
					<div className="flex text-2xl">
						<span className="">Edit a Add On</span>
					</div>
				</div>
			</div>
			<div className="px-4 mt-4 space-y-2">
				<span className="font-medium">Name of the Add On</span>
				<input
					onChange={(e) => {
						setAddOnName(e.target.value);
					}}
					maxLength={24}
					value={addOnName || ""}
					type="text"
					id="floating_outlined"
					className="block w-full pt-2 pb-2 pl-4 pr-[7rem] mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border-gray-800 rounded-md border dark:text-white focus:outline-none focus:ring-0 focus:border-[#2B354D] dark:border-[#2B354D] peer"
					placeholder="Name"
				/>
			</div>
			<div className="px-4 mt-4 space-y-2">
				<div className="flex items-center justify-between">
					<span className="font-medium">Add On Type</span>
				</div>
				<select
					value={addOnType}
					onChange={(e) => setAddOnType(e.target.value)}
					className="border w-full border-[#2B354D] py-2 rounded-md px-4 focus:border-[#2B354D] focus:outline-none focus:ring-0"
				>
					<option value="">Select Type</option>
					<option value="single">Single selection</option>
					<option value="multiple">Quantity based selection</option>
				</select>
			</div>
			<div className="flex">
			<div className="px-4 mt-4 space-y-2">
				<span className="font-medium">Max quantity choices</span>
				<input
					onChange={handleMaxQuantityChange}
					value={maxQuantity || ""}
					maxLength={3}
					type="tel"
					id="floating_outlined"
					className="block w-full pt-2 pb-2 pl-4 pr-[7rem] mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border-gray-800 rounded-md border dark:text-white focus:outline-none focus:ring-0 focus:border-[#2B354D] dark:border-[#2B354D] peer"
					placeholder="0"
				/>
				{errorMaxQty ? <small className="text-red-500">*Max quantity cannot be more than selections and less than compulsory</small> : null}
			</div>
			<div className="px-4 mt-4 space-y-2">
				<span className="font-medium">Compulsory choices</span>
				<input
					onChange={handleCompulsoryQuantityChange}
					value={compulsoryQuantity || ''}
					maxLength={3}
					type="tel"
					id="floating_outlined"
					className="block w-full pt-2 pb-2 pl-4 pr-[7rem] mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border-gray-800 rounded-md border dark:text-white focus:outline-none focus:ring-0 focus:border-[#2B354D] dark:border-[#2B354D] peer"
					placeholder="0"
				/>
				{errorCompulsory ? <small className="text-red-500">* Compulsory quantity cannot be more than max quantity and selections</small> : null}
			</div>
			</div>
			<div className="flex justify-between px-4 mt-4">
				<span className="font-medium">Variant</span>
				<button
					type="button"
					onClick={openModal}
					className="px-4 py-1 border border-[#2B354D] rounded-md on_active_bounce"
				>
					Add
				</button>
			</div>
			<div
				className={`${
					variants.length === 0 ? "" : "border border-[#2B354D]"
				}  rounded-md mx-4 mt-4 p-4 space-y-2`}
			>
				{variants.map((variant) => (
					<div
						key={variant._id}
						className="border border-[#cacaca] rounded-md p-2"
					>
						<div className="truncate w-48">{variant?.name}</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2 text-sm opacity-80">
								<span>x {variant?.maxQuantity}</span>
								<span>₹ {variant.price}</span>
							</div>
							<div className="flex items-center space-x-4">
								<button
									type="button"
									onClick={() => handleEditVariant(variant)}
								>
									Edit
								</button>
								<button
									type="button"
									className="text-[#2F80ED]"
									onClick={() => handleDeleteVariant(variant)}
								>
									Delete
								</button>
							</div>
						</div>
					</div>
				))}
			</div>
			{/* </form> */}
			{isAddOnTypeModalOpen && (
				<PopUp
					show={isAddOnTypeModalOpen}
					onClose={() => setIsAddOnTypeModalOpen(false)}
				>
					<VariantComponent compulsoryQuantity={compulsoryQuantity} onClose={() => setIsAddOnTypeModalOpen(false)} />
				</PopUp>
			)}
			{deletePopup && (
				<PopUp show={deletePopup} onClose={() => setDeletePopup(false)}>
					<DeleteConfirmationModal
						text={`Are you sure you want to delete ${storeDeleteVariant?.name}?`}
						closeModal={() => setDeletePopup(false)}
						onDelete={() => deleteItem()}
					/>
				</PopUp>
			)}
			<div
				onClick={saveAddOn}
				className={`${loading ? 'pointer-events-none opacity-50': ''} fixed bottom-0 w-full p-4 outline-none cursor-pointer on_active_bounce`}
			>
				<button
					type="button"
					className={"bg-[#2B354D] w-full py-2 rounded-md text-white"}
				>
					{loading ? 'Loading...' : 'Save'}
				</button>
			</div>
		</div>
		</>
	);
};

export default memo(EditAddOn);
