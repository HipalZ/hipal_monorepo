import useWhatsapp from "@/components/store/useWhatsapp";
import { cn } from "@/components/utils/helper";
import { memo, useCallback } from "react";

const MemoTemplateName = () => {
  const { templateName, setTemplateName } = useWhatsapp((s) => ({
    templateName: s.templateName,
    setTemplateName: s.setTemplateName,
  }));

  const searchParams = new URLSearchParams(window.location.search);
  const templateId = searchParams.get("id");

  // Handle template name change
  const handleTemplateName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;

      // Replace spaces with underscores, remove special characters, and convert to lowercase
      const formattedInput = input
        .replace(/\s+/g, "_") // Replace spaces with underscores
        .replace(/[^a-z0-9_]/g, "") // Remove anything that is not a lowercase letter, number, or underscore
        .toLowerCase(); // Ensure everything is lowercase

      setTemplateName(formattedInput);
    },
    [],
  );
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Template Name</h2>
      <article className="mb-4">
        <label
          htmlFor="templateName"
          className="block mb-1 text-sm font-medium text-gray-700"
        >
          Name of the template{" "}
          <small className="pl-1 text-xl text-red-500">*</small>
        </label>
        <div className="relative">
          <input
            type="text"
            id="templateName"
            className={cn(
              "w-full px-3 py-2 pr-16 border border-gray-300 rounded-md",
              templateId ? "bg-gray-100" : "",
            )}
            placeholder="Enter Name of the Template"
            maxLength={512}
            value={templateName}
            onChange={handleTemplateName}
            disabled={!!templateId}
          />
          <small className="absolute bottom-3 right-4">
            {templateName?.length}/{512}
          </small>
        </div>
      </article>
    </section>
  );
};

const TemplateName = memo(MemoTemplateName);
export default TemplateName;
