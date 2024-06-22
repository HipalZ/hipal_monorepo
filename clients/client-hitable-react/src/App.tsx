import { useQuery } from "@tanstack/react-query";
import { useHiClientZ } from "./components/store/useHiClientzData";
import { useLiteStore } from "./components/store/useLiteStore";
import axios from "./components/utils/axios";
import MainRouter from "./routes";

function App() {
	const { selectedBiz } = useHiClientZ();
	const businessId = selectedBiz?.businessId?._id;
	const { setOnlineAlertData, setOfflineAlertData } = useLiteStore();

	const fetchAlerts = async (alertType:string) => {
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
		}
	}

	const handleOnlineAlerts = async () => {
		const data = await fetchAlerts('ONLINE');
		setOnlineAlertData(data);
		return data;
	};

	const handleOfflineAlerts = async () => {
		const data = await fetchAlerts('ALL');
		setOfflineAlertData(data);
		return data;
	};

	useQuery({
		queryKey: ['onlineAlerts', businessId],
		queryFn: handleOnlineAlerts,
		enabled: !!businessId && !!selectedBiz && !!selectedBiz.bookMark,
		refetchInterval: 15000, // 15 seconds
	});
	
	useQuery({
		queryKey: ['offlineAlerts', businessId],
		queryFn: handleOfflineAlerts,
		enabled: !!businessId && !!selectedBiz && !!selectedBiz.bookMark,
		refetchInterval: 15000, // 15 seconds
	});

	return (
		<MainRouter />
	);
}

export default App;
