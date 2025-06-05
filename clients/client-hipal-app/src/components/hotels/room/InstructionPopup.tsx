import { type ChangeEvent, memo, useCallback, useState } from "react";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import CommonBottomButton from "@/components/atoms/bottomButton";
import { useCartStore } from "@/components/store/useCartStore";
import { GiCookingPot } from "react-icons/gi";
import { MdMiscellaneousServices } from "react-icons/md";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

const MemoInstructionPopup = () => {
  const [tempInstruction, setTempInstruction] = useState("");

  const openInstructionModal = useCartStore((s) => s.openInstructionModal);
  const setOpenInstructionModal = useCartStore(
    (s) => s.setOpenInstructionModal,
  );
  const setInstruction = useCartStore((s) => s.setInstruction);
  const addInstructionToDish = useCartStore((s) => s.addInstructionToDish);
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);

  const isOtherOutlet = outletInfo.outLetType === "OTHER";

  const handleCloseInstructionModal = useCallback(() => {
    setOpenInstructionModal(!openInstructionModal);
    setTempInstruction("");
  }, [setOpenInstructionModal, openInstructionModal]);

  const handleSaveInstruction = useCallback(() => {
    addInstructionToDish(tempInstruction);
    setInstruction(tempInstruction);
    setOpenInstructionModal(false);
    setTempInstruction("");
  }, [
    addInstructionToDish,
    setInstruction,
    setOpenInstructionModal,
    tempInstruction,
  ]);

  const handleInstructionText = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      const sanitizedValue = value.replace(/\s+/g, " ");
      setTempInstruction(sanitizedValue);
    },
    [],
  );

  // Content configuration based on outlet type
  const content = {
    icon: isOtherOutlet ? MdMiscellaneousServices : GiCookingPot,
    title: isOtherOutlet ? "Service Instructions" : "Cooking Instructions",
    description: isOtherOutlet
      ? "Add any special service instructions or preferences for your order."
      : "Add any special cooking instructions, like less spicy, extra cheese, or no onions.",
    placeholder: isOtherOutlet
      ? "Enter your service instructions here..."
      : "Enter your cooking instructions here...",
    ariaLabel: isOtherOutlet ? "Service instructions" : "Cooking instructions",
  };

  const IconComponent = content.icon;

  return (
    <>
      {openInstructionModal && (
        <BottomPopUp
          height="50dvh"
          show={openInstructionModal}
          onClose={handleCloseInstructionModal}
        >
          <div className="p-3 pb-8 overflow-y-auto">
            {/* Header */}
            <header className="flex items-center gap-2 mb-4">
              <IconComponent className="w-8 h-8 text-orange-500" />
              <h2 className="text-2xl font-semibold text-black">
                {content.title}
              </h2>
            </header>

            {/* Description */}
            <p className="mb-6 text-gray-600">{content.description}</p>

            {/* Textarea Container */}
            <div className="relative mb-8">
              <textarea
                value={tempInstruction}
                onChange={handleInstructionText}
                maxLength={100}
                placeholder={content.placeholder}
                className="w-full min-h-[120px] p-2 text-base text-black bg-white rounded-lg border border-gray-200 
                                focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500
                                placeholder:text-gray-400 resize-none"
                aria-label={content.ariaLabel}
              />
              <span className="absolute text-sm text-gray-400 right-3 bottom-3">
                {tempInstruction.length || 0}/{100}
              </span>
            </div>

            {/* Save Button */}
            <CommonBottomButton
              buttons={[
                {
                  text: "Save Instruction",
                  onClick: handleSaveInstruction,
                  type: "button",
                  disable: tempInstruction?.length === 0,
                  className: "w-full",
                },
              ]}
            />
          </div>
        </BottomPopUp>
      )}
    </>
  );
};

const InstructionPopup = memo(MemoInstructionPopup);
export default InstructionPopup;
