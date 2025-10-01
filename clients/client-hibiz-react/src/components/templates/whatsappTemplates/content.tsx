import { lazy, memo, useCallback, useEffect } from "react";
import { BiPlus } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";
import useWhatsapp, { HeaderInterface } from "@/components/store/useWhatsapp";
import {
  normalizeInput,
  useAddTemplate,
} from "@/components/helpers/whatzAppHelpers";
import useBusinessData from "@/components/store/useBusinessData";

const CouponContent = lazy(() => import("./couponContent"));
const ImageContent = lazy(() => import("./imageContent"));

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
    <section className="w-full max-w-2xl p-3 mx-auto mb-4 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <label htmlFor="templateName" className="block mb-2 font-bold">
          Template Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="templateName"
            type="text"
            value={templateName}
            maxLength={100}
            onChange={addTemplateName}
            placeholder="Enter template name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <small className="absolute text-gray-500 bottom-2 right-3">
            {templateName?.length || 0}/100
          </small>
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="headerType" className="block mb-2 font-bold">
          Header (optional)
        </label>
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            type="button"
            onClick={() => setHeaderType(HeaderInterface.Text)}
            className={`px-4 py-2 rounded-md ${
              headerType === HeaderInterface.Text
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            📝 Text
          </button>
          <button
            type="button"
            onClick={() => setHeaderType(HeaderInterface.Image)}
            className={`px-4 py-2 rounded-md ${
              headerType === HeaderInterface.Image
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <small className="absolute text-gray-500 bottom-2 right-3">
              {headerText?.length || 0}/512
            </small>
          </div>
        )}
      </div>

      {headerType === HeaderInterface.Image && <ImageContent />}

      <div>
        <label htmlFor="bodyText" className="block mb-2 font-bold">
          Message Body <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <textarea
            id="bodyText"
            rows={5}
            minLength={24}
            maxLength={1028}
            placeholder="Write your message content here"
            value={bodyText}
            onChange={handleBodyTextChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
          />

          <small className="absolute text-gray-500 bottom-2 right-3">
            {bodyText?.length || 0}/1028
          </small>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <label htmlFor="dynamicVariables" className="font-bold">
            Dynamic Variables
          </label>
          <button
            type="button"
            onClick={handleAddVariable}
            className="flex items-center px-3 py-2 text-sm text-white bg-blue-600 rounded-md"
          >
            <BiPlus className="mr-1" /> Add Variable
          </button>
        </div>
        <div
          id="dynamicVariables"
          className="relative space-y-3 transition-all bg-white rounded-lg group"
        >
          {bodyVariables
            ? bodyVariables?.map((_, index) => (
                <div key={index?.toString()} className="flex flex-col gap-3">
                  <div className="flex items-center w-full gap-3 sm:w-auto">
                    <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-gray-900 bg-gray-100 rounded-full shrink-0">
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
                        className="block w-full px-3 py-2 pr-8 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                      className="inline-flex items-center justify-center text-red-600 transition-colors rounded-lg h-9 w-9 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      aria-label="Remove variable"
                    >
                      <IoMdClose className="w-5 h-5" />
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

const Content = memo(MemoContent);
export default Content;
