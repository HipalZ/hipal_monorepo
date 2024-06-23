import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import LoadingSpinner from "./components/atoms/loadingSpinner";
import { useHiClientZ } from "./components/store/useHiClientzData";
import { useLiteStore } from "./components/store/useLiteStore";
import axios from "./components/utils/axios";
import MainRouter from "./routes";

function App() {
	const { selectedBiz } = useHiClientZ();
	const location = useLocation();
	const isAlerts = location.pathname.includes("alerts");
	const businessId = selectedBiz?.businessId?._id;
	const { loading, setOnlineAlertData, setOfflineAlertData, setRefetchOnlineAlerts, setRefetchOfflineAlerts,setLoading  } = useLiteStore();

	const fetchAlerts = async (alertType: string) => {
		setLoading(true)
		try {
			const config = {
				method: "GET",
				url: `/v1/payments/:id/paymentAlerts?businessId=${businessId}&alertType=${alertType}`,
			};
			const response = await axios(config);
			if (response.status === 200) {
				return response.data.data;
			} else {
				return [];
			}
		} catch (err) {
			console.log(err);
			return [];
		}finally{
			setLoading(false)
		}
	}

	const handleOnlineAlerts = async () => {
		const data = await fetchAlerts("ONLINE");
		setOnlineAlertData(data);
		setRefetchOnlineAlerts(refetchOnlineAlerts);
		return data;
	};

	const handleOfflineAlerts = async () => {
		const data = await fetchAlerts("ALL");
		setOfflineAlertData(data);
		setRefetchOfflineAlerts(refetchOfflineAlerts);
		return data;
	};

	const { refetch: refetchOnlineAlerts } = useQuery({
		queryKey: ["onlineAlerts", businessId],
		queryFn: handleOnlineAlerts,
		enabled: !!businessId && !!selectedBiz && !!selectedBiz.bookMark,
		refetchInterval: 15000, // 15 seconds
	});

	const { refetch: refetchOfflineAlerts } = useQuery({
		queryKey: ["offlineAlerts", businessId],
		queryFn: handleOfflineAlerts,
		enabled: !!businessId && !!selectedBiz && !!selectedBiz.bookMark,
		refetchInterval: 15000, // 15 seconds
	});

	return (
		<>
			<MainRouter />
			{loading && isAlerts ? <LoadingSpinner/> : null}
		</>
	);
}

export default App;
