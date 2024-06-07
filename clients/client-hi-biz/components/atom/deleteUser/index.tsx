import { UserProfile } from "@/components/types/businessData";
import React, { memo, useEffect, useRef } from "react";

interface DeleteConfirmationProps {
  closeModal: () => void;
  onDelete: () => Promise<void> | void;
  text?: string
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationProps> = ({
  closeModal,
  onDelete,
  text,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleFocus = () => {
      if (inputRef.current) {
        inputRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    inputRef.current?.addEventListener("focus", handleFocus);

    return () => {
      inputRef.current?.removeEventListener("focus", handleFocus);
    };
  }, []);
  return (
    <div ref={inputRef} className="bg-[#f5f5f5] p-6 rounded-t-[1.5rem] ">
      <h3 className="text-xl mb-2 font-medium text-[#2B354D]">
        {text}
      </h3>
      <p className="text-sm mb-4 opacity-80 text-[#2B354D] pb-12">
        This action cannot be undone.
      </p>

      <div className="flex justify-between space-x-6">
        <button
          type="button"
          onClick={closeModal}
          className="bg-white border border-[#2B354D] text-[#2B354D] px-6 py-2 rounded-lg"
        >
          Cancel
        </button>
        <button
        type="button"
          onClick={async () => {
            await onDelete();
            closeModal();
          }}
          className="bg-[#2B354D] w-full text-white px-4 py-2 rounded-lg"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default memo(DeleteConfirmationModal);
