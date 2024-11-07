import { memo } from "react";
import { FaExclamationCircle } from "react-icons/fa";

const MemoWhyNotEditPopup = () => {
  return (
    <div className="max-w-lg p-6 mx-auto rounded-lg">
      <div className="flex items-center mb-4">
        <FaExclamationCircle className="w-6 h-6 mr-2 text-red-500" />
        <h1 className="text-xl font-semibold text-gray-900">
          Why can't I edit everything?
        </h1>
      </div>
      <ul className="space-y-4 text-base text-gray-700 list-disc list-inside">
        <li>
          WhatsApp business messages must be pre-approved by Facebook to ensure
          compliance and quality.
        </li>
        <li>
          Approval can take up to 72 hours, potentially delaying message
          delivery.
        </li>
        <li>
          To avoid delays, we offer pre-approved templates with customizable
          options.
        </li>
      </ul>
    </div>
  );
};

const WhyNotEditPopup = memo(MemoWhyNotEditPopup);
export default WhyNotEditPopup;
