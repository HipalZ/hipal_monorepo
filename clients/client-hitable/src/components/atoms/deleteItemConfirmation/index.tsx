import type React from 'react';
import { memo, useEffect, useRef } from 'react';

interface DeleteConfirmationProps {}

const DeleteConfirmationModal: React.FC<DeleteConfirmationProps> = ({}) => {
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
    <div ref={inputRef} className="bg-secondary rounded-t-[1.5rem] p-6 ">
      <h3 className="mb-2 text-xl font-medium text-[#2B354D]">Do you want to delete ?</h3>
      <p className="mb-4 pb-12 text-sm text-[#2B354D] opacity-80">This action cannot be undone.</p>
    </div>
  );
};

export default memo(DeleteConfirmationModal);
