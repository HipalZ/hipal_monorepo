import BottomButton from "@/components/atom/bottomButton";
import { memo, useCallback } from "react";
import useWhatsapp, {
  Step,
  TemplateType,
} from "@/components/store/useWhatsapp";
import MarketingCustomTemp from "./staticTemplatePreview";
import StepHeader from "./stepHeader";

const MemoSetupTemplate = () => {
  const { setStep, templateType, setTemplateType } = useWhatsapp((s) => ({
    setStep: s.setStep,
    templateType: s.templateType,
    setTemplateType: s.setTemplateType,
  }));

  const handleStep = useCallback((step: Step) => {
    setStep(step);
  }, []);

  return (
    <>
      <section className="container p-4 pb-24 mx-auto font-sans">
        <StepHeader />
        <article className="mb-8">
          <h1 className="mb-2 text-2xl font-bold">Set Up Template</h1>
          <p className="text-gray-600">
            Choose the category that best describes your message template. Then,
            select the type of message that you want to send.
          </p>
        </article>
        <section className="grid gap-8 md:grid-cols-2">
          <article>
            <h2 className="mb-4 text-xl font-semibold">Marketing</h2>
            <div className="p-4 mb-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  id="marketing-custom"
                  name="template"
                  className="mr-2"
                  checked={templateType === TemplateType?.Marketing}
                  onChange={() => setTemplateType(TemplateType?.Marketing)}
                />
                <label htmlFor="marketing-custom" className="font-semibold">
                  Custom
                </label>
              </div>
              <p className="text-sm text-gray-600">
                Send promotions or announcements to increase awareness and
                engagement
              </p>
            </div>
          </article>
          <article>
            <h2 className="mb-4 text-xl font-semibold">Utility</h2>
            <div className="p-4 mb-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  id="utility-custom"
                  name="template"
                  className="mr-2"
                  checked={templateType === TemplateType?.Utility}
                  onChange={() => setTemplateType(TemplateType?.Utility)}
                />
                <label htmlFor="utility-custom" className="font-semibold">
                  Custom
                </label>
              </div>
              <p className="text-sm text-gray-600">
                Send messages about an existing an order or account
              </p>
            </div>
          </article>
          {/* Right column */}
          <MarketingCustomTemp />
        </section>
      </section>
      <BottomButton
        fixed
        buttons={[
          {
            text: "Next",
            onClick: () => handleStep(Step.CREATE_EDIT),
            type: "button",
          },
        ]}
      />
    </>
  );
};

const SetupTemplate = memo(MemoSetupTemplate);
export default SetupTemplate;
