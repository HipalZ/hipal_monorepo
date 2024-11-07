import { lazy, memo } from "react";
import { BiPlus } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";
import useWhatsapp, { HeaderInterface } from "@/components/store/useWhatsapp";

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
    setBodyText,
    bodyVariableSequence,
    setBodyVariableSequence,
    addVariable,
    removeVariable,
    bodyVariables,
    updateVariable,
    setTemplateName,
  } = useWhatsapp((s) => ({
    headerType: s.headerType,
    setHeaderType: s.setHeaderType,
    headerText: s.headerText,
    setHeaderText: s.setHeaderText,
    bodyText: s.bodyText,
    setBodyText: s.setBodyText,
    footerText: s.footerText,
    setFooterText: s.setFooterText,
    bodyVariableSequence: s.bodyVariableSequence,
    setBodyVariableSequence: s.setBodyVariableSequence,
    addVariable: s.addVariable,
    removeVariable: s.removeVariable,
    bodyVariables: s.bodyVariables,
    updateVariable: s.updateVariable,
    setTemplateName: s.setTemplateName,
  }));
  const optionsForSequence = [
    "name",
    "email",
    "businessName",
    "phone",
    "address",
    "time",
    "date",
  ];
  const handleAddVariable = () => {
    addVariable();
    setBodyVariableSequence([...bodyVariableSequence, variableOptions[0]]);
  };

  const handleRemoveVariable = (index: number) => {
    removeVariable(index);
    const newSequence = bodyVariableSequence.filter((_, i) => i !== index);
    setBodyVariableSequence(newSequence);
  };

  const addTemplateName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/ /g, "_");
    const regex = /^[a-z0-9_]*$/;

    if (regex.test(value)) {
      setTemplateName(value);
    }
  };

  return (
    <section className="max-w-2xl p-3 mx-auto mb-12 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <label htmlFor="templateName" className="block mb-2 font-medium">
          Template Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="templateName"
            type="text"
            maxLength={100}
            onChange={addTemplateName}
            placeholder="Enter template name"
            className="w-full px-3 py-2 lowercase border border-gray-300 rounded-md"
          />
          <small className="absolute text-gray-500 bottom-2 right-3">
            0/100
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
            rows={4}
            maxLength={1028}
            placeholder="Write your message content here"
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
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
          <div key={index.toString()} className="mb-2 space-x-1">
            <select
              value={optionsForSequence[index]}
              onChange={(e) => updateVariable(index, e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              {variableOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Default Value"
              value={variable}
              onChange={(e) => updateVariable(index, e.target.value)}
              className="w-48 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              type="button"
              onClick={() => handleRemoveVariable(index)}
              className="px-3 py-2 text-white bg-red-600 rounded-md"
            >
              <IoMdClose />
            </button>
          </div>
        ))}
      </div>
      <CallOfAction />
    </section>
  );
};

const Content = memo(MemoContent);
export default Content;
