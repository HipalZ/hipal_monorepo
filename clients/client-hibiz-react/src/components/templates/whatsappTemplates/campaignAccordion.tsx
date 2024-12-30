import { lazy, memo, useCallback, useMemo, useState } from "react";
import {
  type Campaign,
  useWhatsappTempStore,
} from "@/components/store/useWhatsappTempStore";
import {
  CheckCircle,
  ChevronDownIcon,
  Eye,
  MousePointerClick,
  Send,
  Shield,
  XCircle,
} from "lucide-react";
import { useCampaignAnalytics } from "@/hooks/useTemplates";
import { cn, getSuccessRateClass } from "@/components/utils/helper";

const DetailedAnalyticsPieChart = lazy(() => import("./detailedAnalytics"));
const PhoneNumbersTable = lazy(() => import("./phoneNumbersTable"));

const MemoCampaignAccordion = () => {
  const allCampaignsList = useWhatsappTempStore((s) => s.allCampaignsList);
  const campaignsData = useWhatsappTempStore((s) => s.campaignsData);
  const setSelectedCampaign = useWhatsappTempStore(
    (s) => s.setSelectedCampaign,
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { fetchCampaignAnalytics } = useCampaignAnalytics();

  const toggleAccordion = useCallback(
    async (index: number, campaign: Campaign) => {
      setSelectedCampaign(campaign);
      await fetchCampaignAnalytics(campaign?._id, 1, "");
      if (activeIndex === index) {
        setActiveIndex(null);
      } else {
        setActiveIndex(index);
      }
    },
    [activeIndex, fetchCampaignAnalytics, setSelectedCampaign],
  );

  const statsConfig = [
    {
      label: "Sent",
      value: campaignsData?.overAllCount?.sent,
      borderColor: "#25D366",
      icon: <Send className="text-green-500" size={20} />,
    },
    {
      label: "Deliver",
      value: campaignsData?.overAllCount?.delivered,
      borderColor: "#FFEE8C",
      icon: <CheckCircle className="text-yellow-500" size={20} />,
    },
    {
      label: "Read",
      value: campaignsData?.overAllCount?.read,
      borderColor: "#34B7F1",
      icon: <Eye className="text-blue-500" size={20} />,
    },
    {
      label: "Clicked",
      value: campaignsData?.overAllCount?.clicked,
      borderColor: "#000000",
      icon: <MousePointerClick className="text-black" size={20} />,
    },
    {
      label: "Failed",
      value: campaignsData?.overAllCount?.failed,
      borderColor: "#4B0082",
      icon: <XCircle className="text-[#4B0082]" size={20} />,
    },
    {
      label: "Block",
      value: campaignsData?.overAllCount?.blocked,
      borderColor: "#FF0000",
      icon: <Shield className="text-red-500" size={20} />,
    },
  ];

  const sent = campaignsData?.overAllCount?.sent || 0;
  const delivered = campaignsData?.overAllCount?.delivered || 0;
  const failed = campaignsData?.overAllCount?.failed || 0;
  const successRate = useMemo(() => {
    return sent > 0
      ? Number.parseFloat(((delivered / sent - failed) * 100).toFixed(2))
      : 0;
  }, [sent, delivered, failed]);

  return (
    <div className="space-y-4">
      {allCampaignsList.map((campaign, index) => (
        <div key={campaign._id} className="border shadow-sm">
          <button
            type="button"
            className="flex items-center justify-between w-full p-4 text-xl font-semibold transition bg-white hover:text-white hover:bg-[#25D36A]"
            onClick={() => toggleAccordion(index, campaign)}
          >
            <span>
              {index + 1}. {campaign.campaignName}
            </span>
            <ChevronDownIcon
              className={`w-6 h-6 transform transition-transform ${
                activeIndex === index ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
          {activeIndex === index && campaignsData && (
            <>
              <section
                className="p-6 bg-white shadow-sm border-y"
                aria-label="Campaign Performance"
              >
                <h2 className="mb-6 text-xl font-semibold">
                  Campaign Performance
                </h2>
                <div className="items-center justify-around w-full h-full md:flex">
                  <DetailedAnalyticsPieChart />
                  <div className="grid grid-cols-3 gap-4 sm:my-6">
                    {statsConfig.map((stat) => (
                      <div
                        key={stat.label}
                        className="p-4 transition-transform duration-200 transform bg-white shadow-md rounded-xl"
                        style={{ borderTop: `4px solid ${stat.borderColor}` }}
                      >
                        <h3 className="flex items-center justify-between gap-2 mb-2 text-base font-semibold text-gray-700 md:gap-4 sm:text-lg">
                          <span>{stat.label}</span>
                          <span>{stat.icon}</span>
                        </h3>
                        <div className="text-2xl font-bold text-gray-900 sm:text-3xl">
                          {stat.value?.toLocaleString("en-IN")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-center">
                  <p
                    className={cn(
                      "text-2xl font-semibold",
                      getSuccessRateClass(successRate),
                    )}
                  >
                    Success Rate: {successRate}%
                  </p>
                </div>
              </section>
              <PhoneNumbersTable />
            </>
          )}
        </div>
      ))}
    </div>
  );
};

const CampaignAccordion = memo(MemoCampaignAccordion);
export default CampaignAccordion;
