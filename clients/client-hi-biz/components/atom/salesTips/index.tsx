import { MdPerson } from "react-icons/md";
import { useRouter } from "next/router";
import { PAGE_TYPES, routePathsWithIds } from "@/components/utils/routes";
import { memo, useEffect } from "react";
import axios from "@/axios";
import { useStaff } from "@/components/store/useStaff";
import LoadingSpinner from "../loadingSpinner";
import { useQuery } from "@tanstack/react-query";

function SalesTips() {
	const router = useRouter();
	const { setSelectedWaiter } = useStaff();
	const { businessId } = router.query as { businessId: string };
	const handleClick = (str: string) => {
		setSelectedWaiter(str);
		router.push(routePathsWithIds[PAGE_TYPES.TIPS](businessId, str));
	};

	useEffect(() => {
		router.query.tab = "Tips";
		router.push(router);
	}, []);

	const getWaiterTips = async () => {
		try {
			const response = await axios.get(
				`/v1/payments/:id/tips?businessId=${businessId}`,
			);
			return response.data;
		} catch (e) {
			console.log(e);
		}
	};

	const {isLoading, error, data} = useQuery({
		queryKey: ["tips", businessId],
		queryFn: getWaiterTips,
		enabled: !!businessId,
	})

	if(isLoading) return <LoadingSpinner />
	if(error) return <div>Error: {error.message}</div>

	return (
		<div className="pb-[6rem] masonry-layout mt-6 mx-6">
			{data && data.length > 0 ? (
				data.map((tips: any, i: number) => (
					<div
						key={i}
						onClick={() => handleClick(tips.waiterName)}
						className="masonry-item on_active_bounce bg-white text-[#2B354D] rounded-lg border border-[#cacaca] font-medium capitalize"
					>
						<div className="flex items-center px-4 py-2">
							<MdPerson className="mr-2" />
							<span>{tips?.waiterName}</span>
						</div>
						<div className="flex items-center justify-between px-4 py-2">
							<span className="ml-1 text-sm opacity-60">
								Tips given for ₹ {tips?.tips}
							</span>
							<span>view</span>
						</div>
					</div>
				))
			) : (
				<div className="fixed transform -translate-x-1/2 top-1/2 left-1/2 text-center flex flex-col">
					No Tips Found
				</div>
			)}
		</div>
	);
}

export default memo(SalesTips);
