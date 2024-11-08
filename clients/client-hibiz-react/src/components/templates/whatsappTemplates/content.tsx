import { lazy, memo, useCallback } from "react";
import { BiPlus } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";
import useWhatsapp, { HeaderInterface } from "@/components/store/useWhatsapp";
import { useAddTemplate } from "@/components/helpers/whatzAppHelpers";

const CallOfAction = lazy(() => import("./callOfAction"));
const ImageContent = lazy(() => import("./imageContent"));

const variableOptions = [
  "name",
  "email",
  "businessName",
  "phone",
  "address",
  "time",
  "date",
];

const MemoContent = () => {
  const {
    headerType,
    setHeaderType,
    headerText,
    setHeaderText,
    bodyText,
    bodyVariableSequence,
    setBodyVariableSequence,
    addVariable,
    removeVariable,
    bodyVariables,
    updateVariable,
    templateName,
    updateBodySequenceVariable,
  } = useWhatsapp((s) => ({
    headerType: s.headerType,
    setHeaderType: s.setHeaderType,
    headerText: s.headerText,
    setHeaderText: s.setHeaderText,
    bodyText: s.bodyText,
    footerText: s.footerText,
    setFooterText: s.setFooterText,
    bodyVariableSequence: s.bodyVariableSequence,
    setBodyVariableSequence: s.setBodyVariableSequence,
    addVariable: s.addVariable,
    removeVariable: s.removeVariable,
    bodyVariables: s.bodyVariables,
    updateVariable: s.updateVariable,
    templateName: s.templateName,
    updateBodySequenceVariable: s.updateBodySequenceVariable,
  }));
  const { addTemplateName, handleBodyTextChange } = useAddTemplate();

  const handleAddVariable = useCallback(() => {
    addVariable();
    setBodyVariableSequence([...bodyVariableSequence, variableOptions[0]]);
  }, [addVariable, setBodyVariableSequence, bodyVariableSequence]);

  const handleRemoveVariable = useCallback(
    (index: number) => {
      removeVariable(index);
      const newSequence = bodyVariableSequence.filter((_, i) => i !== index);
      setBodyVariableSequence(newSequence);
    },
    [removeVariable, setBodyVariableSequence, bodyVariableSequence],
  );

  return (
    <section className="w-full max-w-2xl p-3 mx-auto mb-4 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <label htmlFor="templateName" className="block mb-2 font-medium">
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
            className="w-full px-3 py-2 lowercase border border-gray-300 rounded-md"
          />
          <small className="absolute text-gray-500 bottom-2 right-3">
            {templateName?.length || 0}/100
          </small>
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="headerType" className="block mb-2 font-medium">
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
              onChange={(e) => setHeaderText(e.target.value)}
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
        <label htmlFor="bodyText" className="block mb-2 font-medium">
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
          <label className="font-medium">Dynamic Variables</label>
          <button
            type="button"
            onClick={handleAddVariable}
            className="flex items-center px-3 py-1 text-sm text-white bg-blue-600 rounded-md"
          >
            <BiPlus className="mr-1" /> Add Variable
          </button>
        </div>
        {bodyVariables.map((variable, index) => (
          <div
            key={index.toString()}
            className="flex flex-col items-start p-3 space-y-2 bg-white rounded-md shadow-sm sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2"
          >
            <select
              value={bodyVariableSequence[index]}
              onChange={(e) =>
                updateBodySequenceVariable(index, e.target.value)
              }
              className="w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select variable</option>
              {variableOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder={`Enter ${
                bodyVariableSequence[index] || "variable"
              } value`}
              value={variable}
              onChange={(e) => updateVariable(index, e.target.value)}
              className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => handleRemoveVariable(index)}
              className="w-full px-3 py-2 text-white transition-colors bg-red-500 rounded-md sm:w-auto hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Remove variable"
            >
              <IoMdClose className="inline-block mr-1" />
              <span className="sm:hidden">Remove</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

const Content = memo(MemoContent);
export default Content;
