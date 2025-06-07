import CheckInUsers from "@/components/checkin";
import HeaderAlertsMemo from "@/components/liteAlerts/headerAlerts";

const CheckIn = () => {
  return (
    <main>
      <HeaderAlertsMemo hide />
      <CheckInUsers />
    </main>
  );
};

export default CheckIn;
