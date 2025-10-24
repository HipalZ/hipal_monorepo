import BottomButton from '@/components/atom/bottomButton';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import useBusinessData from '@/components/store/useBusinessData';
import useWhatsapp, { Step, TemplateSteps, TemplateType } from '@/components/store/useWhatsapp';
import { Tabs, useWhatsappTempStore } from '@/components/store/useWhatsappTempStore';
import { useFetchTemplates } from '@/hooks/useTemplates';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle, Workflow } from 'lucide-react';
import { lazy, memo, useCallback, useState } from 'react';
import { HiOutlineTemplate } from 'react-icons/hi';
import { MdCampaign } from 'react-icons/md';
import { TbSettingsAutomation } from 'react-icons/tb';
import WhatsAppFlowBuilderWithReactFlow from './flows';

const LinkTemplatePopup = lazy(() => import('./linkTemplatePopup'));
const WhatsappFlowSection = lazy(() => import('./whatsappFlows'));
const WhatsAppAutomationFlow = lazy(() => import('./whatsappAutomation'));
const FlowBuilderPage = lazy(() => import('./whatsappFlowBuilder'));
const WhatzappFlowsList = lazy(() => import('./WhatzappFlowsList'));
const WhatsappChats = lazy(() => import('./whatsappChats'));
const CampaignAdvancedAnalytics = lazy(() => import('./campaignAdvancedAnalytics'));
const TemplatesCarousel = lazy(() => import('./templatesCarousel'));
const CampaignAnalytics = lazy(() => import('./campaignAnalytics'));

const MemoWhatzappDashboard = () => {
  const outLetType = useBusinessData((s) => s.outletInfo?.outLetType);
  const activeTab = useWhatsappTempStore((s) => s.activeTab);
  const setStep = useWhatsapp((s) => s.setStep);
  const setTemplateSteps = useWhatsapp((s) => s.setTemplateSteps);
  const setTemplateType = useWhatsapp((s) => s.setTemplateType);
  const resetTemplateData = useWhatsapp((s) => s.resetTemplateData);
  const setShowSuccessPopup = useWhatsapp((s) => s.setShowSuccessPopup);
  const setActiveTab = useWhatsappTempStore((s) => s.setActiveTab);
  const openAnalytics = useWhatsappTempStore((s) => s.openAnalytics);
  const createEditFlow = useWhatsappTempStore((s) => s.createEditFlow);
  const flowBuilderOpen = useWhatsappTempStore((s) => s.flowBuilderOpen);
  const setFlowBuilderOpen = useWhatsappTempStore((s) => s.setFlowBuilderOpen);
  const [openLinkTemplatePopup, setOpenLinkTemplatePopup] = useState(false);
  const businessId = useBusinessData((s) => s.businessData?._id);

  const { getTemplates } = useFetchTemplates();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const handleCreateTemplate = useCallback(
    (type: string) => {
      // reset old data and navigate inside
      resetTemplateData();
      setShowSuccessPopup(false);
      setStep(Step.CREATE_EDIT);
      setTemplateSteps(TemplateSteps.CREATE_EDIT);
      setTemplateType(type);
    },
    [setStep, setTemplateSteps, setTemplateType, resetTemplateData, setShowSuccessPopup],
  );

  const handleLinkTemplate = useCallback(() => {
    setOpenLinkTemplatePopup(true);
  }, []);

  const getTabIcon = useCallback((tab: Tabs) => {
    switch (tab) {
      case Tabs.CAMPAIGNS:
        return <MdCampaign className="mr-2 h-5 w-5" />;
      case Tabs.TEMPLATES:
        return <HiOutlineTemplate className="mr-2 h-5 w-5" />;
      case Tabs.FLOWS:
        return <Workflow className="mr-2 h-5 w-5" />;
      // case Tabs.AUTOMATION:
      //   return <TbSettingsAutomation className="w-5 h-5 mr-2" />;
      case Tabs.CHATS:
        return <MessageCircle className="mr-2 h-5 w-5" />;
      default:
        return null;
    }
  }, []);

  const { isPending } = useQuery({
    queryKey: ['templates', businessId, activeTab],
    queryFn: getTemplates,
    enabled: !!businessId && activeTab === Tabs.TEMPLATES,
  });

  return (
    <section className="relative mx-auto my-4 flex">
      {/* --- SIDEBAR --- */}
      {!openAnalytics && !createEditFlow && !flowBuilderOpen && (
        <nav
          className={`hide-scrollbar fixed left-0 top-20 z-50 flex h-[calc(100vh-8rem)] flex-col justify-between overflow-auto rounded-r-lg border bg-gray-100 shadow-2xl transition-all duration-300 ${isSidebarExpanded ? 'w-48 p-4' : 'w-16 p-2'} `}
          style={{
            transitionProperty: 'width, padding',
          }}
        >
          <ul className="flex flex-col space-y-2">
            {Object.values(Tabs).map((tab) => (
              <li key={tab}>
                <button
                  type="button"
                  className={`flex w-full items-center rounded-lg py-2 capitalize transition-colors duration-300 ${
                    isSidebarExpanded ? 'justify-start px-4' : 'justify-center'
                  } ${activeTab === tab ? 'bg-[#075E54] text-white shadow-lg' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {getTabIcon(tab)}
                  {isSidebarExpanded && <span className="ml-2">{tab}</span>}
                </button>
              </li>
            ))}
          </ul>

          {/* --- Toggle Button --- */}
          <button
            type="button"
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="mt-4 flex items-center justify-center rounded-lg border border-gray-300 bg-black p-2 text-white"
            aria-label={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isSidebarExpanded ? '<' : '>'}
          </button>
        </nav>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 pl-20 transition-all duration-300">
        {activeTab === Tabs.TEMPLATES && !openAnalytics && (
          <section className="mb-20 rounded-xl p-4 shadow-sm">
            <section className="flex justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Templates</h2>
              <ul className="hidden gap-2 md:flex">
                {outLetType === 'HOTEL' && (
                  <li>
                    <button
                      type="button"
                      className="on_active_bounce rounded-lg bg-green-600 px-4 py-2 text-white shadow-lg hover:bg-green-500"
                      onClick={handleLinkTemplate}
                    >
                      + Link Your Template
                    </button>
                  </li>
                )}
                <li>
                  <button
                    type="button"
                    className="on_active_bounce rounded-lg bg-blue-600 px-4 py-2 text-white shadow-lg hover:bg-blue-500"
                    onClick={() => handleCreateTemplate(TemplateType.Marketing)}
                  >
                    + Marketing Template
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="on_active_bounce rounded-lg bg-blue-600 px-4 py-2 text-white shadow-lg hover:bg-blue-500"
                    onClick={() => handleCreateTemplate(TemplateType.Utility)}
                  >
                    + Utility Template
                  </button>
                </li>
              </ul>
            </section>
            <p className="mb-6 mt-1 text-sm text-gray-500">Use these templates for sending to your customers instantly</p>
            <div className="relative grid gap-4 transition-transform duration-300 ease-in-out md:h-full md:transform-none md:grid-cols-4 lg:grid-cols-5">
              {isPending ? <LoadingSpinner /> : <TemplatesCarousel />}
            </div>
            <article className="md:hidden">
              <BottomButton
                fixed
                colorGrad
                buttons={[
                  {
                    text: 'Marketing Template',
                    type: 'button',
                    onClick: () => handleCreateTemplate(TemplateType.Marketing),
                  },
                  {
                    text: 'Utility Template',
                    type: 'button',
                    onClick: () => handleCreateTemplate(TemplateType.Utility),
                  },
                ]}
              />
            </article>
          </section>
        )}
        {activeTab === Tabs.FLOWS && <WhatsAppFlowBuilderWithReactFlow />}
        {activeTab === Tabs.CHATS && <WhatsappChats />}
        {activeTab === Tabs.CAMPAIGNS && !openAnalytics && <CampaignAnalytics />}
        {activeTab === Tabs.CAMPAIGNS && openAnalytics && <CampaignAdvancedAnalytics />}
      </div>

      {/* Overlay popup */}
      {openLinkTemplatePopup && (
        <LinkTemplatePopup openLinkTemplatePopup={openLinkTemplatePopup} setOpenLinkTemplatePopup={setOpenLinkTemplatePopup} />
      )}
    </section>
  );
};

const WhatzappDashboard = memo(MemoWhatzappDashboard);
export default WhatzappDashboard;
