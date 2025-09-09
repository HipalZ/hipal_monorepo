import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GrGraphQl } from "react-icons/gr";
import { IoAnalytics } from "react-icons/io5";
import { VscFeedback } from "react-icons/vsc";
import { SlPeople } from "react-icons/sl";

const essentialCards = [
  {
    title: "Escalation Analytics",
    description: "Escalation Reports",
    icon: (
      <div className="p-3 transition-transform transform rounded-full shadow-lg bg-gradient-to-br from-blue-400 to-blue-600 hover:scale-105">
        <GrGraphQl className="w-8 h-8 text-white drop-shadow-md" />
      </div>
    ),
    href: "escalation-reports",
  },
  {
    title: "Item Analytics",
    description: "Item Reports",
    icon: (
      <div className="p-3 transition-transform transform rounded-full shadow-lg bg-gradient-to-br from-purple-400 to-purple-600 hover:scale-105">
        <IoAnalytics className="w-8 h-8 text-white drop-shadow-md" />
      </div>
    ),
    href: "item-reports",
  },
  {
    title: "Review Analytics",
    description: "Review Reports",
    icon: (
      <div className="p-3 transition-transform transform rounded-full shadow-lg bg-gradient-to-br from-gray-400 to-[#000000] hover:scale-105">
        <VscFeedback className="w-8 h-8 text-white drop-shadow-md" />
      </div>
    ),
    href: "review-reports",
  },
  {
    title: "User Analytics",
    description: "User Reports",
    icon: (
      <div className="p-3 transition-transform transform rounded-full shadow-lg bg-gradient-to-br from-red-400 to-red-600 hover:scale-105">
        <SlPeople  className="w-8 h-8 text-white drop-shadow-md" />
      </div>
    ),
    href: "user-reports",
  },
];

const AnalyticsCards = () => {
  return (
    <>
      <h2 className="px-4 mt-6 mb-6 text-3xl font-bold xl:px-0">Analytics</h2>
      <div className="grid grid-cols-1 gap-4 px-4 xl:px-0 md:grid-cols-2 lg:grid-cols-3 pb-[3rem]">
        {essentialCards.map((card, index) => (
          <Link
            to={`${card.href}`}
            key={index?.toString()}
            className="block h-full"
          >
            <Card className="relative h-full transition-all hover:shadow-md hover:border-primary/50">
              <CardHeader className="pb-2 h-[7rem]">
                <CardTitle className="absolute top-4 left-4">
                  {card.icon}
                </CardTitle>
                <CardTitle className="pb-4 text-xl ml-[4rem]">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[3rem]">
                <CardDescription>{card.description}</CardDescription>
              </CardContent>
              <CardFooter className="pt-2">
                <span className="text-sm text-primary">Configure →</span>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
};

export default AnalyticsCards;
