import { lazy, memo } from "react";
import { useWhatsappTempStore } from "@/components/store/useWhatsappTempStore";
import {
  Eye,
  MessageCircle,
  MousePointerClick,
  Shield,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAllCampaignsWithTemplates } from "@/hooks/useTemplates";

const CampaignAccordion = lazy(() => import("./campaignAccordion"));

const MemoCampaignAdvancedAnalytics = () => {
  const selectedTemplate = useWhatsappTempStore((s) => s.selectedTemplate);
  const { allCampaignsWithTemplates } = useAllCampaignsWithTemplates();
  const statsData = [
    {
      title: "Sent",
      value: selectedTemplate?.sent?.toString() || "0",
      icon: MessageCircle,
      className: "bg-gradient-to-br from-[#25D366] to-[#128C7E]",
    },
    {
      title: "Received",
      value: selectedTemplate?.delivered?.toString() || "0",
      icon: UserCheck,
      className: "bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF4500]",
    },
    {
      title: "Read",
      value: selectedTemplate?.read?.toString() || "0",
      icon: Eye,
      className: "bg-gradient-to-br from-[#34B7F1] to-[#0088CC]",
    },
    {
      title: "Clicked",
      value: selectedTemplate?.clicked?.toString() || "0",
      icon: MousePointerClick,
      className: "bg-gradient-to-br from-[#000000] to-[#000000]",
    },
    {
      title: "Failed",
      value: selectedTemplate?.failed?.toString() || "0",
      icon: XCircle,
      className: "bg-gradient-to-br from-[#4B0082] to-[#2E0854]",
    },
    {
      title: "Block",
      value: selectedTemplate?.blocked?.toString() || "0",
      icon: Shield,
      className: "bg-gradient-to-br from-red-500 to-red-700",
    },
  ];

  useQuery({
    queryKey: ["allCampaignsWithTemplates"],
    queryFn: allCampaignsWithTemplates,
  });

  return (
    <main className="container p-4 mx-auto space-y-4 duration-500 bg-white rounded-lg animate-in fade-in-50">
      <article className="bg-white rounded-xl">
        <h1 className="flex items-center justify-between w-full gap-2 mb-4 text-2xl truncate lg:w-96">
          {selectedTemplate?.templateName || "Template"}
        </h1>
        <p className="mb-2 text-base text-gray-500">
          An overview of complete template analytics
        </p>
        <section
          className="grid grid-cols-2 gap-4 md:grid-cols-6"
          aria-label="Statistics"
        >
          {statsData.map((stat) => (
            <article
              key={stat.title}
              className={`${stat.className} p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow duration-300`}
            >
              <header className="flex items-center gap-2 mb-2">
                <stat.icon className="w-5 h-5" />
                <h2 className="text-sm font-medium">{stat.title}</h2>
              </header>
              <p className="text-3xl font-bold">{stat.value}</p>
            </article>
          ))}
        </section>
      </article>
      <CampaignAccordion />
    </main>
  );
};

const CampaignAdvancedAnalytics = memo(MemoCampaignAdvancedAnalytics);
export default CampaignAdvancedAnalytics;
