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
import { festival } from "@/components/helpers/whatzAppHelpers";

const CampaignAnalytics = lazy(() => import("./campaignAnalytics"));
const WhatsappChat = lazy(() => import("./whatsappbot"));

interface Template {
  id: string;
  title: string;
  image: string;
  tag: string;
  isCarousel?: boolean;
}

const templates: Template[] = [
  {
    id: "592109929915038",
    title: "Festivals",
    image: diwali,
    tag: "festivalTemplate",
  },
  {
    id: "2",
    title: "Coupon",
    image: couponImage,
    tag: "couponTemplate",
  },
  {
    id: "3",
    title: "Loyalty",
    image: loyaltyImage,
    tag: "loyaltyTemplate",
  },
  {
    id: "4",
    title: "New Arrivals",
    image: newArrivals,
    tag: "newArrivalsTemplate",
    isCarousel: true,
  },
];

const MemoWhatzappDashboard = () => {
  const {
    setStep,
    setTemplateSteps,
    activeTab,
    setActiveTab,
    setTemplateData,
    setPreDefinedTemplate,
    setTemplateType,
  } = useWhatsapp((s) => ({
    setStep: s.setStep,
    setTemplateSteps: s.setTemplateSteps,
    activeTab: s.activeTab,
    setActiveTab: s.setActiveTab,
    setTemplateData: s.setTemplateData,
    setPreDefinedTemplate: s.setPreDefinedTemplate,
    setTemplateType: s.setTemplateType,
  }));

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleTemplateClick = useCallback(
    (templateTag: string) => {
      if (templateTag === "festivalTemplate") {
        setTemplateData(festival);
      }
      setStep(Step.CREATE_EDIT);
      setTemplateSteps(TemplateSteps.MODIFY);
      setPreDefinedTemplate(true);
    },
    [setStep, setTemplateData, setTemplateSteps, setPreDefinedTemplate],
  );

  const handleCreateTemplate = useCallback(
    (type: string) => {
      setStep(Step.CREATE_EDIT);
      setTemplateSteps(TemplateSteps.CREATE_EDIT);
      setPreDefinedTemplate(false);
      setTemplateType(type);
    },
    [setStep, setTemplateSteps, setPreDefinedTemplate, setTemplateType],
  );

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % (templates.length + 1));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + templates.length + 1) % (templates.length + 1),
    );
  }, []);

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
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {templates?.map((template) => (
                  <div
                    key={template.id}
                    className="flex-shrink-0 w-full px-2 md:w-1/4 lg:w-1/4"
                  >
                    <section
                      className="overflow-hidden transition-shadow duration-300 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg"
                      onClick={() => handleTemplateClick(template.tag)}
                      onKeyDown={() => handleTemplateClick(template.tag)}
                    >
                      <article className="relative aspect-[3/4]">
                        <article className="absolute top-0 left-0 right-0 p-2">
                          {template?.isCarousel && (
                            <span className="px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full">
                              Carousel
                            </span>
                          )}
                        </article>
                        <img
                          src={template.image}
                          alt={template.title}
                          className="object-cover w-full h-full"
                        />
                        <article className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                          <h3 className="text-lg font-semibold text-white">
                            {template.title}
                          </h3>
                        </article>
                      </article>
                    </section>
                  </div>
                ))}
                <div className="flex-shrink-0 w-full px-2 md:w-1/4 lg:w-1/4">
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
                <div className="flex-shrink-0 w-full px-2 md:w-1/4 lg:w-1/4">
                  <div className="bg-blue-400 rounded-lg shadow-md overflow-hidden aspect-[3/4] flex items-center justify-center hover:bg-[#FFE4C3] transition-colors duration-300">
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
              className="absolute left-0 p-2 -translate-y-1/2 bg-white rounded-full shadow-md top-1/2"
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              <BsChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              className="absolute right-0 p-2 -translate-y-1/2 bg-white rounded-full shadow-md top-1/2"
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
