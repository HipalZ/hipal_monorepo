import MiddlePopUp from "@/components/atom/middlePopUp";
import {
    useCreateTemplate,
    useEditTemplate,
} from "@/hooks/useTemplates";
import useWhatsapp from "@/components/store/useWhatsapp";
import { memo, useState } from "react";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";

const MemoTermsAndConditions = ({ previewPayloads }) => {
    const [isAccepted, setIsAccepted] = useState(false);
    const { createTemplate } = useCreateTemplate();
    const { editTemplate } = useEditTemplate();
    const templateId = useWhatsapp((s) => s.templateId);
    const setShowSuccessPopup = useWhatsapp((s) => s.setShowSuccessPopup);
    const confirmCreate = useWhatsapp((s) => s.confirmCreate);
    const setConfirmCreate = useWhatsapp((s) => s.setConfirmCreate);
    const handleSaveAll = async () => {
        const tasks = previewPayloads.map((payload) =>
            templateId?.length > 0 ? editTemplate(payload) : createTemplate(payload)
        );
        await Promise.all(tasks);
        setShowSuccessPopup(true);
        setConfirmCreate(false);
    };

    return (
        <MiddlePopUp show={confirmCreate} onlyPopUp>
            <div className="w-full max-w-2xl overflow-hidden bg-white rounded-lg shadow-2xl">
                <div className="h-20 text-white bg-gradient-to-r from-[#075E54] to-[#25D366]">
                    <center className="h-full py-2 text-2xl font-bold text-center">
                        WhatsApp Meta Template <br />
                        <span className="text-sm">Terms and Conditions</span>
                    </center>
                </div>
                <div className="p-2">
                    <p className="flex items-center mb-4 text-gray-600">
                        <FiAlertCircle className="mr-2 text-yellow-500" />
                        Please read and accept the following terms before creating a template.
                    </p>
                    <div className="h-[250px] overflow-y-auto border rounded-lg p-4 mb-6 custom-scrollbar">
                        <div className="space-y-4">
                            <p className="font-semibold">
                                By creating a WhatsApp Meta template, you agree to the following
                                terms and conditions:
                            </p>

                            <ol className="pl-5 space-y-3 list-decimal">
                                {[
                                    "Templates can only be edited once every 24 hours. Plan carefully before making changes.",
                                    "Every new or updated template must undergo WhatsApp Meta's approval process, which may take up to 24-48 hours.",
                                    "All template content must comply with WhatsApp's Business Policy and Community Standards. Violating content may result in rejection or account suspension.",
                                    "No Promotional Content: Templates should not be used for unsolicited promotions or spam.",
                                    "Use dynamic placeholders (e.g., 1, 2) responsibly to personalize messages. They cannot contain sensitive personal data.",
                                    "Body text is limited to 1024 characters, including spaces and variables. Ensure the text remains within the specified character limits.",
                                    "Approval Process: All templates are subject to review and approval by WhatsApp before they can be used.",
                                    "Rejection: WhatsApp reserves the right to reject any template that violates its policies or guidelines. Rejected templates cannot be reused.",
                                    "Usage Limits: There may be limits on the number of templates you can create or use, based on your account type.",
                                    "Template Expiry: Unused templates may expire after a certain period. Regular use keeps them active.",
                                    "Quality Score: Your template quality score affects your ability to send messages and create new templates.",
                                    "Sending templates via WhatsApp may incur message charges based on your region and pricing plan.",
                                    "Modifications: WhatsApp may modify these terms at any time. It's your responsibility to stay informed of any changes.",
                                ].map((item, index) => (
                                    <li key={index?.toString()} className="text-gray-700">
                                        {item}
                                    </li>
                                ))}
                            </ol>

                            <p className="mt-6 font-semibold">
                                By accepting these terms, you acknowledge that you have read,
                                understood, and agree to abide by these conditions when creating
                                and using WhatsApp Meta templates.
                            </p>
                        </div>
                    </div>
                    <label className="flex items-center mx-4 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-5 h-5 text-blue-600 form-checkbox"
                            checked={isAccepted}
                            onChange={(e) => setIsAccepted(e.target.checked)}
                        />
                        <span className="ml-2 text-gray-700">
                            I accept the terms and conditions
                        </span>
                    </label>
                </div>

                <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                    <button
                        type="button"
                        onClick={() => setConfirmCreate(false)}
                        className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={async () => {
                            setConfirmCreate(false);
                            await handleSaveAll();
                        }}
                        disabled={!isAccepted}
                        className={`px-4 py-2 text-white rounded-md ${isAccepted ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
                            }`}
                    >
                        <span className="flex items-center">
                            <FiCheckCircle className="mr-2" />I Accept
                        </span>
                    </button>
                </div>
            </div>
        </MiddlePopUp>
    );
};

const TermsAndConditions = memo(MemoTermsAndConditions);
export default TermsAndConditions;
