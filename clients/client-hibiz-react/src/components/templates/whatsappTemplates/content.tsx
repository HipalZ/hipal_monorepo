import { lazy, memo, useCallback } from "react";
import { BiPlus } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";
import useWhatsapp, { HeaderInterface } from "@/components/store/useWhatsapp";
import { useAddTemplate } from "@/components/helpers/whatzAppHelpers";

const ImageContent = lazy(() => import("./imageContent"));

const variableOptions = [
  {
    label: "name",
    value: "Rajesh",
  },
  {
    label: "email",
    value: "rajesh@gmail.com",
  },
  {
    label: "businessName",
    value: "business name",
  },
  {
    label: "phone",
    value: "+913456789090",
  },
  {
    label: "address",
    value: "Bangalore",
  },
  {
    label: "time",
    value: "10:00 AM",
  },
  {
    label: "date",
    value: "31st Dec, 2024",
  },
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
    updateBodySequenceVariable(0, "name");
    updateVariable(0, "Rajesh");
    setBodyVariableSequence([
      ...bodyVariableSequence,
      variableOptions?.[0]?.label,
    ]);
  }, [
    addVariable,
    setBodyVariableSequence,
    bodyVariableSequence,
    updateVariable,
    updateBodySequenceVariable,
  ]);

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
            className="w-full px-3 py-2 lowercase border border-gray-300 rounded-md"
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
          <label className="font-bold">Dynamic Variables</label>
          <button
            type="button"
            onClick={handleAddVariable}
            className="flex items-center px-3 py-2 text-sm text-white bg-blue-600 rounded-md"
          >
            <BiPlus className="mr-1" /> Add Variable
          </button>
        </div>
        <div className="relative space-y-3 transition-all bg-white rounded-lg group">
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
                          updateBodySequenceVariable(index, e.target.value);
                          updateVariable(index, e.target.value);
                        }}
                        className="block w-full px-3 py-2 pr-8 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {variableOptions.map((option) => (
                          <option key={option?.label} value={option?.value}>
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
    </section>
  );
};

const Content = memo(MemoContent);
export default Content;
