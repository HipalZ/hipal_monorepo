import { Fragment, lazy, memo, useCallback, useState } from "react";
import useWhatsapp, {
  Step,
  TemplateSteps,
  TemplateType,
} from "@/components/store/useWhatsapp";
import { useFetchTemplates } from "@/hooks/useTemplates";
import { useQuery } from "@tanstack/react-query";
import useBusinessData from "@/components/store/useBusinessData";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import BottomButton from "@/components/atom/bottomButton";
import { MdCampaign } from "react-icons/md";
import { HiOutlineTemplate } from "react-icons/hi";
import {
  Tabs,
  useWhatsappTempStore,
} from "@/components/store/useWhatsappTempStore";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { ChevronDownIcon, Filter } from "lucide-react";
import CampaignAdvancedAnalytics from "./campaignAdvancedAnalytics";

const TemplatesCarousel = lazy(() => import("./templatesCarousel"));
const CampaignAnalytics = lazy(() => import("./campaignAnalytics"));

const MemoWhatzappDashboard = () => {
  const {
    setStep,
    setTemplateSteps,
    setTemplateType,
    resetTemplateData,
    setShowSuccessPopup,
  } = useWhatsapp((s) => ({
    setStep: s.setStep,
    setTemplateSteps: s.setTemplateSteps,
    setTemplateType: s.setTemplateType,
    resetTemplateData: s.resetTemplateData,
    setShowSuccessPopup: s.setShowSuccessPopup,
  }));
  const [filter, setFilter] = useState("View By Template");
  const { activeTab, setActiveTab, openAnalytics } = useWhatsappTempStore(
    (s) => ({
      setActiveTab: s.setActiveTab,
      activeTab: s.activeTab,
      openAnalytics: s.openAnalytics,
    }),
  );

  const businessId = useBusinessData((s) => s.businessData?._id);

  const { getTemplates } = useFetchTemplates();

  const handleCreateTemplate = useCallback(
    (type: string) => {
      // reset old data and navigate inside
      resetTemplateData();
      setShowSuccessPopup(false);
      setStep(Step.CREATE_EDIT);
      setTemplateSteps(TemplateSteps.CREATE_EDIT);
      setTemplateType(type);
    },
    [
      setStep,
      setTemplateSteps,
      setTemplateType,
      resetTemplateData,
      setShowSuccessPopup,
    ],
  );

  const getTabIcon = useCallback((tab: Tabs) => {
    switch (tab) {
      case Tabs.CAMPAIGNS:
        return <MdCampaign className="w-5 h-5 mr-2" />;
      case Tabs.TEMPLATES:
        return <HiOutlineTemplate className="w-5 h-5 mr-2" />;
      default:
        return null;
    }
  }, []);

  const handleFilterChange = (filterOption: string) => {
    setFilter(filterOption);
  };

  const { isPending } = useQuery({
    queryKey: ["templates", businessId, activeTab],
    queryFn: getTemplates,
    enabled: !!businessId && activeTab === Tabs.TEMPLATES,
  });

  return (
    <main className="container relative h-[80dvh] px-2 mx-auto my-4">
      <nav className="flex items-center justify-between px-2 py-4 mb-2 bg-white rounded-xl">
        <ul className="flex space-x-2 overflow-auto">
          {Object.values(Tabs).map((tab) => (
            <li key={tab}>
              <button
                type="button"
                className={`flex items-center capitalize px-4 py-2 rounded-lg transition-colors duration-300 ${
                  activeTab === tab
                    ? "bg-[#075E54] text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {getTabIcon(tab)}
                <span>{tab}</span>
              </button>
            </li>
          ))}
        </ul>
        {activeTab === Tabs.TEMPLATES && (
          <ul className="hidden gap-2 md:flex">
            <li>
              <button
                type="button"
                className="px-4 py-2 text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-500 on_active_bounce"
                onClick={() => handleCreateTemplate(TemplateType.Marketing)}
              >
                + Marketing Template
              </button>
            </li>
            <li>
              <button
                type="button"
                className="px-4 py-2 text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-500 on_active_bounce"
                onClick={() => handleCreateTemplate(TemplateType.Utility)}
              >
                + Utility Template
              </button>
            </li>
          </ul>
        )}
        {
          <ul className="hidden gap-2 md:flex">
            <li>
              <Menu as="div" className="relative inline-block text-left">
                <div className="border border-gray-500 rounded-lg">
                  <MenuButton className="inline-flex items-center justify-center w-full p-2 text-sm font-medium rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                    <Filter size={16} />
                    <ChevronDownIcon
                      className="w-5 h-5 ml-1 -mr-1"
                      aria-hidden="true"
                    />
                  </MenuButton>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <MenuItems className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-1 py-1">
                      <MenuItem>
                        {({ active }) => (
                          <button
                            type="button"
                            className={`${
                              active
                                ? "bg-blue-500 text-white"
                                : "text-gray-900"
                            } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                            onClick={() =>
                              handleFilterChange("View By Template")
                            }
                          >
                            View By Template
                          </button>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ active }) => (
                          <button
                            type="button"
                            className={`${
                              active
                                ? "bg-blue-500 text-white"
                                : "text-gray-900"
                            } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                            onClick={() =>
                              handleFilterChange("View By Campaign")
                            }
                          >
                            View By Campaign
                          </button>
                        )}
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Transition>
              </Menu>
            </li>
          </ul>
        }
      </nav>
      {activeTab === Tabs.TEMPLATES && (
        <section className="p-4 mb-20 bg-white shadow-sm rounded-xl">
          <h2 className="text-2xl font-semibold text-gray-900">Templates</h2>
          <p className="mt-1 mb-6 text-sm text-gray-500">
            Use these templates for sending to your customers instantly
          </p>
          <div className="relative grid gap-4 transition-transform duration-300 ease-in-out md:h-full md:grid-cols-4 md:transform-none">
            {isPending ? <LoadingSpinner /> : <TemplatesCarousel />}
          </div>
          <article className="md:hidden">
            <BottomButton
              fixed
              colorGrad
              buttons={[
                {
                  text: "Marketing Template",
                  type: "button",
                  onClick: () => handleCreateTemplate(TemplateType.Marketing),
                },
                {
                  text: "Utility Template",
                  type: "button",
                  onClick: () => handleCreateTemplate(TemplateType.Utility),
                },
              ]}
            />
          </article>
        </section>
      )}
      {activeTab === Tabs.CAMPAIGNS && !openAnalytics && <CampaignAnalytics />}
      {activeTab === Tabs.CAMPAIGNS && openAnalytics && (
        <CampaignAdvancedAnalytics />
      )}

      {/* {activeTab === Tabs.INTERACTIVE_FLOW && <InteractiveFlows />} */}
    </main>
  );
};

const WhatzappDashboard = memo(MemoWhatzappDashboard);
export default WhatzappDashboard;
