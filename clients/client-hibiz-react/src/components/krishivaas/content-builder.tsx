import {
  normalizeInput,
  useAddTemplate,
} from "@/components/helpers/whatzAppHelpers";
import useBusinessData from "@/components/store/useBusinessData";
import useWhatsapp, { HeaderInterface } from "@/components/store/useWhatsapp";
import { lazy, memo, useCallback, useEffect } from "react";
import { BiPlus } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";

const CouponContent = lazy(() => import("../templates/whatsappTemplates/couponContent"));
const ImageContent = lazy(() => import("../templates/whatsappTemplates/imageContent"));

const defaultData = [
  { label: "name", value: "Rajesh" },
  { label: "email", value: "rajesh@gmail.com" },
  { label: "businessName", value: "Business Name" },
  { label: "phone", value: "+913456789090" },
  { label: "address", value: "Bangalore" },
  { label: "time", value: "10:00 AM" },
  { label: "date", value: "31st Dec, 2024" },
];

const defaultHotelOptions = [
  { label: "businessName", value: "businessName" },
  { label: "roomLink", value: "https://business name.com" },
  { label: "roomKey", value: "1234" },
  { label: "name", value: "Rajesh" },
  { label: "serviceName", value: "Food Delivery" },
  { label: "roomNumber", value: "402" },
  { label: "staffName", value: "John" },
  { label: "chatLink", value: "https://business name.com" },
  { label: "googleReviewLink", value: "Review Link" },
  { label: "serviceRejectionReason", value: "Maintainance Issue" },
];

const MemoContent = () => {
  const outLetType = useBusinessData((s) => s.outletInfo?.outLetType);
  const headerType = useWhatsapp((s) => s.headerType);
  const setHeaderType = useWhatsapp((s) => s.setHeaderType);
  const headerText = useWhatsapp((s) => s.headerText);
  const setHeaderText = useWhatsapp((s) => s.setHeaderText);
  const bodyText = useWhatsapp((s) => s.bodyText);
  const bodyVariableSequence = useWhatsapp((s) => s.bodyVariableSequence);
  const setBodyVariableSequence = useWhatsapp((s) => s.setBodyVariableSequence);
  const addVariable = useWhatsapp((s) => s.addVariable);
  const removeVariable = useWhatsapp((s) => s.removeVariable);
  const bodyVariables = useWhatsapp((s) => s.bodyVariables);
  const updateVariable = useWhatsapp((s) => s.updateVariable);
  const templateName = useWhatsapp((s) => s.templateName);
  const variableOptions = useWhatsapp((s) => s.variableOptions);
  const setVariableOptions = useWhatsapp((s) => s.setVariableOptions);
  const updateBodySequenceVariable = useWhatsapp(
    (s) => s.updateBodySequenceVariable,
  );
  const updateDisplayBodySequenceVariable = useWhatsapp(
    (s) => s.updateDisplayBodySequenceVariable,
  );
  const { addTemplateName, handleBodyTextChange } = useAddTemplate();
  const selectedLangs = useWhatsapp((s) => s.selectedLangs);
  const toggleLang = useWhatsapp((s) => s.toggleLang);

  const handleAddVariable = useCallback(() => {
    addVariable();
  }, [addVariable]);

  const handleRemoveVariable = useCallback(
    (index: number) => {
      removeVariable(index);
      const newSequence = bodyVariableSequence.filter((_, i) => i !== index);
      setBodyVariableSequence(newSequence);
    },
    [removeVariable, setBodyVariableSequence, bodyVariableSequence],
  );
  useEffect(() => {
    if (outLetType === "HOTEL") {
      setVariableOptions(defaultHotelOptions);
    } else {
      setVariableOptions(defaultData);
    }
  }, [outLetType, setVariableOptions]);

  return (
    <section className="mx-auto mb-4 w-full max-w-2xl rounded-lg bg-white p-3 shadow-md">
      <div className="mb-4">
        <label htmlFor="templateName" className="mb-2 block font-bold">
          Template Name <span className="text-red-500">*</span>
        </label>
        <div className="mb-3 rounded border px-4 py-3">
          <div className="mb-2 font-medium">Create in languages</div>
          <div>
            {["en", "hi", "te", "ta"].map((lang) => (
              <label key={lang} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedLangs.includes(lang)}
                  onChange={() => toggleLang(lang)}
                />
                <span>{lang.toUpperCase()}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="relative">
          <input
            id="templateName"
            type="text"
            value={templateName}
            maxLength={100}
            onChange={addTemplateName}
            placeholder="Enter template name"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
          <small className="absolute bottom-2 right-3 text-gray-500">
            {templateName?.length || 0}/100
          </small>
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="headerType" className="mb-2 block font-bold">
          Header (optional)
        </label>
        <div className="mb-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setHeaderType(HeaderInterface.Text)}
            className={`rounded-md px-4 py-2 ${headerType === HeaderInterface.Text
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
              }`}
          >
            📝 Text
          </button>
          <button
            type="button"
            onClick={() => setHeaderType(HeaderInterface.Image)}
            className={`rounded-md px-4 py-2 ${headerType === HeaderInterface.Image
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
              }`}
          >
            🖼️ Image or GIF
          </button>
        </div>
        {headerType === HeaderInterface.Text && (
          <div className="relative">
            <input
              id="headerText"
              type="text"
              maxLength={512}
              value={headerText}
              placeholder="Enter header text"
              onChange={(e) => {
                const trimmedValue = normalizeInput(e.target.value);
                setHeaderText(trimmedValue);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
            <small className="absolute bottom-2 right-3 text-gray-500">
              {headerText?.length || 0}/512
            </small>
          </div>
        )}
      </div>

      {headerType === HeaderInterface.Image && <ImageContent />}

      <div>
        <label htmlFor="bodyText" className="mb-2 block font-bold">
          Message Body <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <textarea
            id="bodyText"
            minLength={24}
            maxLength={1028}
            placeholder="Write your message content here"
            value={bodyText}
            onChange={handleBodyTextChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
          <small className="absolute bottom-2 right-3 text-gray-500">
            {bodyText?.length || 0}/1028
          </small>
        </div>
      </div>
      <div className="mb-4">
        <div className="mb-4 flex items-center justify-between">
          <label htmlFor="dynamicVariables" className="font-bold">
            Dynamic Variables
          </label>
          <button
            type="button"
            onClick={handleAddVariable}
            className="flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm text-white"
          >
            <BiPlus className="mr-1" /> Add Variable
          </button>
        </div>
        <div
          id="dynamicVariables"
          className="group relative space-y-3 rounded-lg bg-white transition-all"
        >
          {bodyVariables
            ? bodyVariables?.map((_, index) => (
              <div key={index?.toString()} className="flex flex-col gap-3">
                <div className="flex w-full items-center gap-3 sm:w-auto">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-900">
                    {index + 1}
                  </div>
                  <div className="relative flex-1 sm:w-64 sm:flex-none">
                    <select
                      value={bodyVariableSequence[index]}
                      onChange={(e) => {
                        const selectedOption = e.target.selectedOptions[0];
                        const label = e.target.value;
                        const value =
                          selectedOption.getAttribute("aria-valuetext") || "";

                        updateBodySequenceVariable(index, label);
                        updateDisplayBodySequenceVariable(index, value);
                        updateVariable(index, label);
                      }}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select Variable</option>
                      {variableOptions.map((option) => (
                        <option
                          key={option?.label}
                          value={option?.label}
                          aria-valuetext={option?.value}
                        >
                          {option?.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariable(index)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    aria-label="Remove variable"
                  >
                    <IoMdClose className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
            : null}
        </div>
      </div>
      <CouponContent />
    </section>
  );
};

const ContentBuilder = memo(MemoContent);
export default ContentBuilder;
