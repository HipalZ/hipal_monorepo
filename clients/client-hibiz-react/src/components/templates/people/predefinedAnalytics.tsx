import useHiPeopleStore from "@/components/store/useHipeopleStore";
import { memo } from "react";
import { IoHomeOutline } from "react-icons/io5";
import { LiaCoinsSolid } from "react-icons/lia";
import { LuIndianRupee } from "react-icons/lu";
import { PiHandCoinsLight } from "react-icons/pi";
import { SlLocationPin } from "react-icons/sl";

const MemoPredefinedAnalytics = () => {
  const { userDashboardDetails } = useHiPeopleStore((s) => ({
    userDashboardDetails: s.userDashboardDetails,
  }));

  const predefinedAnalytics = [
    {
      id: "1",
      text: "Total Sales",
      icon: <LuIndianRupee size={14} />,
      value: userDashboardDetails?.totalSale,
    },
    {
      id: "2",
      text: "Average Sales",
      icon: <LuIndianRupee size={14} />,
      value: userDashboardDetails?.AvarageSale,
    },
    {
      id: "3",
      text: "Num of visits",
      icon: <IoHomeOutline size={14} />,
      value: userDashboardDetails?.NumOfVisits,
    },
    {
      id: "4",
      text: "Num of sessions",
      icon: <SlLocationPin size={14} />,
      value: userDashboardDetails?.NumOfSessions,
    },
    {
      id: "5",
      text: "Coinz issued",
      icon: <LiaCoinsSolid size={14} />,
      value: userDashboardDetails?.coinzIssued,
    },
    {
      id: "6",
      text: "Coinz used",
      icon: <PiHandCoinsLight size={14} />,
      value: userDashboardDetails?.coinzUsed,
    },
    {
      id: "7",
      text: "Available Coinz",
      icon: <PiHandCoinsLight size={14} />,
      value: userDashboardDetails?.currentCoinz || 0,
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 px-6 py-6 bg-white md:grid-cols-4 lg:grid-cols-6 place-items-center">
      {predefinedAnalytics.map((buttons, index) => {
        return (
          <article
            className={`border border-1 border-[#525E5F] w-full h-[5.5rem] p-2 rounded-lg space-y-4 
            ${index === 0 ? "col-span-2 md:col-span-1" : ""}`}
            key={buttons?.id}
          >
            <h1 className="flex items-center text-[#6F649B]">
              {buttons?.icon} &nbsp;
              {buttons?.text}
            </h1>
            <p className="text-[#6F649B]">{buttons?.value}</p>
          </article>
        );
      })}
    </section>
  );
};

const PredefinedAnalytics = memo(MemoPredefinedAnalytics);
export default PredefinedAnalytics;
