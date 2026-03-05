import { type ChangeEvent, memo, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import CommonBottomButton from "@/components/atoms/bottomButton";
import { useCartStore } from "@/components/store/useCartStore";
import { GiCookingPot } from "react-icons/gi";
import { MdMiscellaneousServices } from "react-icons/md";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

const MemoInstructionPopup = () => {
  const [tempInstruction, setTempInstruction] = useState("");

  const openInstructionModal = useCartStore((s) => s.openInstructionModal);
  const setOpenInstructionModal = useCartStore((s) => s.setOpenInstructionModal);
  const setInstruction = useCartStore((s) => s.setInstruction);
  const addInstructionToDish = useCartStore((s) => s.addInstructionToDish);
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);

  const isOtherOutlet = outletInfo?.outLetType === "OTHER";

  const handleCloseInstructionModal = useCallback(() => {
    setOpenInstructionModal(false);
    setTempInstruction("");
  }, [setOpenInstructionModal]);

  const handleSaveInstruction = useCallback(() => {
    addInstructionToDish(tempInstruction);
    setInstruction(tempInstruction);
    setOpenInstructionModal(false);
    setTempInstruction("");
  }, [addInstructionToDish, setInstruction, setOpenInstructionModal, tempInstruction]);

  const handleInstructionText = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setTempInstruction(e.target.value.replace(/\s+/g, " "));
  }, []);

  // 1. Guard clause: If modal is closed or we're not in a browser, render nothing
  if (!openInstructionModal || typeof document === "undefined") return null;

  const content = {
    icon: isOtherOutlet ? MdMiscellaneousServices : GiCookingPot,
    title: isOtherOutlet ? "Service Instructions" : "Cooking Instructions",
    description: isOtherOutlet
      ? "Add any special service instructions or preferences."
      : "Add any special cooking instructions (e.g., less spicy).",
    placeholder: "Enter instructions here...",
  };

  const IconComponent = content.icon;

  // 2. Portal directly to document.body
  return createPortal(
    <BottomPopUp
      height="50dvh"
      show={openInstructionModal}
      onClose={handleCloseInstructionModal}
      className="z-[9999]" // High Z-index ensures it sits on top of the Cart popup
    >
      <div className="p-4 pb-10">
        <header className="flex items-center gap-2 mb-4">
          <IconComponent className="w-8 h-8 text-orange-500" />
          <h2 className="text-2xl font-semibold text-black">{content.title}</h2>
        </header>

        <p className="mb-6 text-gray-600 text-sm">{content.description}</p>

        <div className="relative mb-8">
          <textarea
            value={tempInstruction}
            onChange={handleInstructionText}
            maxLength={100}
            autoFocus
            className="w-full min-h-[140px] p-3 text-base text-black bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500"
          />
          <span className="absolute text-xs text-gray-400 right-3 bottom-3">
            {tempInstruction.length}/100
          </span>
        </div>

        <CommonBottomButton
          buttons={[{
            text: "Save Instruction",
            onClick: handleSaveInstruction,
            type: "button",
            disable: tempInstruction.trim().length === 0,
            className: "w-full bg-orange-500 text-white py-4 rounded-xl font-bold",
          }]}
        />
      </div>
    </BottomPopUp>,
    document.body
  );
};

const InstructionPopup = memo(MemoInstructionPopup);
export default InstructionPopup;