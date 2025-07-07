import { useNavigate, useParams } from "react-router-dom";
import HeaderAlertsMemo from "@/components/liteAlerts/headerAlerts";
import { useCallback } from "react";
import { CreditCard, QrCode, X } from "lucide-react";

const Navigate = () => {
  const navigate = useNavigate();
  const params = useParams();
  const businessId = params.businessId ?? ("" as string);

  const navigateToAlerts = useCallback(() => {
    return navigate(`/${businessId}/alerts`);
  }, []);

  const navigateToCheckIn = useCallback(() => {
    return navigate(`/${businessId}/checkin`);
  }, []);

  return (
    <>
      <HeaderAlertsMemo hide hideBack />
      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card
            title="Payment Alerts "
            icon={<CreditCard />}
            onClick={navigateToAlerts}
            bgColor="bg-green-100"
            textColor="text-green-700"
          />

          <Card
            title="Check In"
            icon={<QrCode />}
            onClick={navigateToCheckIn}
            bgColor="bg-purple-100"
            textColor="text-purple-700"
          />
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

const Card = ({ title, icon, onClick, bgColor, textColor }: CardProps) => {
  return (
    <div
      className={`${bgColor} ${textColor} rounded-lg shadow-md p-6 cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-105`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick();
        }
      }}
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
