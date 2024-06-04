import { PAGE_TYPES, routePathsWithIds } from "@/components/utils/routes";
import { useRouter } from "next/router";
import React, { memo, useEffect, useState } from "react";
import { MdPerson, MdAdd } from "react-icons/md"; // Assuming you are using 'react-icons/md'
import PopUp from "../popUp";
import AddPersonInDue from "../addPersonInDue";
import type { SaleDuesResponse } from "@/components/types/businessData";
import axios from "@/axios";
import { useSelectedButtonStore } from "@/components/store/useSelectBtn";
import LoadingSpinner from "../loadingSpinner";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/components/errorComponent";

interface IDuesPersons {
	_id: string;
	businessId: string;
	duesPersonNames: string;
	id: string;
}

const SalesDues = ({ initialData,isLoadingDues }: { initialData: SaleDuesResponse, isLoadingDues: boolean }) => {
	const router = useRouter();
	const setSelectedButton = useSelectedButtonStore((s) => s.setSelectedButton);
	const { businessId } = router.query as { businessId: string };
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [duesPersons, setDuesPersons] = useState<IDuesPersons[]>();
	const openModal = () => {
		setIsModalOpen(true);
	};
	const closeModal = () => {
		setIsModalOpen(false);
		getDues();
	};

	const handleClick = (str: string) => {
		router.push(routePathsWithIds[PAGE_TYPES.DUES](businessId, str));
	};
	const getDues = async () => {
		try {
			const res = await axios.get(
				`/v1/payments/Get/Dues?businessId=${businessId}`,
			);
			setDuesPersons(res.data);
			return res.data;
		} catch (error) {
			console.log(error);
		}
	};

	const {isLoading, error, data:duesPData, refetch} = useQuery<IDuesPersons[]>({
		queryKey: ["dues", businessId],
		queryFn: getDues,
		refetchOnWindowFocus: false,	
		enabled: !!businessId ,
	})

	useEffect(() => {
		if (router.query.tab !== "Dues") {
		  router.push({
			pathname: router.pathname,
			query: { ...router.query, tab: "Dues" },
		  });
		}
		setSelectedButton("Dues");
	  }, [router.query, router.pathname]);

	if(error) return <ErrorComponent refetch={refetch}/>

	return (
		<div>
			{initialData && (
				<div className="mx-6 mt-6 bg-[#204D42] text-white p-4 rounded-lg">
					<div className="pb-2 text-xs">Total Dues</div>
					<div className="text-3xl font-normal">₹ {initialData.totalDues}</div>
				</div>
			)}
			<div className="pb-[6rem] masonry-layout mx-6 mt-6">
				{duesPersons
					? duesPersons.map((due) => (
						<div
							key={due?._id}
							onClick={() => handleClick(due?._id)}
							className=" on_active_bounce masonry-item bg-white text-[#2B354D] rounded-lg border border-[#cacaca] font-medium capitalize"
						>
							<div className="flex items-center px-4 py-2">
								<MdPerson className="mr-2" />
								<span>{due?.duesPersonNames}</span>
							</div>
							<div className="flex items-center justify-end px-4 py-2">
								<span>view</span>
							</div>
						</div>
					))
					: null}
			</div>
			<div
				onClick={openModal}
				className="fixed flex items-center justify-center w-full px-6 bottom-6"
			>
				<button
					type="button"
					className="bg-white w-full text-[#2B354D] border font-semibold on_active_bounce border-[#2B354D] px-4 py-2 rounded-lg mt-4"
				>
					<div className="flex items-center justify-center">
						<MdAdd className="mr-2" />
						Add a person
					</div>
				</button>
			</div>
			{isModalOpen && (
				<PopUp show={isModalOpen} onClose={closeModal}>
					<AddPersonInDue closeModal={closeModal} />
				</PopUp>
			)}
			{(isLoadingDues || isLoading) && <LoadingSpinner />}
		</div>
	);
};

export default memo(SalesDues);
