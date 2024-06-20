import TestFooter from "@/components/molecules/testFooter";
import { Suspense, lazy, useState, startTransition } from "react";
import Loader from "@/components/atoms/loader";
import Header from "@/components/molecules/header";
import HiPalLogo from "@/assets/svg/hipalLogoNew.svg";
import { useNavigate, useParams } from "react-router-dom";

const Table = lazy(() => import("@/components/templates/table"));
const Alert = lazy(() => import("@/components/templates/alert"));
const Orders = lazy(() => import("@/components/templates/order"));
const Status = lazy(() => import("@/components/templates/status"));
const History = lazy(() => import("@/components/templates/history"));

function Test() {
	const [currentView, setCurrentView] = useState("table");
	const navigate = useNavigate();
	const params = useParams<{ businessId: string }>();
	const businessId = params.businessId;
	const renderCurrentView = (currentView:string) => {
		switch (currentView) {
			case "table":
				return <Table />;
			case "alert":
				return <Alert  />;
			case "order":
				return <Orders setCurrentView={setCurrentView} />;
			case "status":
				return <Status />;
			case "history":
				return <History setCurrentView={setCurrentView} />;
			default:
				return <Table />;
		}
	};
	const goBack = () => {
		switch (currentView) {
			case "table":
				startTransition(()=>{
					navigate(`/r/${businessId}/zone`);
				})
				break;
			case "alert":
				setCurrentView("table");
				break;
			case "order":
				setCurrentView("table");
				break;
			case "status":
				setCurrentView("table");
				break;
			case "history":
				setCurrentView("table");
				break;
			default:
				startTransition(()=>{
					navigate(`/r/${businessId}/zone`);
				})
				break;
		}
	};
	return (
		<div className="relative min-h-screen bg-secondary">
			<Header goBack={goBack}>
				<img
					className="mr-6"
					width={68}
					height={25}
					src={HiPalLogo}
					alt="Hi Table Logo"
				/>
			</Header>
			<Suspense fallback={<Loader />}>{renderCurrentView(currentView)}</Suspense>
			<TestFooter currentView={currentView} setCurrentView={setCurrentView} />
		</div>
	);
}

export default Test;
