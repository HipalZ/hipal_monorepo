"use client";
import { lazy, memo, useCallback, useState } from "react";
import { BsPlusLg, BsChevronLeft, BsChevronRight } from "react-icons/bs";
import diwali from "@/assets/whatzapp/diwali.jpg";
import couponImage from "@/assets/whatzapp/coupon.webp";
import loyaltyImage from "@/assets/whatzapp/loyaltyImage.jpg";
import newArrivals from "@/assets/whatzapp/newarrivals.jpeg";
import useWhatsapp, {
  Step,
  Tabs,
  TemplateSteps,
  TemplateType,
} from "@/components/store/useWhatsapp";
import type { WhatsAppTemplatePayload } from "@/components/types/businessData";
import { useFetchTemplates } from "@/hooks/useTemplates";
import { useQuery } from "@tanstack/react-query";
import useBusinessData from "@/components/store/useBusinessData";
import { cn } from "@/components/utils/helper";

const CampaignAnalytics = lazy(() => import("./campaignAnalytics"));
const WhatsappChat = lazy(() => import("./whatsappbot"));

const MemoWhatzappDashboard = () => {
  const {
    setStep,
    setTemplateSteps,
    activeTab,
    setActiveTab,
    setTemplateData,
    setPreDefinedTemplate,
    setTemplateType,
    allTemplates,
    resetTemplateData,
  } = useWhatsapp((s) => ({
    setStep: s.setStep,
    setTemplateSteps: s.setTemplateSteps,
    activeTab: s.activeTab,
    setActiveTab: s.setActiveTab,
    setTemplateData: s.setTemplateData,
    setPreDefinedTemplate: s.setPreDefinedTemplate,
    setTemplateType: s.setTemplateType,
    allTemplates: s.allTemplates,
    resetTemplateData: s.resetTemplateData,
  }));
  const businessId = useBusinessData((s) => s.businessData?._id);

  const { getTemplates } = useFetchTemplates();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleTemplateClick = useCallback(
    (template: WhatsAppTemplatePayload) => {
      setTemplateData(template);
      setStep(Step.CREATE_EDIT);
      setTemplateSteps(TemplateSteps.MODIFY);
      setPreDefinedTemplate(true);
    },
    [setStep, setTemplateData, setTemplateSteps, setPreDefinedTemplate],
  );

  const handleCreateTemplate = useCallback(
    (type: string) => {
      // reset old data and navigate inside
      resetTemplateData();
      setStep(Step.CREATE_EDIT);
      setTemplateSteps(TemplateSteps.CREATE_EDIT);
      setPreDefinedTemplate(false);
      setTemplateType(type);
    },
    [
      setStep,
      setTemplateSteps,
      setPreDefinedTemplate,
      setTemplateType,
      resetTemplateData,
    ],
  );

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % (allTemplates.length + 1));
  }, [allTemplates]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + allTemplates.length + 1) % (allTemplates.length + 1),
    );
  }, [allTemplates]);

  useQuery({
    queryKey: ["templates"],
    queryFn: getTemplates,
    enabled: !!businessId && activeTab === Tabs.TEMPLATES,
  });

  return (
    <main className="container relative px-2 mx-auto">
      <nav className="mb-4">
        <ul className="flex space-x-2 overflow-auto">
          {Object.values(Tabs).map((tab) => (
            <li key={tab}>
              <button
                type="button"
                className={`capitalize px-4 py-2 rounded-lg transition-colors duration-300 ${
                  activeTab === tab
                    ? "bg-[#075E54] text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {activeTab === Tabs.TEMPLATES && (
        <section className="mb-10">
          <h2 className="mb-2 text-2xl font-semibold">
            Drafts/Existing templates
          </h2>
          <p className="mb-6 text-gray-600">
            Use these templates for sending to your customers instantly
          </p>
          <div className="relative">
            <div className="overflow-hidden md:overflow-visible">
              <div
                className="flex gap-4 transition-transform duration-300 ease-in-out flex-nowrap md:grid md:grid-cols-4 xl:grid-cols-6 md:transform-none"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {allTemplates?.map((template) => (
                  <div
                    key={template.id}
                    className="flex-shrink-0 w-full px-2 md:w-full md:px-0"
                  >
                    <section
                      className="overflow-hidden transition-shadow duration-300 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg"
                      onClick={() => handleTemplateClick(template)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleTemplateClick(template)
                      }
                      aria-label={`Select ${template.name} template`}
                    >
                      <article className="relative aspect-[3/4]">
                        <article className="absolute top-0 left-0 right-0 px-2 py-1">
                          <span
                            className={cn(
                              "px-2 py-1 text-xs font-semibold text-white rounded-full",
                              template?.status === "APPROVED"
                                ? " bg-green-500"
                                : "bg-red-500",
                            )}
                          >
                            {template?.status}
                          </span>
                        </article>
                        <img
                          src={loyaltyImage}
                          alt={template.name || "Template"}
                          className="object-cover w-full h-full"
                        />
                        <article className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                          <h3 className="text-lg font-semibold text-white truncate">
                            {template.name}
                          </h3>
                        </article>
                      </article>
                    </section>
                  </div>
                ))}
                <div className="flex-shrink-0 w-full px-2 md:w-full md:px-0">
                  <div className="bg-[#FFD4B3] rounded-lg shadow-md overflow-hidden aspect-[3/4] flex items-center justify-center hover:bg-[#FFE4C3] transition-colors duration-300">
                    <button
                      onClick={() =>
                        handleCreateTemplate(TemplateType.Marketing)
                      }
                      type="button"
                      className="flex flex-col items-center gap-2 text-gray-800"
                    >
                      <BsPlusLg className="w-8 h-8" />
                      <span className="text-lg font-medium">
                        Create Marketing Template
                      </span>
                    </button>
                  </div>
                </div>
                <div className="flex-shrink-0 w-full px-2 md:w-full md:px-0">
                  <div className="bg-blue-400 rounded-lg shadow-md overflow-hidden aspect-[3/4] flex items-center justify-center hover:bg-blue-500 transition-colors duration-300">
                    <button
                      onClick={() => handleCreateTemplate(TemplateType.Utility)}
                      type="button"
                      className="flex flex-col items-center gap-2 text-gray-800"
                    >
                      <BsPlusLg className="w-8 h-8" />
                      <span className="text-lg font-medium">
                        Create Utility Template
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="absolute left-0 p-2 -translate-y-1/2 bg-white rounded-full shadow-md top-1/2 md:hidden"
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              <BsChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              className="absolute right-0 p-2 -translate-y-1/2 bg-white rounded-full shadow-md top-1/2 md:hidden"
              onClick={nextSlide}
              aria-label="Next slide"
            >
              <BsChevronRight className="w-6 h-6" />
            </button>
          </div>
        </section>
      )}

      {activeTab === Tabs.CAMPAIGNS && (
        <section>
          {activeTab === Tabs.CAMPAIGNS && <CampaignAnalytics />}
        </section>
      )}

      {activeTab === Tabs.AUTOMATION && (
        <section>
          <h2 className="mb-6 text-2xl font-semibold">Automation</h2>
          <p>Automation content goes here.</p>
        </section>
      )}
      <WhatsappChat />
    </main>
  );
};

const WhatzappDashboard = memo(MemoWhatzappDashboard);
export default WhatzappDashboard;
