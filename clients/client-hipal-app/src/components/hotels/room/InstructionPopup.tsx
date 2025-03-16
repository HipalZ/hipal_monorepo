import React, { type ChangeEvent, useCallback, useState } from 'react'
import BottomPopUp from "@/components/atoms/bottomPopUp";
import CommonBottomButton from "@/components/atoms/bottomButton";
import { useCartStore } from '@/components/store/useCartStore';
import { GiCookingPot } from 'react-icons/gi';

const InstructionPopup = () => {
    const [tempInstruction, setTempInstruction] = useState("");
    const {
        openInstructionModal,
        setOpenInstructionModal,
        setInstruction,
        addInstructionToDish
    } = useCartStore();
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
            const sanitizedValue = value.replace(/\s+/g, ' ');
            setTempInstruction(sanitizedValue);
        },
        []
    );
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
                            <GiCookingPot className="w-8 h-8 text-orange-500" />
                            <h2 className="text-2xl font-semibold text-black">Cooking Instructions</h2>
                        </header>

                        {/* Description */}
                        <p className="mb-6 text-gray-600">
                            Add any special cooking instructions, like less spicy, extra cheese, or no onions.
                        </p>

                        {/* Textarea Container */}
                        <div className="relative mb-8">
                            <textarea
                                value={tempInstruction}
                                onChange={handleInstructionText}
                                maxLength={100}
                                placeholder="Enter your cooking instructions here..."
                                className="w-full min-h-[120px] p-2 text-base text-black bg-white rounded-lg border border-gray-200 
                                focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500
                                placeholder:text-gray-400 resize-none"
                                aria-label="Cooking instructions"
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
    )
}

export default InstructionPopup