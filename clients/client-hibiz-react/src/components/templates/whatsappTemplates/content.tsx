import useWhatsapp, { HeaderInterface } from "@/components/store/useWhatsapp";
import { memo } from "react";
import CallOfAction from "./callOfAction";
import { BiCross } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";
import TemplateName from "./templateName";
import ImageContent from "./imageContent";

const MemoContent = () => {
  const {
    headerType,
    setHeaderType,
    headerText,
    setHeaderText,
    bodyText,
    setBodyText,
    footerText,
    setFooterText,
    variables,
    addVariable,
    updateVariable,
    removeVariable,
  } = useWhatsapp((s) => ({
    headerType: s.headerType,
    setHeaderType: s.setHeaderType,
    headerText: s.headerText,
    setHeaderText: s.setHeaderText,
    bodyText: s.bodyText,
    setBodyText: s.setBodyText,
    footerText: s.footerText,
    setFooterText: s.setFooterText,
    variables: s.bodyVariables,
    addVariable: s.addVariable,
    updateVariable: s.updateVariable,
    removeVariable: s.removeVariable,
  }));

  return (
    <div>
      <TemplateName />
      <section>
        <h2 className="mb-1 text-xl font-semibold">Content</h2>
        <div>
          <label
            htmlFor="headerType"
            className="block mb-4 text-sm font-medium text-gray-700"
          >
            Header (optional)
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setHeaderType(HeaderInterface.None)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                headerType === HeaderInterface.None
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              None
            </button>
            <button
              type="button"
              onClick={() => setHeaderType(HeaderInterface.Text)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                headerType === HeaderInterface.Text
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              📝 Text
            </button>
            <button
              type="button"
              onClick={() => setHeaderType(HeaderInterface.Image)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                headerType === HeaderInterface.Image
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              🖼️ Image (or) GIF
            </button>
          </div>
          <article className="relative">
            <input
              maxLength={512}
              type="text"
              className="w-full px-3 py-2 pr-16 my-4 border border-gray-300 rounded-md resize-none"
              value={headerText}
              placeholder="This is the header text"
              onChange={(e) => setHeaderText(e.target.value)}
            />
            <small className="absolute bottom-6 right-3">
              {headerText?.length}/{512}
            </small>
          </article>
        </div>
        {headerType === "image" && <ImageContent />}
        <div className="mb-4">
          <label
            htmlFor="bodyText"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Body<small className="pl-1 text-xl text-red-500">*</small>
          </label>
          <div className="relative">
            <textarea
              id="bodyText"
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
              rows={4}
              maxLength={1028}
              placeholder="Please write content here"
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
            />
            <small className="absolute bottom-3 right-3">
              {bodyText?.length}/{1028}
            </small>
          </div>
          <div className="text-right">
            <button
              type="button"
              onClick={addVariable}
              className="inline-flex items-center px-3 py-2 mt-2 text-sm font-medium leading-4 text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <BiCross className="w-4 h-4 mr-2" />
              Add Variable
            </button>
          </div>
        </div>
        {variables && variables?.length > 0 ? (
          <div className="mb-4">
            <small className="block mt-2 text-yellow-600">
              ⚠️ Adding the dynamic content in variables
            </small>
          </div>
        ) : null}

        {variables && variables.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-xl font-semibold">Variables</h2>
            {variables.map((variable, index) => (
              <div key={index?.toString()} className="flex items-center mb-2">
                <span className="mr-2 text-sm font-medium text-gray-700">
                  {index + 1}
                </span>
                <input
                  type="text"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                  value={variable}
                  onChange={(e) => updateVariable(index, e.target.value)}
                  placeholder={`Variable ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeVariable(index)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  <IoMdClose className="w-5 h-5" />
                </button>
              </div>
            ))}
          </section>
        )}
        <div className="mb-4">
          <label
            htmlFor="footerText"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Footer (Optional)
          </label>
          <div className="relative">
            <input
              type="text"
              id="footerText"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              maxLength={60}
              value={footerText}
              placeholder="Powered by HipalZ"
              onChange={(e) => setFooterText(e.target.value)}
            />
            <small className="absolute bottom-2 right-4">
              {footerText?.length || 0}/{60}
            </small>
          </div>
        </div>
        <CallOfAction />
      </section>
    </div>
  );
};

const Content = memo(MemoContent);
export default Content;
