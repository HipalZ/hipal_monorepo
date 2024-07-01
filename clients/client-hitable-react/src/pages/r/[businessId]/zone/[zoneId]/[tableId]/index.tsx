import  {  Suspense, lazy, memo, useState } from "react";
import Loader from "@/components/atoms/loader";

const TablePos = lazy(() => import("@/components/templates/pos"));
const KickUser = lazy(() => import("@/components/templates/kick"));
const MergeTables = lazy(() => import("@/components/templates/merge"));
const Switch = lazy(() => import("@/components/templates/switch"));

function Pos() {
	const [currentView, setCurrentView] = useState<string>("pos");
	const renderCurrentView = () => {
		switch (currentView) {
			case "pos":
				return <TablePos setCurrentView={setCurrentView} />;
			case "kick":
				return <KickUser setCurrentView={setCurrentView} />;
			case "merge":
				return <MergeTables setCurrentView={setCurrentView} />;
			case "switch":
				return <Switch setCurrentView={setCurrentView} />;
			default:
				return <TablePos setCurrentView={setCurrentView} />;
		}
	};

	return (
		<Suspense fallback={<Loader />}>
			{renderCurrentView()}
		</Suspense>
	);
}

export default memo(Pos);
