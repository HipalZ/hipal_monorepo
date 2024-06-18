import axios from '@/axios';
import type React from 'react';
import { memo, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

interface AddPersonInDueProps {
  closeModal: () => void;
}

const AddPersonInDue: React.FC<AddPersonInDueProps> = memo(({ closeModal }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { businessId } = useParams<{ businessId: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const addPerson = async () => {
    if (inputValue.trim() === '') {
      toast.error('Please enter a name');
      return;
    }
    setIsLoading(true);

    const config = {
      method: 'POST',
      url: `/v1/payments/Create/Dues`,
      data: {
        businessId: businessId,
        duesPersonNames: inputValue,
      },
    };

    try {
      const response = await axios(config);
      if (response) {
        setInputValue('');
        toast.success('Person added successfully');
        closeModal();
      }
    } catch (error) {
      console.error('Error adding person:', error);
      toast.error('Error adding person. Please try again later.');
    }
    setIsLoading(false);
  };

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
    <div className="rounded-t-[1.5rem] bg-[#f5f5f5] p-6">
      <h3 className="mb-4 text-xl font-medium text-[#000000]">Add a new person</h3>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value.toLowerCase())}
        className="mb-2 w-full rounded border px-3 py-2 focus:border focus:border-[#000000] focus:outline-none"
        placeholder="Enter Name"
        maxLength={50}
      />
      <button
        type="button"
        onClick={addPerson}
        className={`${isLoading ? 'pointer-events-none opacity-50' : ''} on_active_bounce mx-auto mt-6 w-full rounded-lg bg-[#000000] px-4 py-2 text-white`}
      >
        {isLoading ? 'Loading...' : 'Add'}
      </button>
    </div>
  );
});

export default AddPersonInDue;
