import { useNavigate, useParams } from "react-router-dom";
import { FaBell, FaMapMarkerAlt } from "react-icons/fa";
import HeaderAlertsMemo from "@/components/liteAlerts/headerAlerts";

const Navigate: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const businessId = params.businessId ?? ("" as string); // Replace with actual businessId or fetch it from a context/store

  const navigateToAlerts = () => {
    navigate(`/${businessId}/alerts`);
  };

  const navigateToZone = () => {
    navigate(`/${businessId}/zone`);
  };

  return (
    <>
      <HeaderAlertsMemo hide hideBack />
      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card
            title="Payment Alerts"
            icon={<FaBell className="text-3xl" />}
            onClick={navigateToAlerts}
            bgColor="bg-green-100"
            textColor="text-green-700"
          />
          {/* <Card
            title="Zones and Tables"
            icon={<FaMapMarkerAlt className="text-3xl" />}
            onClick={navigateToZone}
            bgColor="bg-blue-100"
            textColor="text-blue-700"
          /> */}
        </div>
      </div>
    </>
  );
};

interface CardProps {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  bgColor: string;
  textColor: string;
}

const Card: React.FC<CardProps> = ({
  title,
  icon,
  onClick,
  bgColor,
  textColor,
}) => {
  return (
    <div
      className={`${bgColor} ${textColor} rounded-lg shadow-md p-6 cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-105`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        {icon}
      </div>
    </div>
  );
};

export default Navigate;
