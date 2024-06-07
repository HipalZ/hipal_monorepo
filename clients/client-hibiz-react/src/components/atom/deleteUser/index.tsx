import React, { memo, useEffect, useRef } from 'react';

interface DeleteConfirmationProps {
  closeModal: () => void;
  onDelete: () => Promise<void> | void;
  text?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationProps> = ({ closeModal, onDelete, text }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleFocus = () => {
      if (inputRef.current) {
        inputRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    inputRef.current?.addEventListener('focus', handleFocus);

    return () => {
      inputRef.current?.removeEventListener('focus', handleFocus);
    };
  }, []);
  return (
    <div ref={inputRef} className="rounded-t-[1.5rem] bg-[#f5f5f5] p-6 ">
      <h3 className="mb-2 text-xl font-medium text-[#2B354D]">{text}</h3>
      <p className="mb-4 pb-12 text-sm text-[#2B354D] opacity-80">This action cannot be undone.</p>

      <div className="flex justify-between space-x-6">
        <button type="button" onClick={closeModal} className="rounded-lg border border-[#2B354D] bg-white px-6 py-2 text-[#2B354D]">
          Cancel
        </button>
        <button
          type="button"
          onClick={async () => {
            await onDelete();
            closeModal();
          }}
          className="w-full rounded-lg bg-[#2B354D] px-4 py-2 text-white"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default memo(DeleteConfirmationModal);
