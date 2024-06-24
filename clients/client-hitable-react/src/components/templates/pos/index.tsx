import  { lazy, startTransition, useEffect, useRef, useState } from "react";
import { useTable } from "@/components/store/useTable";
import SearchComponent from "@/components/molecules/searchPanel";
import { useSearch } from "@/components/store/useSearch";
import { useCategoryStore } from "@/components/store/useCategoryData";
import Loader from "@/components/atoms/loader";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "@/components/utils/axios";

const TableHeader = lazy(() => import("@/components/molecules/tableHeader"));
const HeaderButtonGroup = lazy(() => import("@/components/molecules/headerButtonGroup"));
const DishStatusComponent = lazy(() => import("@/components/organisms/dishStatus"));
const POSComponent = lazy(() => import("@/components/organisms/pos"));
const Settle = lazy(() => import("@/components/organisms/settle"));

interface IProps {
	setCurrentView: (view: string) => void;

}

function TablePos({ setCurrentView }: IProps) {
	/********************* Using in settle pos and settle *************************/
	const [activeButton, setActiveButton] = useState("");
	const { data, saveCategories } = useCategoryStore();
	const retryCount = useRef(0);
	const search = useSearch((s) => s.searchText);
	const setSearch = useSearch((s) => s.setSearchText);
	const [searchOpen, setSearchOpen] = useState(false);
	const tableData = useTable((s) => s.tableData);
	const navigate = useNavigate();
	const params = useParams<{ businessId: string; zoneId: string; tableId:string}>();
	const { businessId, zoneId } = params;
	const tableStatus = useTable((s) => s.tableData.status);

	const popOver = (search = "") => {
		if (search.length > 0) {
			if (!searchOpen) {
				setSearchOpen(true);
			}
		} else {
			setSearchOpen(false);
		}
	};

	const handleInputChange = (value: string) => {
		setSearch(value);
		popOver(value);
	};

	const handleOnClick = (str: string) => {
		setActiveButton(str);
	};
	const category = async () => {
		try {
			const response = await axios(
				`/v1/categories/All/Categories?businessId=${businessId}`,
			);
			const { allCategoriesTypes, categories } = response.data.data;
			const data = {
				allCategoriesTypes,
				categories,
			};
			saveCategories(data);
			return data;
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const isEdit = urlParams.has("edit");

		if (isEdit) {
			setActiveButton("pos");
		} else if (tableStatus?.toLowerCase() !== "active") {
			setActiveButton("pos");
		} else {
			setActiveButton("status");
		}
	}, []);

	const {
		isLoading,
		error,
		data: categoryData,
	} = useQuery({
		queryKey: ["category", businessId],
		queryFn: category,
		enabled: !!businessId,
	});


	const handleRetryClick = () => {
		retryCount.current += 1;
		if (retryCount.current >= 5) {
			startTransition(()=>{
				navigate(`/r/${businessId}/login`);
			})
		} else {
			category();
		}
	};
	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader />
			</div>
		);
	}
	if (error) {
		<div className="flex items-center justify-center h-screen">
			<Link to={`/r/${businessId}/login`}>
				<button className="btn" type="button">
					Home
				</button>
			</Link>
			<button onClick={handleRetryClick} className="btn" type="button">
				Retry
			</button>
		</div>;
	}

	return (
		<div className="relative min-h-screen bg-secondary sticky-header">
			<div
				className={`${
					activeButton.toLowerCase() === ""
						? ""
						: "sticky top-0 z-40 bg-secondary w-full px-6 space-y-4"
				} `}
			>
				<TableHeader
					setCurrentView={setCurrentView}
					businessId={businessId || ""}
					zoneId={zoneId || ""}
				>
					<div className="text-xl font-bold capitalize text-base-content">
						{tableData.name}
					</div>
				</TableHeader>

				<HeaderButtonGroup
					activeButton={activeButton}
					onButtonClick={handleOnClick}
					showPos={true}
				/>

				<SearchComponent
					activeButton={activeButton}
					onSearch={(value) => handleInputChange(value)}
				/>
			</div>
			{activeButton.toLowerCase() === "status" && (
				<DishStatusComponent activeButton={activeButton} />
			)}
			{activeButton.toLowerCase() === "pos" && (
				<POSComponent data={categoryData} activeButton={activeButton} search={search} />
			)}
			{activeButton.toLowerCase() === "settle" && (
				<Settle activeButton={activeButton} />
			)}
		</div>
	);
}

export default TablePos;
