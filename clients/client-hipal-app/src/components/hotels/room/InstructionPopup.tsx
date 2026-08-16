import ClientPortal from '@/components/atoms/portal/ClientPortal';
import { _useAllBusiness } from '@/components/store/useAllBusiness';
import { useCartStore } from '@/components/store/useCartStore';
import { type ChangeEvent, memo, useCallback, useState } from 'react';
import { GiCookingPot } from 'react-icons/gi';
import { MdMiscellaneousServices } from 'react-icons/md';

const MemoInstructionPopup = () => {
  const [tempInstruction, setTempInstruction] = useState('');

  const openInstructionModal = useCartStore((s) => s.openInstructionModal);
  const setOpenInstructionModal = useCartStore((s) => s.setOpenInstructionModal);
  const setInstruction = useCartStore((s) => s.setInstruction);
  const addInstructionToDish = useCartStore((s) => s.addInstructionToDish);
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);

  const isOtherOutlet = outletInfo?.outLetType === 'OTHER';

  const handleCloseInstructionModal = useCallback(() => {
    setOpenInstructionModal(false);
    setTempInstruction('');
  }, [setOpenInstructionModal]);

  const handleSaveInstruction = useCallback(() => {
    addInstructionToDish(tempInstruction);
    setInstruction(tempInstruction);
    setOpenInstructionModal(false);
    setTempInstruction('');
  }, [addInstructionToDish, setInstruction, setOpenInstructionModal, tempInstruction]);

  const handleInstructionText = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setTempInstruction(e.target.value.replace(/\s+/g, ' '));
  }, []);

  if (!openInstructionModal) return null;

  const content = {
    icon: isOtherOutlet ? MdMiscellaneousServices : GiCookingPot,
    title: isOtherOutlet ? 'Service Instructions' : 'Cooking Instructions',
    description: isOtherOutlet ? 'Add any special service instructions or preferences.' : 'Add any special cooking instructions (e.g., less spicy).',
    placeholder: 'Enter instructions here...',
  };

  const IconComponent = content.icon;

  return (
    <ClientPortal>
      <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/35 backdrop-blur-sm" onClick={handleCloseInstructionModal}>
        <section className="w-full max-w-md rounded-t-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="p-4">
            <header className="mb-4 flex items-center gap-2">
              <IconComponent className="h-8 w-8 text-orange-500" />
              <h2 className="text-2xl font-semibold text-black">{content.title}</h2>
            </header>

            <p className="mb-6 text-sm text-gray-600">{content.description}</p>

            <div className="relative mb-8">
              <textarea
                value={tempInstruction}
                onChange={handleInstructionText}
                maxLength={100}
                autoFocus
                placeholder={content.placeholder}
                className="min-h-[140px] w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-base text-black focus:border-orange-500 focus:outline-none"
              />
              <span className="absolute bottom-3 right-3 text-xs text-gray-400">{tempInstruction.length}/100</span>
            </div>

            <div className="grid grid-cols-[0.8fr_1.2fr] gap-3 pb-3">
              <button
                type="button"
                onClick={handleCloseInstructionModal}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveInstruction}
                disabled={tempInstruction.trim().length === 0}
                className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Save Instruction
              </button>
            </div>
          </div>
        </section>
      </div>
    </ClientPortal>
  );
};

const InstructionPopup = memo(MemoInstructionPopup);
export default InstructionPopup;
